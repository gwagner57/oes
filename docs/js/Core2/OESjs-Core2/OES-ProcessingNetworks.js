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
    var str = "procObj-"+ (this.name||this.id);
    return str;
  }
}
/**
 * Entry nodes are objects that participate in exogenous arrival events
 * leading to the creation of processing objects, which are either routed to a
 * successor node or pushed to an output queue. The definition of an entry
 * node combines defining both a (possibly spatial) entry station object and
 * an associated arrival event type (by default, aRRIVAL).
 *
 * An entry node definition may include (1) a "successorNode" attribute slot
 * for assigning a successor node to which processing objects are routed; (2) a
 * "maxNmrOfArrivals" attribute slot for defining a maximum number of arrival
 * events after which no more arrival events will be created (and, consequently,
 * the simulation may run out of future events); (3) either an "arrivalRate"
 * attribute slot for defining the event rate parameter of an exponential PDF
 * used for computing the time between two consecutive arrival events, or a per-
 * instance-defined "arrivalRecurrence" method slot for computing the recurrence
 * of arrival events; (4) a per-instance-defined "outputType" slot for defining
 * a custom output type (instead of the default "pROCESSINGoBJECT"). If neither an
 * "arrivalRate" nor an "arrivalRecurrence" method are defined, the exponential
 * distribution with an event rate of 1 is used as a default recurrence.
 *
 * Entry nodes may have an "onArrival" event rule method.
 *
 * Entry nodes have a built-in (read-only) statistics attribute "nmrOfArrivedObjects"
 * counting the number of objects that have arrived at the given entry node.
 *
 * TODO: If no successor node is defined for an entry node, an output queue is
 * automatically created.
 */
class eNTRYnODE extends eVENTnODE {
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
  // overwrite/improve the standard toString method
  toString() {
    var str = ""; //" "+ this.name + `{depObj: ${this.nmrOfDepartedObjects}}`;
    return str;
  }
}
/**
 * Arrival events happen at an entry node.
 * They may define a quantity of arrived processing objects, which is 1 by default.
 * Viewing an arrival not as an arrival of processing objects, but as an arrival of
 * a customer order, the quantity attribute would allow to define an order
 * quantity that results in the same quantity of processing objects (or production
 * orders) pushed to the entry node's succeeding processing node.
 */
class aRRIVAL extends eVENT {
  constructor({occTime, delay, entryNode, quantity}) {
    super({occTime, delay, node: entryNode});
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
        const succActy = new SuccAT({processingNode: succNode, processingObject: procObj});
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
      arrEvt = new aRRIVAL({delay: this.recurrence(), entryNode: this.node});
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

/*
 * A simple processing node has an input buffer for incoming processing objects 
 * and a successor node. Processing objects may be either of a generic default
 * type "pROCESSINGoBJECT" or of a model-specific subtype of "pROCESSINGoBJECT"
 * (such as "Customer").
 *
 * A processing node has a "processingDuration" in the form of a fixed value
 * or a (random variable) function expression, applying to its processing activities.
 * If no "processingDuration" is defined, the exponential distribution with an event
 * rate of 1 is used as a default function for sampling processing durations.
 * 
 * By default, the processing station of a processing node represents a singleton
 * resource pool allowing to process only one processing object at a time, unless
 * the "processingCapacity" attribute is set to a value greater than 1. In that case,
 * the processing station represents a count pool with "processingCapacity" defining
 * its capacity, which is the number of processing objects that can be processed at
 * that station at a time.
 *
 * In the general case, a processing node may have several input object types,
 * and an input buffer for each of them, and either a successor processing node or
 * else an (automatically generated) output buffer for each type of output object.
 * By default, when no explicit transformation of inputs to outputs is modeled by
 * specifying an outputTypes map, there is no transformation and it holds that
 * outputs = inputs.
 */
class pROCESSINGnODE extends aCTIVITYnODE {
  // status: 1 = rESOURCEsTATUS.AVAILABLE
  constructor({id, name, activityTypeName, resourceRoles={}, processingDuration, waitingTimeout,
               inputBufferCapacity, inputTypeName, inputTypes,
               processingCapacity=1, status=1, successorNodeName, successorNodeNames,
               outputTypes}) {
    super( {id: id||name, name, activityTypeName, resourceRoles, duration: processingDuration, waitingTimeout,
            successorNodeName, successorNodeNames});
    if (inputBufferCapacity) this.inputBufferCapacity = inputBufferCapacity;
    // user-defined type of processing objects
    if (inputTypeName) this.inputType = sim.Classes( inputTypeName);
    // Ex: {"lemons": {type:"Lemon", quantity:2}, "ice": {type:"IceCubes", quantity:[0.2,"kg"]},...
    if (inputTypes) this.inputTypes = inputTypes;
    this.processingCapacity = processingCapacity;
    // the resource status of the (implicitly associated) processing station
    this.status = status;
    // Ex: {"lemonade": {type:"Lemonade", quantity:[1,"l"]}, ...
    if (outputTypes) this.outputTypes = outputTypes;
    if (resourceRoles) this.resourceRoles = resourceRoles;
    this.resourceRoles[name +"ProcStation"] = {range: pROCESSINGnODE, card:1};
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
 * Processing Activities are activities that have inputs and outputs and are
 * performed at a processing node (being a resource). Their properties
 * (in particular, their resource roles and duration) are defined within
 * the definition of their processing node.
 */
class pROCESSINGaCTIVITY extends aCTIVITY {
  constructor({id, occTime, duration, enqueueTime, processingNode, processingObject}) {
    super({id, occTime, duration, enqueueTime, node: processingNode});
    if (processingObject) this.processingObject = processingObject;
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
    const node = this.plannedActivity.node, followupEvents=[];
    if (node.inputBuffer.length===0) {
      console.log(`ProcessingActivityStart with empty input buffer at ${node.name} at step ${sim.step}`);
      return;
    }
    // move proc. obj. from input buffer to WiP
    node.dequeueProcessingObject();
    // invoke event routine of aCTIVITYsTART
    followupEvents.push(...super.onEvent());

    return followupEvents;
  }
  toString() {
    const decPl = oes.defaults.simLogDecimalPlaces,
          acty = this.plannedActivity, AT = acty.constructor,
          resRoles = acty.node.resourceRoles,
          evtName = acty.node.name +"ProcStart-"+ acty.processingObject.id;
    var evtStr="", slotListStr="";
    for (const resRoleName of Object.keys( resRoles)) {
      if (resRoleName !== acty.node.name +"ProcStation" && resRoles[resRoleName].range) {
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

    // invoke event routine of aCTIVITYeND
    followupEvents.push(...super.onEvent());

    const succNode = node.getSuccessorNode();
    if (succNode) {
      if (succNode instanceof pROCESSINGnODE) {
        let SuccAT=null;
        if (succNode.activityTypeName) {
          SuccAT = sim.Classes[succNode.activityTypeName];
        } else {
          SuccAT = pROCESSINGaCTIVITY;
        }
        const succActy = new SuccAT({processingNode: succNode,
            processingObject: acty.processingObject});
        const succResRoles = succNode.resourceRoles ?? SuccAT.resourceRoles,
            succResRoleNames = Object.keys( succResRoles);
        // By default, keep (individual) resources that are shared between AT and SuccAT
        for (const resRoleName of resRoleNames) {
          if (succNode.resourceRoles[resRoleName] && acty[resRoleName]) {
            // re-allocate resource to successor activity
            succActy[resRoleName] = acty[resRoleName];
            //TODO: better form a collection of transferred resource role names
            delete acty[resRoleName];  // used below for checking if resource transferred
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
      } else if (succNode instanceof eXITnODE) {
        // remove processing object from WiP
        node.workInProgress.delete( acty.processingObject);
        followupEvents.push( new dEPARTURE({exitNode: succNode,
                                     processingObject: acty.processingObject}));
      }
    }
    // release all (remaining) resources of acty
    acty.releaseResources();
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
        evtName = acty.node.name +"ProcEnd-"+ acty.processingObject.id;
    var evtStr="", slotListStr="";
    for (const resRoleName of Object.keys( resRoles)) {
      if (resRoleName !== acty.node.name +"ProcStation" && resRoles[resRoleName].range) {
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
/**
 * Exit nodes are objects that participate in departure events leading to the
 * destruction of the departing object. The definition of an exit node combines
 * defining both a (possibly spatial) object and an associated implicit departure
 * event type, possibly with an "onDeparture" event rule method.
 *
 * Exit nodes have two built-in statistics attributes: (1) "nmrOfDepartedObjects"
 * counting the number of objects that have departed at the given exit node, and
 * (2) "cumulativeTimeInSystem" for adding up the times in system of all departed
 * objects.
 */
class eXITnODE extends eVENTnODE {
  constructor({id, name}) {
    super({id, name, eventTypeName:"dEPARTURE"});
    this.nmrOfDepartedObjects = 0;
    this.cumulativeTimeInSystem = 0;
  }
  // overwrite/improve the standard toString method
  toString() {
    var str = ""; //" "+ this.name + `{depObj: ${this.nmrOfDepartedObjects}}`;
    return str;
  }
}
/**
 * Departure events happen at an exit node.
 */
class dEPARTURE extends eVENT {
  constructor({occTime, delay, exitNode, processingObject}) {
    super( {occTime, delay, node: exitNode});
    this.processingObject = processingObject;
  }
  onEvent() {
    var followupEvents = [];
    // dequeue processing object from the input queue
    const procObj = this.processingObject;
    // update statistics
    this.node.nmrOfDepartedObjects++;
    this.node.cumulativeTimeInSystem += this.occTime - procObj.arrivalTime;
    // invoke onDeparture event rule method
    if (typeof this.node.onDeparture === "function") {
      followupEvents = this.node.onDeparture();
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
/*******************************************************
 * Schedule initial Arrival events
 ********************************************************/
oes.scheduleInitialArrivalEvents = function () {
  const nodeNames = Object.keys( sim.scenario.networkNodes);
  for (const nodeName of nodeNames) {
    const node = sim.scenario.networkNodes[nodeName];
    if (node instanceof eNTRYnODE) {
      const nullEvt = new aRRIVAL({occTime: 0, entryNode: node});
      sim.FEL.add( new aRRIVAL({delay: nullEvt.recurrence(), entryNode: node}));
    }
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
    if (node instanceof pROCESSINGnODE) {
      node.resourceRoles[nodeName +"ProcStation"].resourcePool =
          new rESOURCEpOOL({name: nodeName +"ProcStation" , resourceType: pROCESSINGnODE, resources:[node]});
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
  var entryNodes = oes.EntryNode.instances,
      exitNodes = oes.ExitNode.instances;
  if (!sim.model.statistics) sim.model.statistics = {};
  // define default statistics variables for PN entry node statistics
  Object.keys( entryNodes).forEach( function (nodeIdStr) {
    var suppressDefaultEntry=false,
        entryNode = entryNodes[nodeIdStr],
        varName = Object.keys( entryNodes).length === 1 ?
            "arrivedObjects" : entryNode.name +"_arrivedObjects";
    entryNode.nmrOfArrivedObjects = 0;
    if (sim.model.statistics[varName] && !sim.model.statistics[varName].label) {
      // model-defined suppression of default statistics
      suppressDefaultEntry = true;
    }
    if (!suppressDefaultEntry) {
      if (!sim.model.statistics[varName]) sim.model.statistics[varName] = {};
      sim.model.statistics[varName].range = "NonNegativeInteger";
      if (!sim.model.statistics[varName].label) {
        sim.model.statistics[varName].label = "Arrived objects";
      }
      sim.model.statistics[varName].entryNode = entryNode;
      sim.model.statistics[varName].computeOnlyAtEnd = true;
    }
  });
  // define default statistics variables for PN exit node statistics
  Object.keys( exitNodes).forEach( function (nodeIdStr) {
    var suppressDefaultEntry=false,
        exitNode = exitNodes[nodeIdStr],
        varName = Object.keys( exitNodes).length === 1 ?
            "departedObjects" : exitNode.name +"_departedObjects";
    exitNode.nmrOfDepartedObjects = 0;
    if (sim.model.statistics[varName] && !sim.model.statistics[varName].label) {
      // model-defined suppression of default statistics
      suppressDefaultEntry = true;
    }
    if (!suppressDefaultEntry) {
      if (!sim.model.statistics[varName]) sim.model.statistics[varName] = {};
      sim.model.statistics[varName].range = "NonNegativeInteger";
      if (!sim.model.statistics[varName].label) {
        sim.model.statistics[varName].label = "Departed objects";
      }
      sim.model.statistics[varName].exitNode = exitNode;
      sim.model.statistics[varName].computeOnlyAtEnd = true;
    }
    exitNode.cumulativeTimeInSystem = 0;
    varName = Object.keys( exitNodes).length === 1 ?
        "meanTimeInSystem" : exitNode.name +"_meanTimeInSystem";
    if (sim.model.statistics[varName] && !sim.model.statistics[varName].label) {
      // model-defined suppression of default statistics
      suppressDefaultEntry = true;
    }
    if (!suppressDefaultEntry) {
      if (!sim.model.statistics[varName]) sim.model.statistics[varName] = {};
      sim.model.statistics[varName].range = "Decimal";
      if (!sim.model.statistics[varName].label) {
        sim.model.statistics[varName].label = "Mean time in system";
      }
      sim.model.statistics[varName].exitNode = exitNode;
      sim.model.statistics[varName].computeOnlyAtEnd = true;
      sim.model.statistics[varName].expression = function () {
        return exitNode.cumulativeTimeInSystem / exitNode.nmrOfDepartedObjects
      };
    }
  });
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
    var pN = procEndEvt.processingNode, inpQ = pN.inputBuffer;
    if (inpQ.length === 0 || !inpQ[0]) {
      msg = "At step "+ sim.step +" "+ (params && params.add ? params.add : "") +
          ", the proc. node "+ (pN.name||pN.id) +" has an empty input queue.";
      if (params && params.log) console.log( msg);
      else errMsgs.push( msg);
    }
  });
  return errMsgs;
};

