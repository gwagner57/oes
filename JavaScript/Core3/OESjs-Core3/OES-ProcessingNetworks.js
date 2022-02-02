/*******************************************************************************
 * This library file contains OES Processing Network foundation elements
 * @copyright Copyright 2021 Gerd Wagner, BTU (Germany)
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

/******************************************************************************
 *** Processing Network Package ***********************************************
 ******************************************************************************/
/**
 * Processing Objects are generic objects that arrive at an entry node of a PN
 * and are processed at one or more processing nodes before they leave the
 * PN at an exit node.
 */
class pROCESSINGoBJECT extends oBJECT {
  constructor({id, name, arrivalTime}) {
    super( id, name);
    this.arrivalTime = arrivalTime;
  }
  // overwrite/improve the standard toString method
  toString() {
    return ""; // "procObj-"+ (this.name||this.id)
  }
}

/**
 * Arrival events are exogenous events (or "start events") that introduce a
 * processing object to the simulated system (by creating it as a new object).
 * They may define a quantity of arrived processing objects, which is 1 by default.
 * Viewing an arrival not as an arrival of processing objects, but as an arrival of
 * a customer order, the quantity attribute would allow to define an order quantity
 * that results in the same quantity of processing objects, e.g., in the sense of
 * production orders.
 */
class aRRIVAL extends eVENT {
  constructor({occTime, delay, node, quantity}) {
    super({occTime, delay, node});
    if (quantity) this.quantity = quantity;
  }
  onEvent() {
    var followupEvents=[];
    const nmrOfArrivedObjects = this.quantity || 1,
        arrivedObjects=[];
    // define the type of processing object
    const ProcessingObject = this.node.outputTypeName ?
        sim.Classes[this.node.outputTypeName] : pROCESSINGoBJECT;
    // create newly arrived processing object(s)
    for (let i=0; i < nmrOfArrivedObjects; i++) {
      const procObj = new ProcessingObject({arrivalTime: this.occTime});
      arrivedObjects.push( procObj);
    }
    this.arrivedObject = arrivedObjects[0];
    // update statistics
    sim.stat.networkNodes[this.node.name].nmrOfArrivedObjects += nmrOfArrivedObjects;
    this.node.nmrOfArrivedObjects += nmrOfArrivedObjects;
    // invoke onArrival event rule method
    if (typeof this.node.onArrival === "function") followupEvents = this.node.onArrival();
    // schedule successor activity/activities
    if (this.node.successorNodeName) {
      const succNodeName = typeof this.node.successorNodeName === "function" ?
          this.node.successorNodeName() : this.node.successorNodeName;
      const succNode = sim.scenario.networkNodes[succNodeName];
      const SuccAT = succNode.activityTypeName ?
          sim.Classes[succNode.activityTypeName] : pROCESSINGaCTIVITY;
      for (const procObj of arrivedObjects) {
        // enqueue newly arrived object(s) into the inputBuffer of the next node
        succNode.enqueueProcessingObject( procObj);
        const succActy = new SuccAT({node: succNode, processingObject: procObj});
        // schedule successor activity
        succActy.startOrEnqueue();
      }
    } else {  // multiple successor nodes
      const succNodeNames=[];
      for (const sN of Object.keys( this.node.successorNodeNames)) {
        // evaluate the condition provided by the successorNodeNames map
        if (this.node.successorNodeNames[sN]()) succNodeNames.push( sN);
      }
      //TODO: schedule successor activities, but what about moving the processing object(s)?
    }
    return followupEvents;
  }
  recurrence() {
    var delay=0;
    // has an arrival recurrence function been defined for the entry node?
    if (typeof this.node.eventRecurrence === "function") {
      delay = this.node.eventRecurrence();
    } else if (this.node.eventRate) {  // = arrival rate
      delay = rand.exponential( this.node.eventRate);
    } else {  // use the default recurrence
      delay = aRRIVAL.defaultRecurrence();
    }
    return delay;
  }
  createNextEvent() {
    var arrEvt=null;
    if (!this.node.maxNmrOfEvents ||
        this.node.nmrOfArrivedObjects < this.node.maxNmrOfEvents) {
      arrEvt = new aRRIVAL({delay: this.recurrence(), node: this.node});
      if (this.node.arrivalQuantity) {
        arrEvt.quantity = typeof this.node.arrivalQuantity === "function" ?
            this.node.arrivalQuantity() : this.node.arrivalQuantity;
      }
    }
    return arrEvt;
  }
  toString() {
    const decPl = oes.defaults.simLogDecimalPlaces,
        evtName = "Arrival"+ (this.arrivedObject ? "-"+ this.arrivedObject.id : "");
    return `${evtName}@${math.round(this.occTime,decPl)}`;
  }
}
// define the exponential distribution as the default inter-arrival time
aRRIVAL.defaultEventRate = 1;
aRRIVAL.defaultRecurrence = function () {
  return rand.exponential( aRRIVAL.defaultEventRate);
};
/**
 * An arrival event node definition may include (1) a
 * "maxNmrOfArrivals" attribute slot for defining a maximum number of arrival
 * events after which no more arrival events will be created (and, consequently,
 * the simulation may run out of future events); (2) either an "arrivalRate"
 * attribute slot for defining the event rate parameter of an exponential PDF
 * used for computing the time between two consecutive arrival events, or a per-
 * instance-defined "arrivalRecurrence" method slot for computing the recurrence
 * of arrival events; (3) a per-instance-defined "outputType" slot for defining
 * a custom output type (instead of the default "pROCESSINGoBJECT"). If neither an
 * "arrivalRate" nor an "arrivalRecurrence" method are defined, the exponential
 * distribution with an event rate of 1 is used as a default recurrence.
 *
 * An arrival event node may have an "onArrival" event rule method.
 *
 * An arrival event node has a built-in (read-only) statistics attribute "nmrOfArrivedObjects"
 * for counting the number of objects that have arrived at this node.
 *
 * TODO: If no successor node is defined for an arrival event node, an output queue is
 * automatically created.
 */
class aRRIVALeVENTnODE extends eVENTnODE {
  constructor({id, name, arrivalRate, arrivalRecurrence,
                maxNmrOfArrivals, arrivalQuantity,
                successorNodeName, successorNodeNames, outputTypeName}) {
    super( {id, name, eventTypeName:"aRRIVAL", eventRate: arrivalRate,
      eventRecurrence: arrivalRecurrence, maxNmrOfEvents: maxNmrOfArrivals,
      successorNodeName, successorNodeNames
    });
    // a fixed quantity or an expression
    if (arrivalQuantity) this.arrivalQuantity = arrivalQuantity;
    // a special processing object type extending pROCESSINGoBJECT
    if (outputTypeName) this.outputTypeName = outputTypeName;
    // statistics
    this.nmrOfArrivedObjects = 0;
  }
}
/**
 * The definition of an entry node combines defining both an arrival event node and
 * an associated (possibly spatial) entry station object.
 */
class eNTRYnODE extends aRRIVALeVENTnODE {
  constructor({id, name, arrivalRate, arrivalRecurrence, maxNmrOfArrivals,
                arrivalQuantity, successorNodeName, successorNodeNames,
                outputTypeName, position}) {
    super( {id, name, arrivalRate, arrivalRecurrence,
        maxNmrOfArrivals, arrivalQuantity,
        successorNodeName, successorNodeNames, outputTypeName
    });
    // a position in space
    if (position) this.position = position;
  }
}

/**
 * Processing Activities are activities that have inputs and outputs and are
 * performed at a processing node (being a resource). Their properties
 * (in particular, their resource roles and duration) are defined within
 * the definition of their processing node.
 */
class pROCESSINGaCTIVITY extends aCTIVITY {
  constructor({id, occTime, duration, enqueueTime, node, processingObject, predecessorActivity}) {
    super({id, occTime, duration, enqueueTime, node});
    if (processingObject) this.processingObject = processingObject;
    // needed for the deferred release of resources
    if (predecessorActivity) this.predecessorActivity = predecessorActivity;
  }
  performDeferredReleaseOfResources() {
    const node = this.node,
        resourceRoles = node?.resourceRoles ?? this.constructor.resourceRoles,
        resRoleNames = Object.keys( resourceRoles);
    for (const resRoleName of resRoleNames) {
      const resRole = resourceRoles[resRoleName];
      if (resRole.deferredRelease) {
        if (resRole.countPoolName) {
          // release the used number of count pool resources
          resRole.resourcePool.release( resRole.card);
        } else {
          const resObj = this[resRoleName];
          if (resObj) {
            // release the used individual resource
            if (resRole.resourcePool) {  // a node/resRole-specific pool
              resRole.resourcePool.release( resObj);
            } else {  // a pool associated with the resource type (=range)
              resRole.range.resourcePool.release( resObj);
            }
          }
        }
      }
    }
  }
}
// define the exponential PDF as the default duration random variable
pROCESSINGaCTIVITY.meanDuration = 1;
pROCESSINGaCTIVITY.duration = () =>
    rand.exponential( 1/pROCESSINGaCTIVITY.meanDuration);

class pROCESSINGaCTIVITYsTART extends aCTIVITYsTART {
  constructor({occTime, delay, plannedActivity}) {
    super({occTime, delay, plannedActivity});
  }
  onEvent() {
    const acty = this.plannedActivity,
          node = acty.node, followupEvents=[];
    if (node.inputBuffer.length===0) {
      console.log(`ProcessingActivityStart with empty input buffer at ${node.name} at step ${sim.step}`);
      return;
    }
    // move proc. obj. from input buffer to WiP
    node.dequeueProcessingObject();
    // invoke event routine of aCTIVITYsTART
    followupEvents.push(...super.onEvent());
    // take care of the deferred release of resources
    if (acty.predecessorActivity) {
      acty.predecessorActivity.performDeferredReleaseOfResources();
    }
    return followupEvents;
  }
  toString() {
    const decPl = oes.defaults.simLogDecimalPlaces,
        acty = this.plannedActivity, AT = acty.constructor,
        resRoles = acty.node.resourceRoles,
        evtName = acty.node.name +"Start-"+ acty.processingObject.id;
    var evtStr="", slotListStr="";
    for (const resRoleName of Object.keys( resRoles)) {
      if (resRoleName !== acty.node.name +"-ProcStation" && resRoles[resRoleName].range) {
        const resObj = acty[resRoleName];
        let resObjStr = "";
        if (Array.isArray( resObj)) {
          resObjStr = resObj.map( o => o.name || String(o.id)).toString();
        } else {
          resObjStr = resObj.name || String(resObj.id);
        }
        if (resObjStr) slotListStr += resObjStr +", ";
      }
    }
    evtStr = slotListStr ? `${evtName}{ ${slotListStr}}` : evtName;
    return `${evtStr}@${math.round(this.occTime,decPl)}`;
  }
}
class pROCESSINGaCTIVITYeND extends aCTIVITYeND {
  constructor({occTime, delay, activity}) {
    super({occTime, delay, activity});
  }
  onEvent() {
    const acty = this.activity,
        node = acty.node,
        resourceRoles = node?.resourceRoles ?? AT.resourceRoles,
        resRoleNames = Object.keys( resourceRoles),
        followupEvents=[];
    let succActy=null;

    // invoke event routine of aCTIVITYeND
    followupEvents.push(...super.onEvent());

    const succNode = node.getSuccessorNode();
    if (succNode) {
      if (succNode instanceof pROCESSINGaCTIVITYnODE) {
        let SuccAT=null;
        if (succNode.activityTypeName) {
          SuccAT = sim.Classes[succNode.activityTypeName];
        } else {
          SuccAT = pROCESSINGaCTIVITY;
        }
        succActy = new SuccAT({
            node: succNode, processingObject: acty.processingObject});
        // only create a predecessorActivity slot, if some resource has a deferredRelease
        if (resRoleNames.some( resRoleName => resourceRoles[resRoleName].deferredRelease)) {
          succActy.predecessorActivity = acty;
        }
        const succResRoles = succNode.resourceRoles ?? SuccAT.resourceRoles;
        // By default, keep resources that are shared between AT and SuccAT
        for (const resRoleName of resRoleNames) {
          if (succResRoles[resRoleName]) {  // shared resource role
            succActy.resRoleNamesSharedWithPredActivity ??= [];
            succActy.resRoleNamesSharedWithPredActivity.push( resRoleName);
            if (typeof acty[resRoleName] === "object") {
              // transfer/re-allocate individual resource to successor activity
              succActy[resRoleName] = acty[resRoleName];
            } else {
              succActy[resRoleName] = true;  // keep anonymous countpool resource
            }
          }
        }
        if (succNode.inputBuffer.length < succNode.inputBuffer.capacity) {
          // remove processing object from WiP
          node.workInProgress.delete( acty.processingObject);
          // enqueue processing object in the successor node's input buffer
          succNode.enqueueProcessingObject( acty.processingObject);
          // start or enqueue a successor activity according to the PN model
          succActy.startOrEnqueue();
          //TODO: needed?
          //unloaded = true;
        } else {  // succNode.inputBuffer is full
          node.blockedSuccessorTasks.enqueue( succActy)
        }
      } else if (succNode instanceof dEPARTUREeVENTnODE) {
        // remove processing object from WiP
        node.workInProgress.delete( acty.processingObject);
        followupEvents.push( new dEPARTURE({node: succNode,
          processingObject: acty.processingObject}));
      }
    }
    // release all non-transferred resources of acty
    acty.releaseResources( succActy?.resRoleNamesSharedWithPredActivity);
    // update statistics
    node.nmrOfDepartedObjects++;
    // if there are still planned activities in the task queue
    if (node.tasks.length > 0) {
      // if available, allocate required resources and create next activity
      node.ifAvailAllocReqResAndStartNextActivity();
    }
    return followupEvents;
  }
  toString() {
    const decPl = oes.defaults.simLogDecimalPlaces,
        acty = this.activity,
        resRoles = acty.node.resourceRoles,
        evtName = acty.node.name +"End-"+ acty.processingObject.id;
    var evtStr="", slotListStr="";
    for (const resRoleName of Object.keys( resRoles)) {
      if (resRoleName !== acty.node.name +"-ProcStation" && resRoles[resRoleName].range) {
        const resObj = acty[resRoleName];
        let resObjStr = "";
        if (Array.isArray( resObj)) {
          resObjStr = resObj.map( o => o.name || String(o.id)).toString();
        } else {
          resObjStr = resObj.name || String(resObj.id);
        }
        if (resObjStr) slotListStr += resObjStr +", ";
      }
    }
    evtStr = slotListStr ? `${evtName}{ ${slotListStr}}` : evtName;
    return `${evtStr}@${math.round(this.occTime,decPl)}`;
  }
}

/*
 * A processing activity node has an input buffer for incoming processing objects.
 * Processing objects may be either of a generic default type "pROCESSINGoBJECT"
 * or of a model-specific subtype of "pROCESSINGoBJECT" (such as "Customer").
 *
 * A processing activity node has a "processingDuration" in the form of a fixed value
 * or a (random variable) function expression, applying to its processing activities.
 * If no "processingDuration" is defined, the exponential distribution with an event
 * rate of 1 is used as a default function for sampling processing durations.
 * 
 * In the case of a transformation activity, a processing activity node may have several input object types,
 * and an input buffer for each of them, and either a successor processing node or
 * else an (automatically generated) output buffer for each type of output object.
 * By default, when no explicit transformation of inputs to outputs is modeled by
 * specifying an outputTypes map, there is no transformation and it holds that
 * outputs = inputs.
 */
class pROCESSINGaCTIVITYnODE extends aCTIVITYnODE {
  constructor({id, name, activityTypeName, resourceRoles={}, processingDuration, waitingTimeout,
               inputBufferCapacity, inputTypeName, inputTypes, status=1,
                successorNodeName, successorNodeNames, outputTypes}) {
    super( {id: id||name, name, activityTypeName, resourceRoles, duration: processingDuration, waitingTimeout,
            successorNodeName, successorNodeNames});
    if (inputBufferCapacity) this.inputBufferCapacity = inputBufferCapacity;
    // user-defined type of processing objects
    if (inputTypeName) {
      if (!sim.Classes[inputTypeName]) throw Error(`No class registered for ${inputTypeName}`);
      this.inputType = sim.Classes[inputTypeName];
    }
    // Ex: {"lemons": {type:"Lemon", quantity:2}, "ice": {type:"IceCubes", quantity:[0.2,"kg"]},...
    if (inputTypes) this.inputTypes = inputTypes;
    // the node status: available or blocked
    this.status = status;  // by default: 1=AVAILABLE
    // Ex: {"lemonade": {type:"Lemonade", quantity:[1,"l"]}, ...
    if (outputTypes) this.outputTypes = outputTypes;
    this.resourceRoles = resourceRoles;  // by default: {}
    this.tasks = new qUEUE();
    this.blockedSuccessorTasks = new qUEUE();
    this.inputBuffer = new qUEUE();
    this.workInProgress = new Set();
    // initialize node statistics
    this.nmrOfArrivedObjects = 0;
    this.nmrOfDepartedObjects = 0;
  }
  enqueueProcessingObject( o) {
    this.inputBuffer.enqueue( o);
    this.nmrOfArrivedObjects++;
    if (this.inputBuffer.length === this.inputBuffer.capacity) {
      this.predecessorNode.status = rESOURCEsTATUS.BLOCKED;
      this.predecessorNode.blockedStartTime = sim.time;
    }
  }
  dequeueProcessingObject() {
    const procObj = this.inputBuffer.dequeue();
    // add processing object to WiP
    this.workInProgress.add( procObj);
    // is the input buffer no longer full?
    if (this.inputBuffer.length === this.inputBuffer.capacity-1) {
      const predNode = this.predecessorNode;
      if (predNode.status === rESOURCEsTATUS.BLOCKED) {
        // then unload predecessor node
        const blockedActy = predNode.blockedSuccessorTasks.dequeue();
        predNode.workInProgress.remove( blockedActy.processingObject);
        this.inputBuffer.enqueue( blockedActy.processingObject);
        predNode.status = rESOURCEsTATUS.AVAILABLE;
        //TODO: if input buffer not empty, start next activity
        // collect processing node blocked time statistics
        if (sim.stat.resUtil["pROCESSINGaCTIVITY"][predNode.id].blocked === undefined) {
          sim.stat.resUtil["pROCESSINGaCTIVITY"][predNode.id].blocked =
              sim.time - predNode.blockedStartTime;
        } else {
          sim.stat.resUtil["pROCESSINGaCTIVITY"][predNode.id].blocked +=
              sim.time - predNode.blockedStartTime;
        }
        predNode.blockedStartTime = 0;  // reset
      }
    }
    return procObj;
  }
  scheduleActivityStartEvent( acty) {
    sim.FEL.add( new pROCESSINGaCTIVITYsTART({plannedActivity: acty}));
  }
  toString() {
    var str = " "+ this.name + `{ tasks:${this.tasks.length}, inpB:${this.inputBuffer.length}, `+
        `wiP:${this.workInProgress.size}, arr:${this.nmrOfArrivedObjects}, dep:${this.nmrOfDepartedObjects}}`;
    return str;
  }
}

/**
 * A processing node extends a processing activity node by adding an implicitly associated
 * processing station, which is a resource object with a processing capacity and a spatial position.
 *
 * By default, a processing node has a processing capacity of 1. Its processing
 * station represents a required resource if its processingCapacity attribute
 * has a positive integer value. In that case, the node has an implicit count pool
 * with "processingCapacity" defining its capacity, which is the number of
 * processing objects that can be processed at that processing station at a time.
 *
 * While the "status" attribute has been used for representing the available/blocked status
 * of processing activity nodes, its meaning is extended for processing nodes where it also
 * expresses the resource status available/busy of the node's processing station.
 */
class pROCESSINGnODE extends pROCESSINGaCTIVITYnODE {
  constructor({id, name, activityTypeName, resourceRoles={}, processingDuration, waitingTimeout,
                inputBufferCapacity, inputTypeName, inputTypes,
                processingCapacity=1, status=1, successorNodeName, successorNodeNames,
                outputTypes}) {
    super( {id: id||name, name, activityTypeName, resourceRoles, processingDuration, waitingTimeout,
      inputBufferCapacity, inputTypeName, inputTypes, status, successorNodeName, successorNodeNames, outputTypes});
    // how many proc. objects can be processed at the same time
    this.processingCapacity = processingCapacity;  // by default: 1
    if (Number.isInteger( this.processingCapacity)) {
      this.resourceRoles[name +"-ProcStation"] = {countPoolName: name +"-ProcStation", card:processingCapacity};
    }
  }
}

/**
 * Departure events happen at an exit node.
 */
class dEPARTURE extends eVENT {
  constructor({occTime, delay, node, processingObject}) {
    super( {occTime, delay, node});
    this.processingObject = processingObject;
  }
  onEvent() {
    var followupEvents = [];
    // dequeue processing object from the input queue
    const procObj = this.processingObject;
    // update statistics
    sim.stat.networkNodes[this.node.name].nmrOfDepartedObjects++;
    //this.node.nmrOfDepartedObjects++;
    sim.stat.networkNodes[this.node.name].cumulativeTimeInSystem +=
        this.occTime - procObj.arrivalTime;
    // invoke onDeparture event rule method
    if (typeof this.node.onDeparture === "function") {
      followupEvents = this.node.onDeparture( this.processingObject);
    }
    // remove processing object from simulation
    sim.objects.delete( procObj.id);
    return followupEvents;
  }
  toString() {
    const decPl = oes.defaults.simLogDecimalPlaces,
        evtName = "Departure"+ (this.arrivedObject ? "-"+ this.arrivedObject.id : "");
    return `${evtName}@${math.round(this.occTime,decPl)}`;
  }
}

/**
 * A departure event node is a PN node for having processing objects depart
 * Departure event nodes have two built-in statistics attributes: (1) "nmrOfDepartedObjects"
 * counting the number of objects that have departed at the given exit node, and
 * (2) "cumulativeTimeInSystem" for adding up the times in system of all departed objects.
 */
class dEPARTUREeVENTnODE extends eVENTnODE {
  constructor({id, name, onDeparture}) {
    super({id, name, eventTypeName:"dEPARTURE"});
    if (onDeparture) this.onDeparture = onDeparture;
    this.nmrOfDepartedObjects = 0;
    this.cumulativeTimeInSystem = 0;
  }
}
/**
 * The definition of an exit node combines
 * defining both a (possibly spatial) object and an associated implicit departure
 * event type, possibly with an "onDeparture" event rule method.
 */
class eXITnODE extends dEPARTUREeVENTnODE {
  constructor({id, name, onDeparture, position}) {
    super({id, name, onDeparture});
    // a position in space
    if (position) this.position = position;
  }
}
/**********************************************************************
 * Create a processing-station-specific resource pool for each processing node
 * (for simplicity, processing stations are identified with their nodes
 **********************************************************************/
oes.createProcessingStationResourcePools = function () {
  const nodeNames = Object.keys( sim.scenario.networkNodes);
  for (const nodeName of nodeNames) {
    const node = sim.scenario.networkNodes[nodeName];
    if (node instanceof pROCESSINGnODE && Number.isInteger( node.processingCapacity)) {
      node.resourceRoles[nodeName +"-ProcStation"].resourcePool =
          new rESOURCEpOOL({name: nodeName +"-ProcStation" , size: node.processingCapacity});
    }
  }
}
/** TODO: create sim.model.networkStatistics per node
 * Set up PN statistics
 * - for any entry node, define the implicit statistics variable "arrivedObjects"
 * - for any exit node, define the implicit statistics variables "departedObjects"
 *   and "meanTimeInSystem"
 */
oes.setupProcNetStatistics = function () {
  for (const nodeName of Object.keys( sim.model.networkNodes)) {
    const node = sim.model.networkNodes[nodeName];
    if (node.typeName === "ArrivalEventNode" || node.typeName === "EntryNode") {
      const nodeStat = sim.stat.networkNodes[nodeName] = Object.create(null)
      nodeStat.nmrOfArrivedObjects = 0;
    }
    // PN exit node
    if (node.typeName === "DepartureEventNode" || node.typeName === "ExitNode") {
      const nodeStat = sim.stat.networkNodes[nodeName] = Object.create(null)
      nodeStat.nmrOfDepartedObjects = 0;
      nodeStat.cumulativeTimeInSystem = 0;
    }
  }
};
/*******************************************************
 * Initialize the generic ex-post AN statistics
 ********************************************************/
oes.initializeProcNetStatistics = function () {
  // per network node
  for (const nodeName of Object.keys( sim.scenario.networkNodes)) {
    const node = sim.scenario.networkNodes[nodeName];
    if (node instanceof aRRIVALeVENTnODE) {
      const nodeStat = sim.stat.networkNodes[nodeName];
      nodeStat.nmrOfArrivedObjects = 0;
    }
    if (node instanceof dEPARTUREeVENTnODE) {
      const nodeStat = sim.stat.networkNodes[nodeName];
      nodeStat.nmrOfDepartedObjects = 0;
      nodeStat.cumulativeTimeInSystem = 0;
    }
  }
};
/*******************************************************
 * Compute the final PN statistics
 ********************************************************/
oes.computeFinalProcNetStatistics = function () {
  for (const nodeName of Object.keys( sim.scenario.networkNodes)) {
    const node = sim.scenario.networkNodes[nodeName];
    if (node instanceof dEPARTUREeVENTnODE) {
      const nodeStat = sim.stat.networkNodes[nodeName];
      // compute throughput time (mean time in system)
      nodeStat.throughputTime = math.round( nodeStat.cumulativeTimeInSystem / nodeStat.nmrOfDepartedObjects,
          oes.defaults.expostStatDecimalPlaces);
    }
  }
};
/**
 * Check model constraints
 * @method
 * @author Gerd Wagner
 */
oes.checkProcNetConstraints = function (params) {
  var errMsgs=[], msg="", evts=[];
  // PNC1: nmrOfArrObjects = nmrOfObjectsAtProcNodes + nmrOfObjectsAtExitNodes + nmrOfDepObjects
  var nmrOfArrObjects = Object.keys( oes.EntryNode.instances).reduce( function (res, nodeObjIdStr) {
    return res + sim.objects[nodeObjIdStr].nmrOfArrivedObjects
  }, 0);
  var nmrOfObjectsAtProcNodes = Object.keys( oes.ProcessingNode.instances).reduce( function (res, nodeObjIdStr) {
    return res + sim.objects[nodeObjIdStr].inputBuffer.length
  }, 0);
  var nmrOfObjectsAtExitNodes = Object.keys( oes.ExitNode.instances).reduce( function (res, nodeObjIdStr) {
    return res + sim.objects[nodeObjIdStr].inputBuffer.length
  }, 0);
  var nmrOfDepObjects = Object.keys( oes.ExitNode.instances).reduce( function (res, nodeObjIdStr) {
    return res + sim.objects[nodeObjIdStr].nmrOfDepartedObjects
  }, 0);
  if (nmrOfArrObjects !== nmrOfObjectsAtProcNodes + nmrOfObjectsAtExitNodes + nmrOfDepObjects) {
    msg = "The object preservation constraint is violated at step "+ sim.step +
        (params && params.add ? params.add : "") +
        " (nmrOfArrObjects: "+ nmrOfArrObjects +
        ", nmrOfObjectsInSystem: "+ String(nmrOfObjectsAtProcNodes+nmrOfObjectsAtExitNodes) +
        ", nmrOfDepObjects: "+ nmrOfDepObjects +")";
    if (params && params.log) console.log( msg);
    else errMsgs.push( msg);
  }
  // PNC2: if a proc. node has a proc. end event, its input queue must be non-empty
  evts = sim.FEL.getEventsOfType("pROCESSINGaCTIVITYeND");
  evts.forEach( function (procEndEvt) {
    var pN = procEndEvt.node, inpQ = pN.inputBuffer;
    if (inpQ.length === 0 || !inpQ[0]) {
      msg = "At step "+ sim.step +" "+ (params && params.add ? params.add : "") +
          ", the proc. node "+ (pN.name||pN.id) +" has an empty input queue.";
      if (params && params.log) console.log( msg);
      else errMsgs.push( msg);
    }
  });
  return errMsgs;
};

