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
    var str = " "+ this.name||"procObj" + `{arr:${math.round( this.arrivalTime,2)}}`;
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
class eNTRYnODE extends oBJECT {
  constructor({id, name, successorNodeName, successorNodeNames,
                outputTypeName="pROCESSINGoBJECT",
                arrivalRate, arrivalRecurrence, maxNmrOfArrivals, arrivalQuantity}) {
    super( name, name);  // set id to name
    // a fixed successor node name or an expression for XOR splitting
    if (successorNodeName) this.successorNodeName = successorNodeName;
    // a map with node names as keys and conditions as values for OR/AND splitting
    if (successorNodeNames) this.successorNodeNames = successorNodeNames;
    this.outputTypeName = outputTypeName;
    if (arrivalRate) this.arrivalRate = arrivalRate;
    if (arrivalRecurrence) this.arrivalRecurrence = arrivalRecurrence;
    if (maxNmrOfArrivals) this.maxNmrOfArrivals = maxNmrOfArrivals;
    if (arrivalQuantity) this.arrivalQuantity = arrivalQuantity;
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
    super({occTime, delay});
    this.node = entryNode;
    if (quantity) this.quantity = quantity;
  }
  onEvent() {
    var followupEvents=[];
    const nmrOfArrivedObjects = this.quantity || 1,
          arrivedObjects=[];
    // define the type of processing object
    const ProcessingObject = sim.Classes[this.node.outputTypeName];
    // create newly arrived processing object(s)
    for (let i=0; i < nmrOfArrivedObjects; i++) {
      const procObj = new ProcessingObject({arrivalTime: this.occTime});
      arrivedObjects.push( procObj);
    }
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
        succNode.inputBuffer.enqueue( procObj);
        // schedule successor activity
        succNode.tasks.startOrEnqueue( new SuccAT(
            {processingNode: succNode, processingObject: procObj}));
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
    if (typeof this.node.arrivalRecurrence === "function") {
      delay = this.node.arrivalRecurrence();
    } else if (this.node.arrivalRate) {
      delay = rand.exponential( this.node.arrivalRate);
    } else {  // use the default recurrence
      delay = aRRIVAL.defaultRecurrence();
    }
    return delay;
  }
  createNextEvent() {
    var arrEvt=null;
    if (!this.node.maxNmrOfArrivals ||
        this.node.nmrOfArrivedObjects < this.node.maxNmrOfArrivals) {
      arrEvt = new aRRIVAL({delay: this.recurrence(), entryNode: this.node});
      if (this.arrivalQuantity) {
        arrEvt.quantity = typeof this.arrivalQuantity === "function" ?
            this.arrivalQuantity() : this.arrivalQuantity;
      }
    }
    return arrEvt;
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
class pROCESSINGnODE extends oBJECT {
  // status: 1 = rESOURCEsTATUS.AVAILABLE
  constructor({id, name, inputBufferCapacity, inputTypeName, inputTypes,
      processingActivityTypeName, processingDuration, processingCapacity=1,
      status=1, successorNodeName, successorNodeNames,
      outputTypes, resourceRoles}) {
    super( id||name, name);  // set id to name
    if (inputBufferCapacity) this.inputBufferCapacity = inputBufferCapacity;
    // user-defined type of processing objects
    if (inputTypeName) this.inputType = sim.Classes( inputTypeName);
    // Ex: {"lemons": {type:"Lemon", quantity:2}, "ice": {type:"IceCubes", quantity:[0.2,"kg"]},...
    if (inputTypes) this.inputTypes = inputTypes;
    // a user-defined subclass of pROCESSINGaCTIVITY
    if (processingActivityTypeName) this.processingActivityTypeName = processingActivityTypeName;
    // a fixed value or a random variable function expression
    if (processingDuration) this.duration = processingDuration;
    this.processingCapacity = processingCapacity;
    // the resource status of the (implicitly associated) processing station
    this.status = status;
    // a fixed successor node name or an expression for XOR splitting
    if (successorNodeName) this.successorNodeName = successorNodeName;
    // a map with node names as keys and conditions as values for OR/AND splitting
    if (successorNodeNames) this.successorNodeNames = successorNodeNames;
    // Ex: {"lemonade": {type:"Lemonade", quantity:[1,"l"]}, ...
    if (outputTypes) this.outputTypes = outputTypes;
    if (resourceRoles) {
      this.resourceRoles = resourceRoles;
      if (!("processingStation" in resourceRoles)) {
        this.resourceRoles["processingStation"] = {card:1};
      }
    } else {
      this.resourceRoles = {"processingStation": {card:1}};
    }
    this.tasks = new tASKqUEUE();
    this.inputBuffer = new qUEUE();
    this.workInProgress = new Set();
    // initialize node statistics
    this.nmrOfArrivedObjects = 0;
    this.nmrOfDepartedObjects = 0;
  }
  // overwrite/improve the standard toString method
  toString() {
    var str = " "+ this.name + `{tasks: ${this.tasks.length}}`;
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
    const pN = this.plannedActivity.node, followupEvents=[];
    if (pN.inputBuffer.length===0) {
      console.log(`ProcessingActivityStart with empty input buffer at ${pN.name} at step ${sim.step}`);
    }
    // dequeue processing object and add it to WiP
    pN.workInProgress.add( pN.inputBuffer.dequeue());
    // invoke event routine of aCTIVITYsTART
    followupEvents.push(...super.onEvent());
    return followupEvents;
  }
  toString() {
    const decPl = oes.defaults.simLogDecimalPlaces,
          acty = this.plannedActivity, AT = acty.constructor,
          resRoles = acty.node.resourceRoles,
          evtTypeName = "ProcActyStart";
    var evtStr="", slotListStr="";
    Object.keys( resRoles).forEach( function (resRoleName) {
      if (resRoles[resRoleName].range) {
        const resObj = acty[resRoleName];
        let resObjStr = "";
        if (Array.isArray( resObj)) {
          resObjStr = resObj.map( o => o.name || String(o.id)).toString();
        } else {
          resObjStr = resObj.name || String(resObj.id);
        }
        slotListStr += resObjStr +", ";
      }
    });
    evtStr = slotListStr ? `${evtTypeName}{ ${slotListStr}}` : evtTypeName;
    return `${evtStr}@${math.round(this.occTime,decPl)}`;
  }
}
class pROCESSINGaCTIVITYeND extends aCTIVITYeND {
  constructor({occTime, delay, activity}) {
    super({occTime, delay, activity});
    // assign fixed (implied) activity type
    this.activityType = "pROCESSINGaCTIVITY";
  }
  onEvent() {
    var nextNode=null, followupEvt1=null, followupEvt2=null,
        unloaded=false, followupEvents=[], pN = this.processingNode;
    const acty = this.activity;

    // process this event as an aCTIVITYeND event for getting AN statistics etc.
    super.onEvent();
    // the successor node may be dynamically assigned by a.onActivityEnd()
    nextNode = pN.successorNode || acty.successorNode;
    // is the next node a processing node?
    if (nextNode.constructor.Name === "pROCESSINGnODE") {
      // is the next processing node available?
      if (nextNode.inputBuffer.length === 1 &&
          nextNode.status === rESOURCEsTATUS.AVAILABLE) {
        // then allocate next node and start its ProcessingActivity
        nextNode.status = rESOURCEsTATUS.BUSY;
        followupEvt1 = new pROCESSINGaCTIVITYsTART({
          occTime: this.occTime + sim.nextMomentDeltaT,
          processingNode: nextNode,
          resourceRoles: acty.resourceRoles || {}
        });
        followupEvents.push( followupEvt1);
      } else if (nextNode.inputBufferCapacity &&
          nextNode.inputBuffer.length < nextNode.inputBufferCapacity) {
        // pop processing object and push it to the input queue of the next node
        nextNode.inputBuffer.enqueue( pN.inputBuffer.dequeue());
        unloaded = true;
      } else if (nextNode.inputBufferCapacity &&
          nextNode.inputBuffer.length === nextNode.inputBufferCapacity) {
        pN.status = rESOURCEsTATUS.BLOCKED;
        pN.blockedStartTime = sim.time;
      }
    } else {  // the next node is an exit node
      // pop processing object and push it to the input queue of the next node
      nextNode.inputBuffer.enqueue( pN.inputBuffer.dequeue());
      followupEvents.push( new dEPARTURE({
        occTime: this.occTime + sim.nextMomentDeltaT,
        exitNode: nextNode
      }));
    }
    if (pN.status === rESOURCEsTATUS.BUSY) {
      // are there more items in the input queue?
      if (pN.inputBuffer.length > 0) {
        followupEvt2 = new pROCESSINGaCTIVITYsTART({
          occTime: this.occTime + sim.nextMomentDeltaT,
          processingNode: pN,
          resourceRoles: {}
        });
        followupEvents.push( followupEvt2);
        if (unloaded && pN.inputBuffer.length === pN.inputBufferCapacity-1 &&
            pN.predecessorNode.status === rESOURCEsTATUS.BLOCKED) {
          // then unload predecessor node
          pN.inputBuffer.enqueue( pN.predecessorNode.inputBuffer.dequeue());
          pN.predecessorNode.status = rESOURCEsTATUS.AVAILABLE;
          // collect processing node blocked time statistics
          if (sim.stat.resUtil["pROCESSINGaCTIVITY"][pN.predecessorNode.id].blocked === undefined) {
            sim.stat.resUtil["pROCESSINGaCTIVITY"][pN.predecessorNode.id].blocked =
                sim.time - pN.predecessorNode.blockedStartTime;
          } else {
            sim.stat.resUtil["pROCESSINGaCTIVITY"][pN.predecessorNode.id].blocked +=
                sim.time - pN.predecessorNode.blockedStartTime;
          }
          pN.predecessorNode.blockedStartTime = 0;  // reset
        }
      } else pN.status = rESOURCEsTATUS.AVAILABLE;
    }
    return followupEvents;
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
class eXITnODE extends oBJECT{
  constructor({id, name, inputBuffer=[]}) {
    super( name, name);  // set id to name
    this.inputBuffer = inputBuffer;
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
  constructor({occTime, delay, exitNode}) {
    super( occTime, delay);
    this.node = exitNode;
  }
  onEvent() {
    var followupEvents = [];
    // dequeue processing object from the input queue
    const procObj = this.node.inputBuffer.dequeue();
    // update statistics
    this.node.nmrOfDepartedObjects++;
    this.node.cumulativeTimeInSystem += this.occTime - procObj.arrivalTime;
    // invoke onDeparture event rule method
    if (typeof this.node.onDeparture === "function") {
      followupEvents = this.node.onDeparture();
    }
    // remove processing object from simulation
    sim.removeObject( procObj);
    return followupEvents;
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
/*******************************************************
 * Create processing station resource pools
 ********************************************************/
oes.createProcessingStationResourcePools = function () {
  const nodeNames = Object.keys( sim.scenario.networkNodes);
  for (const nodeName of nodeNames) {
    const node = sim.scenario.networkNodes[nodeName];
    if (node instanceof pROCESSINGnODE) {
      node.resourceRoles["processingStation"].resourcePool =
          new rESOURCEpOOL({name:"processingStations", available:1});
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

