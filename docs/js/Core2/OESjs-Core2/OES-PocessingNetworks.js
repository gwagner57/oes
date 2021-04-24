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
}
/*
 * A simple processing node has an input buffer for incoming processing objects 
 * and a successor node. Processing objects may be either of a generic default
 * type "pROCESSINGoBJECT" or of a model-specific subtype of "pROCESSINGoBJECT"
 * (such as "Customer").
 *
 * A processing node is defined with a "duration" slot having either a fixed value 
 * or a (random variable) function expression, applying to its processing activities.
 * If no "duration" slot is defined, the exponential distribution with an event rate 
 * of 1 is used as a default function for sampling processing durations. 
 * 
 * By default, a processing node processes one processing object at a time, but it 
 * may also have its "capacity" attribute set to a value greater than 1.
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
  constructor({id, name, status=1, inputBuffer=[],
                duration, processingActivityTypeName="pROCESSINGaCTIVITY",
                successorNode, successorNodes, predecessorNode,
                inputBufferCapacity, inputTypeName="pROCESSINGoBJECT", inputTypes,
                outputTypes, processingCapacity}) {
    super( id, name);
    this.status = status;
    this.inputBuffer = inputBuffer;
    // fixed value or random variable
    if (duration) this.duration = duration;
    // user-defined or "pROCESSINGaCTIVITY"
    this.processingActivityTypeName = processingActivityTypeName;
    // a node has either a "successorNode" value or a "successorNodes" value
    if (successorNode) this.successorNode = successorNode;
    // a map with node names as keys and conditions as values for (X)OR/AND splitting
    if (successorNodes) this.successorNodes = successorNodes;
    if (predecessorNode) this.predecessorNode = predecessorNode;
    if (inputBufferCapacity) this.inputBufferCapacity = inputBufferCapacity;
    // user-defined or "pROCESSINGoBJECT"
    this.inputTypeName = inputTypeName;
    // Ex: {"lemons": {type:"Lemon", quantity:2}, "ice": {type:"IceCubes", quantity:[0.2,"kg"]},...
    if (inputTypes) this.inputTypes = inputTypes;
    // Ex: {"lemonade": {type:"Lemonade", quantity:[1,"l"]}, ...
    if (outputTypes) this.outputTypes = outputTypes;
    if (processingCapacity) this.processingCapacity = processingCapacity;
  }
}
/**
 * Processing Activities are activities that have inputs and outputs and are
 * performed at a processing node (being a resource). Their properties
 * (in particular, their resource roles and duration) are defined within
 * the definition of their processing node.
 */
class pROCESSINGaCTIVITY extends aCTIVITY {
  constructor({id, occTime, duration, enqueueTime, processingNode}) {
    super( id, occTime, duration, enqueueTime);
    this.processingNode = processingNode;
  }
}
// define the exponential PDF as the default duration random variable
pROCESSINGaCTIVITY.defaultMean = 1;
pROCESSINGaCTIVITY.defaultDuration = function () {
  return rand.exponential( 1/pROCESSINGaCTIVITY.defaultMean)
};

class pROCESSINGaCTIVITYsTART extends aCTIVITYsTART {
  constructor({occTime, delay, plannedActivity, processingNode}) {
    super( occTime, delay, plannedActivity);
    this.processingNode = processingNode;
  }
  onConstructionBeforeAssigningProperties() {
    // assign fixed (implied) activity type
    this.activityType = "pROCESSINGaCTIVITY"; //TODO: check if needed
  }
  onConstructionAfterAssigningProperties() {
    this.resourceRoles = this.resourceRoles || {};
    // make sure that processing node is a resource
    this.resourceRoles["processingNode"] = this.processingNode;
  }
  onEvent() {
    const pN = this.processingNode;
    var slots = {processingNode: pN}, followupEvents=[];
    if (!pN.inputBuffer[0]) {
      console.log("ProcessingActivityStart with empty inputBuffer at "+ pN.name +
          " at step "+ sim.step);
    }
    // create slots for constructing new processing activity
    if (this.duration) slots.duration = this.duration;
    else if (pN.duration) {
      if (typeof pN.duration === "function") slots.duration = pN.duration();
      else slots.duration = pN.duration;
    } else slots.duration = pROCESSINGaCTIVITY.defaultDuration();
    pN.status = rESOURCEsTATUS.BUSY;
    Object.keys( this.resourceRoles).forEach( function (resRole) {
      var resObj = this.resourceRoles[resRole];
      // copy resource def. slots as reference prop. slots
      if (!slots[resRole]) slots[resRole] = resObj;
      // set activity state for resource object
      if (!resObj.activityState) resObj.activityState = {};
      resObj.activityState[this.activityType] = true;
    }, this);
    slots.id = sim.idCounter++;  // activities need an ID
    slots.startTime = this.occTime;
    // create new activity
    let acty = new pROCESSINGaCTIVITY( slots);
    acty.resourceRoles = this.resourceRoles;  // assign resourceRoles map
    sim.ongoingActivities[acty.id] = acty;
    // create slots for constructing a ProcessingActivityEnd event
    slots = {
      occTime: this.occTime + acty.duration,
      activityIdRef: acty.id,
      processingNode: pN
    };
    // if there is an onActivityStart procedure, execute it
    if (typeof pN.onActivityStart === "function") {
      followupEvents = pN.onActivityStart();
      //Better: followupEvents.push(...pN.onActivityStart());
    }
    // schedule activity end event
    followupEvents.push( new oes.ProcessingActivityEnd( slots));
    return followupEvents;
  }
}
oes.ProcessingActivityEnd = new cLASS({
  Name: "pROCESSINGaCTIVITYeND",
  supertypeName: "aCTIVITYeND",
  properties: {
    "processingNode": {range: "pROCESSINGnODE"}
  },
  methods: {
    "onConstructionBeforeAssigningProperties": function () {
      // assign fixed (implied) activity type
      this.activityType = "pROCESSINGaCTIVITY";
    },
    "onEvent": function () {
      var nextNode=null, followupEvt1=null, followupEvt2=null,
          unloaded=false, followupEvents=[], pN = this.processingNode;
      // retrieve activity
      var acty = sim.ongoingActivities[this.activityIdRef];
      // if there is an onActivityEnd procedure, execute it
      if (pN.onActivityEnd) followupEvents = pN.onActivityEnd();
      // set occTime and duration if there was no pre-set duration
      if (!acty.duration) {
        acty.occTime = this.occTime;
        acty.duration = acty.occTime - acty.startTime;
      }
      // compute resource utilization per resource role
      Object.keys( acty.resourceRoles).forEach( function (resRole) {
        var objIdStr = String(acty[resRole].id),
            resUtilMap = sim.stat.resUtil[this.activityType];
        if (resUtilMap[objIdStr] === undefined) resUtilMap[objIdStr] = {busy:0, blocked:0};
        resUtilMap[objIdStr].busy += acty.duration;
        // update the activity state of resource objects
        delete acty[resRole].activityState[this.activityType];
      }, this);
      // drop activity from list of ongoing activities
      delete sim.ongoingActivities[String( this.activityIdRef)];
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
          nextNode.inputBuffer.push( pN.inputBuffer.shift());
          unloaded = true;
        } else if (nextNode.inputBufferCapacity &&
            nextNode.inputBuffer.length === nextNode.inputBufferCapacity) {
          pN.status = rESOURCEsTATUS.BLOCKED;
          pN.blockedStartTime = sim.time;
        }
      } else {  // the next node is an exit node
        // pop processing object and push it to the input queue of the next node
        nextNode.inputBuffer.push( pN.inputBuffer.shift());
        followupEvents.push( new oes.Departure({
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
            pN.inputBuffer.push( pN.predecessorNode.inputBuffer.shift());
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
});
/**
 * Entry nodes are objects that participate in exogenous arrival events
 * leading to the creation of processing objects, which are either routed to a
 * successor node or pushed to an output queue. The definition of an entry
 * node combines defining both a (possibly spatial) object and an associated
 * implicit arrival event type, possibly with an "onArrival" event rule method.
 *
 * Entry node object definitions may include (1) a "successorNode" attribute slot
 * for assigning a successor node to which processing objects are routed; (2) a
 * "maxNmrOfArrivals" attribute slot for defining a maximum number of arrival
 * events after which no more arrival events will be created (and, consequently,
 * the simulation may run out of future events); (3) either an "arrivalRate"
 * attribute slot for defining the event rate parameter of an exponential pdf
 * used for computing the time between two consecutive arrival events, or a per-
 * instance-defined "arrivalRecurrence" method slot for computing the recurrence
 * of arrival events; (4) a per-instance-defined "outputType" slot for defining
 * a custom output type (instead of the default "pROCESSINGoBJECT"). If neither an
 * "arrivalRate" nor an "arrivalRecurrence" method are defined, the exponential
 * distribution with an event rate of 1 is used as a default recurrence.
 *
 * Entry nodes have a built-in (read-only) statistics attribute "nmrOfArrivedObjects"
 * counting the number of objects that have arrived at the given entry node.
 *
 * TODO: If no successor node is defined for an entry node, an output queue is
 * automatically created.
 */
oes.EntryNode = new cLASS({
  Name: "eNTRYnODE", label: "Entry node", shortLabel: "Entry",
  supertypeName: "oBJECT",
  properties: {
    "outputType": {range: "oBJECTtYPE", optional:true},  // default: "pROCESSINGoBJECT"
    "successorNode": {range: "pROCESSINGnODE", optional:true},
    "maxNmrOfArrivals": {range: "PositiveInteger", optional:true},
    "arrivalRate": {range: "Decimal", optional:true},
    "nmrOfArrivedObjects": {range: "NonNegativeInteger", shortLabel: "arrObj", optional:true}
  }
});
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
oes.ExitNode = new cLASS({
  Name: "eXITnODE", label: "Exit node", shortLabel: "Exit",
  supertypeName: "oBJECT",
  properties: {
    "inputBuffer": {range:"oBJECT", minCard: 0, maxCard: Infinity, isOrdered:true,
      label:"Input Queue", shortLabel:"inpQ"},
    "nmrOfDepartedObjects": {range: "NonNegativeInteger", shortLabel: "depObj", optional:true},
    "cumulativeTimeInSystem": {range: "NonNegativeDecimal", optional:true}
  }
});
/**
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
 * Arrival events are associated with an entry node.
 * They may define a quantity of arrived processing objects, which is 1 by default.
 * Viewing an arrival not as an arrival of processing objects, but as an arrival of
 * a customer order, the quantity attribute would allow to define an order
 * quantity that results in the same quantity of processing objects (or production
 * orders) pushed to the entry node's succeeding processing node.
 */
oes.Arrival = new cLASS({
  Name: "aRRIVAL", label: "Arrival", shortLabel: "Arr",
  supertypeName: "eVENT",
  properties: {
    "entryNode": {range: "eNTRYnODE"},
    "quantity": {range: "PositiveInteger", optional:true}
  },
  methods: {
    "onEvent": function () {
      var occT=0, procObj=null, ProcessingObject=null, followupEvents=[];
      if (this.entryNode.outputType) {
        ProcessingObject = cLASS[this.entryNode.outputType];
      } else {  // default
        ProcessingObject = oes.ProcessingObject;
      }
      // update statistics
      this.entryNode.nmrOfArrivedObjects++;
      // create newly arrived processing object
      procObj = new ProcessingObject({arrivalTime: this.occTime});
      sim.addObject( procObj);
      // invoke onArrival event rule method
      if (this.entryNode.onArrival) followupEvents = this.entryNode.onArrival();
      if (this.entryNode.successorNode) {
        // push newly arrived object to the inputBuffer of the next node
        this.entryNode.successorNode.inputBuffer.push( procObj);
        // is the follow-up processing node available?
        if (this.entryNode.successorNode.status === rESOURCEsTATUS.AVAILABLE) {
          this.entryNode.successorNode.status = rESOURCEsTATUS.BUSY;
          followupEvents.push( new pROCESSINGaCTIVITYsTART({
            occTime: this.occTime + sim.nextMomentDeltaT,
            processingNode: this.entryNode.successorNode,
            resourceRoles: this.entryNode.resourceRoles || {}
          }));
        }
      }
      // implement the recurrence of aRRIVAL events
      if (!this.entryNode.maxNmrOfArrivals ||
          this.entryNode.nmrOfArrivedObjects < this.entryNode.maxNmrOfArrivals) {
        // has an arrival recurrence function been defined for the entry node?
        if (this.entryNode.arrivalRecurrence) {
          occT = this.occTime + this.entryNode.arrivalRecurrence();
        } else {  // use the default recurrence
          occT = this.occTime + oes.Arrival.defaultRecurrence();
        }
        sim.scheduleEvent( new oes.Arrival({
          occTime: occT, entryNode: this.entryNode}));
      }
      return followupEvents;
    }
  }
});
// define the exponential distribution as the default inter-arrival time
oes.Arrival.defaultEventRate = 1;
oes.Arrival.defaultRecurrence = function () {
  return rand.exponential( oes.Arrival.defaultEventRate);
};
/**
 * Departure events have two participants: an exit node and the departing object.
 */
oes.Departure = new cLASS({
  Name: "dEPARTURE", label:"Departure", shortLabel:"Dep",
  supertypeName: "eVENT",
  properties: {
    "exitNode": {range: "eXITnODE"}
  },
  methods: {
    "onEvent": function () {
      var followupEvents = [];
      // pop processing object from the input queue
      var procObj = this.exitNode.inputBuffer.shift();
      // update statistics
      this.exitNode.nmrOfDepartedObjects++;
      this.exitNode.cumulativeTimeInSystem += this.occTime - procObj.arrivalTime;
      // invoke onDeparture event rule method
      if (typeof this.exitNode.onDeparture === "function") {
        followupEvents = this.exitNode.onDeparture();
      }
      // remove object from simulation
      sim.removeObject( procObj);
      return followupEvents;
    }
  }
});
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

