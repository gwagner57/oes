/*******************************************************************************
 * OES JS Core 1 Foundation Objects and Classes
 *
 * @copyright Copyright 2020 Gerd Wagner
 *   Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

// Create initial (namespace) objects/maps/arrays
const sim = Object.create(null);
sim.model = Object.create(null);
sim.model.v = Object.create(null); // map of (global) model variables
sim.model.f = Object.create(null); // map of (global) model functions
sim.model.p = Object.create(null); // map of model parameters
sim.scenario = Object.create(null);  // default scenario record/object
sim.scenarios = [];  // list of alternative scenarios
sim.stat = Object.create(null); // map of statistics variables
sim.experimentTypes = [];

var oes = Object.create(null);  // cannot be const, since also defined in simulatorUI.js
oes.defaults = {
  nextMomentDeltaT: 0.01,
  expostStatDecimalPlaces: 2,
  simLogDecimalPlaces: 2,
  timeSeriesCompressionRate: 1,  // number of array values to be compressed into one value
  showResPoolsInLog: false
};

/**
 * An OES object has an ID and may have a unique name. If no ID value is provided on creation,
 * an ID value is automatically assigned using the simulation scenarios "idCounter".
 */
class oBJECT {
  constructor( id, name) {
    this.id = id || sim.idCounter++;
    if (name) this.name = name;  // optional
    // add each new object to Map of simulation objects
    sim.objects.set( this.id, this);
  }
  // overwrite/improve the standard toString method
  toString() {
    const Class = this.constructor,
          decPl = oes.defaults.simLogDecimalPlaces;
    var i=0, valStr="", str="";
    if (this.name) str = `${this.name}{ `;
    else str = (Class.labels?.className || Class.name) + `-${this.id}{ `;
    for (const prop of Object.keys( this)) {
      if (!Class.labels || !Class.labels[prop]) continue;
      var propLabel = (Class.labels && Class.labels[prop]) ? Class.labels[prop] : "",
          val = this[prop];
      if (typeof val === "number" && !Number.isInteger( val)) {
        valStr = String( math.round( val, decPl));
      } else if (Array.isArray( val)) {
        valStr = "["+ val.map( v => v.id).toString() +"]";
      } else if (typeof val === "object") {
        if (val instanceof oBJECT) valStr = String( val.id);
        else valStr = "{"+ val.toString() +"}";
      } else valStr = JSON.stringify( val);
      if (propLabel && val !== undefined) {
        str += (i>0 ? ", " : "") + propLabel +":"+ valStr;
        i = i+1;
      }
    }
    return str +"}";
  }
}
/**
 * An OES event may be instantaneous or it may have a non-zero duration.
 */
class eVENT {
    constructor({occTime, delay, startTime, duration, node}) {
      if (typeof occTime === "number" && occTime >= sim.time) {
        this.occTime = occTime;
      } else if (typeof delay === "number" && delay > 0) {
        this.occTime = sim.time + delay;
      } else if (typeof startTime === "number" && startTime >= sim.time) {  // e.g., an activity
        this.startTime = startTime;
        if (duration) {
          this.duration = duration;
          this.occTime = startTime + duration;
        }
      } else if (this.constructor.eventRate) {  // exogenous/recurrent event
        this.occTime = sim.time + rand.exponential( this.constructor.eventRate);
      } else if (this.constructor.recurrence) {  // exogenous/recurrent event
        this.occTime = sim.time + this.constructor.recurrence();
      } else {
        this.occTime = sim.time + sim.nextMomentDeltaT;
      }
      if (node) {
        this.node = node;
      } else if (sim.model.isAN && Object.getPrototypeOf( this.constructor) === eVENT &&
                 !["aCTIVITYsTART","aCTIVITYeND"].includes( this.constructor.name)) {
        // assign AN event node using the default node name
        const nodeName = oes.getNodeNameFromEvtTypeName( this.constructor.name);
        this.node = sim.scenario.networkNodes[nodeName];
      }
  }
  // overwrite/improve the standard toString method
  toString() {
    const Class = this.constructor,
          eventTypeName = Class.labels?.className || Class.name,
          decPl = oes.defaults.simLogDecimalPlaces;
    var slotListStr="", i=0, evtStr="", valStr="";
    Object.keys( this).forEach( function (prop) {
      const propLabel = (Class.labels && Class.labels[prop]) ? Class.labels[prop] : "",
            val = this[prop];
      if (propLabel && val !== undefined) {
        if (val instanceof oBJECT) valStr = String( val.id);
        else valStr = JSON.stringify( val);
        slotListStr += (i>0 ? ", " : "") + propLabel +": "+ valStr;
        i = i+1;
      }
    }, this);
    if (slotListStr) evtStr = `${eventTypeName}{ ${slotListStr}}`;
    else evtStr = eventTypeName;
    return `${evtStr}@${math.round(this.occTime,decPl)}`;
  }
  // an event priority comparison function for Array.sort
  static rank( e1, e2) {
    var p1=0, p2=0;
    if (e1.constructor.priority) p1 = e1.constructor.priority;
    if (e2.constructor.priority) p2 = e2.constructor.priority;
    return p2 - p1;
  }
}
/******************************************************************************
 *** Experiment Classes *******************************************************
 ******************************************************************************/
/**
 * A complex datatype for experiment parameter definitions
 * @author Gerd Wagner
 */
class eXPERIMENTpARAMdEF {
  constructor({name, values, startValue, endValue, stepSize=1}) {
    this.name = name;
    if (values) this.values = values;  // optional, an array list of numbers
    if (startValue) this.startValue = startValue;
    if (endValue) this.endValue = endValue;
    if (stepSize) this.stepSize = stepSize;
  }
}
/**
 * An experiment type is defined for a model.
 */
class eXPERIMENTtYPE {
  constructor({model, title, nmrOfReplications, parameterDefs=[], seeds=[]}) {
    this.model = model;  // optional (by default the model is defined in the context)
    this.title = title;  // the combination of model and title forms an ID
    this.nmrOfReplications = nmrOfReplications;
    this.parameterDefs = parameterDefs;  // an array list
    this.seeds = seeds;  // an array list with seeds.length = nmrOfReplications
    this.scenarios = [];  // experiment scenarios (will be created at runtime)
  }
}
/**
 * An experiment run is based on a specific scenario.
 */
class eXPERIMENTrUN {
  constructor({id, experimentType, baseScenarioNo, dateTime}) {
    this.id = id;  // an AutoNumber (possibly a timestamp)
    this.experimentType = experimentType;
    this.baseScenarioNo = baseScenarioNo;  // relative to model
    this.dateTime = dateTime;
  }
}
eXPERIMENTrUN.getAutoId = function () {
  return (new Date()).getTime();
};

class eXPERIMENTsCENARIOrUN {
  constructor({id, experimentRun, experimentScenarioNo,
                parameterValueCombination, outputStatistics}) {
    this.id = id;  // an AutoNumber (possibly a timestamp)
    this.experimentRun = experimentRun;
    this.experimentScenarioNo = experimentScenarioNo;
    this.parameterValueCombination = parameterValueCombination;
    this.outputStatistics = outputStatistics;
  }
}
eXPERIMENTsCENARIOrUN.getAutoId = function () {
  return (new Date()).getTime();
};

/******************************************************************************
 *** Activities Package *******************************************************
 ******************************************************************************/

// Datatype class for plain queues (with an optional capacity)
class qUEUE extends Array {
  constructor( capacity) {
    super();
    if (capacity) this.capacity = capacity;
    else this.capacity = Infinity;
  }
  enqueue( item) {
    if (this.length < this.capacity) {
      this.push( item);  // add item to queue
    }
  }
  dequeue() {
    return this.length>0 ? this.shift() : null;
  }
}

// An activity state (of an object) is a set of activity type names
class aCTIVITYsTATE extends Set {
  constructor() {
    super();
  }
  toString() {
    var arr = [...this.values()];
    return arr.toString();
  }
}

/****************************************************************************
 "out of order": defective/broken/ill
 "out of duty":  applies to human/performer resources only
 "blocked":      applies to processing nodes/stations only, which may be blocked
                 because the input buffer of their successor station is full
 ****************************************************************************/
const rESOURCEsTATUS = new eNUMERATION("ResourceStatusEL",
    ["available","busy","out of order","out of duty","blocked"]);
const rESsTAT = rESOURCEsTATUS;  // shortcut

/****************************************************************************
 A resource pool can take one of two forms:
 (1) a count pool abstracts away from individual resources and just maintains
 an "available" counter of the available resources of some type
 (2) an individual pool is a collection of individual resource objects

 Each resource role must be associated with a pool. By default, a count pool
 is directly associated with a resource role, while an individual pool is
 associated with the range of a resource role, which is a resource type. Resource
 pools may be globally indexed in the map "sim.scenario.resourcePools" with resource type
 names or resource role names as keys. Otherwise, if they are identified by
 the combination of node and resRoleName, they can be locally indexed
 in the map "node.resourceRoles[resRoleName].resourcePool".

 For any performer role (defined in an activity type definition), an individual
 pool is defined with a (lower-cased and pluralized) name obtained from the
 role's range name if it's a position or, otherwise, from the closest position
 subtyping the role's range.
 ****************************************************************************/
class rESOURCEpOOL {
  constructor({name, size, available, resourceType, resources}) {
    this.name = name;
    if (Number.isInteger( size) || size === Infinity) {  // a count pool
      this.size = size;
      if (!Number.isInteger( available)) this.available = size;
      else this.available = available;
    } else if (resourceType) {  // an individual pool
      this.resourceType = resourceType;
      this.busyResources = [];
      this.availResources = [];
      if (Array.isArray( resources)) {
        for (const res of resources) {
          if (res.status === rESOURCEsTATUS.AVAILABLE) this.availResources.push( res);
          else if (res.status === rESOURCEsTATUS.BUSY) this.busyResources.push( res);
        }
      }
    } else {
      console.log(`Resource pool ${name} is not well-defined!`)
    }
    this.dependentNodes = [];
  }
  isAvailable( card=1) {
    if (this.resourceType) {  // individual pool
      if (this.availResources.length >= card) return true;
      // check if there are alternative resources
      const altResTypes = this.resourceType.alternativeResourceTypes;
      if (Array.isArray( altResTypes) && altResTypes.length > 0) {
        const rP = sim.Classes[altResTypes[0]].resourcePool;
        return rP && rP.isAvailable( card);
      } else return false;
    } else return this.available >= card;
  }
  nmrAvailable() {
    return this.availResources?.length || this.available;
  }
  allocateAll() {
    if (this.availResources) {  // individual pool
      let allocatedRes = [...this.availResources];
      for (const res of this.availResources) {
        res.status = rESOURCEsTATUS.BUSY;
        this.busyResources.push( res);
      }
      this.availResources.length = 0;
      return allocatedRes;
    } else this.available = 0;  // count pool
  }
  allocate( card=1) {
    var rP=null;
    if (this.availResources) {  // individual pool
      if (this.availResources.length >= card) {
        rP = this;
      } else {
        const altResTypes = this.resourceType.alternativeResourceTypes;
        if (Array.isArray( altResTypes) && altResTypes.length > 0) {
          //TODO: use all altResTypes, not just altResTypes[0]
          rP = sim.Classes[altResTypes[0]].resourcePool;
          if (!rP?.isAvailable( card)) rP = null;
        }
      }
      if (!rP) {
        console.error(`The pool ${this.name} does not have enough resources at simulation step ${sim.step}!`,
            JSON.stringify(this));
        return [];
      }
      if (rP !== this) {
        console.log(`Allocate ${this.resourceType.name} from pool ${rP.name}`);
      }
      // remove the first card resources from availResources
      const allocatedRes = rP.availResources.splice( 0, card);
      for (const res of allocatedRes) {
        res.status = rESOURCEsTATUS.BUSY;
        rP.busyResources.push( res);
      }
      return allocatedRes;
    } else {  // count pool
      this.available -= card;
    }
  }
  release( nmrOrRes) {  // number or resource(s)
    if (nmrOrRes === undefined) nmrOrRes = 1;
    if (typeof nmrOrRes === "number" && this.size) {  // count pool
      this.available += nmrOrRes;
    } else if (typeof nmrOrRes === "object") {  // individual pool
      let resources = nmrOrRes;
      if (!Array.isArray( resources)) resources = [resources];
      for (const res of resources) {
        const i = this.busyResources.indexOf( res);
        if (i === -1) {
          console.error(`The pool ${this.name} does not contain resource ${res.name} 
at simulation step ${sim.step}!`);
          return;
        } else {
          // remove resource from busyResources list
          this.busyResources.splice( i, 1);
          // add resource to availResources list
          res.status = rESOURCEsTATUS.AVAILABLE;
          this.availResources.push( res);
        }
      }
    } else {
      console.error(`Release attempt for pool ${this.name} with "nmrOrRes" = ${nmrOrRes} failed 
at simulation step ${sim.step}!`);
      return;
    }
    // try starting enqueued tasks depending on this type of resource
    for (const node of this.dependentNodes) {
      node.ifAvailAllocReqResAndStartNextActivity();
    }
  }
  clear() {
    if (this.resourceType) {  // individual pool
      // resources are added in setupInitialState
      this.busyResources.length = 0;
      this.availResources.length = 0;
    } else {  // count pool
      this.available = this.size;
    }
  }
  toString() {
    if (this.resourceType) {  // individual pool
      const availRes = this.availResources.map( r => r.name || r.id);
      return `av. ${this.name}: ${availRes}`;
    } else {
      return `av. ${this.name}: ${this.available}`;
    }
  }
}

/**
 * 
 */
class nODE extends oBJECT {
  constructor({id, name, successorNodeName, successorNodeExpr, successorNodeNames}) {
    super( id||name, name);  // if not defined, set id to name
    // a fixed successor node name
    if (successorNodeName) this.successorNodeName = successorNodeName;
    // a dynamic successor node name specified as an expression for XOR splitting
    if (successorNodeExpr) this.successorNodeExpr = successorNodeExpr;
    // a map with node names as keys and conditions as values for OR/AND splitting
    if (successorNodeNames) this.successorNodeNames = successorNodeNames;
  }
  getSuccessorNode() {
    //TODO: node.successorNodeNames may be a map from names to conditions for (X)OR/AND splitting
    let succNode = null;
    if (this.successorNode || this.successorNodeName || this.successorNodeExpr) {
      if (this.successorNode) {
        succNode = this.successorNode;
      } else if (typeof this.successorNodeName === "function") {
        succNode = sim.scenario.networkNodes[this.successorNodeName()];
      } else if (typeof this.successorNodeExpr === "function") {
        const succActyTypeName = this.successorNodeExpr();
        const successorNodeName = oes.getNodeNameFromActTypeName(succActyTypeName);
        succNode = sim.scenario.networkNodes[successorNodeName];
      }
    }
    return succNode;
  }
  toString() {
    return "";  // overwrite the default event serialization
  }
}
/**
 * Event nodes are abstract objects are associated with an event type and a performer
 * such that events of that type schedule a successor activity to be performed by
 * this performer. The definition of an event node may include defining the associated
 * event type, or referencing an already defined event type.
 *
 * When an event node is not a "successorNode" for any other node, it represents a start
 * node (where processes start). When an event node does not have a "successorNode"
 * attribute slot, it represents an end node (where processes end).
 *
 * A "maxNmrOfEvents" attribute slot of a start event node allows defining a maximum number
 * of events after which no more events of the given type at the given node will be
 * created (and, consequently, the simulation may run out of future events).
 *
 * An "eventRate" attribute slot allows defining the event rate parameter of an
 * exponential PDF used for computing the time between two consecutive events.
 *
 * An "eventRecurrence" method slot allows computing the recurrence of events. If
 * neither an "eventRate" attribute nor an "eventRecurrence" method are defined, the
 * exponential distribution with an event rate of 1 is used as a default recurrence.
 *
 * Event nodes may have an event rule method "onEvent".
 *
 * Event nodes have a built-in (read-only) statistics attribute "nmrOfEvents"
 * counting the number of events that have occurred at the given event node.
 */
class eVENTnODE extends nODE {
  constructor({id, name, eventTypeName, eventRate, eventRecurrence, maxNmrOfEvents,
                successorNodeName, successorNodeExpr, successorNodeNames}) {
    super({id, name, successorNodeName, successorNodeExpr, successorNodeNames});
    this.eventTypeName = eventTypeName;
    if (eventRate) this.eventRate = eventRate;
    if (eventRecurrence) this.eventRecurrence = eventRecurrence;
    if (maxNmrOfEvents) this.maxNmrOfEvents = maxNmrOfEvents;
    this.nmrOfEvents = 0;
  }
}
/*
 * Activity nodes are abstract objects associated with an activity type and a performer
 * such that activities of that type are performed by that performer (at this node).
 * The definition of an activity node may include defining the associated activity type,
 * or referencing an already defined activity type.
 *
 * In simple cases, a model does not specify an AN explicitly, but only implicitly by
 * constructing exactly one node for each event type and activity type. In this case,
 * the nodes resource roles (including the performer) and duration are provided by the
 * activity type.
 *
 * An activity node may have a "duration" attribute slot with a fixed value or a (random
 * variable) function expression.
 *
 * When an activity node is not a "successorNode" for any other node, it represents a start
 * node (where processes start via exogenous activity start events). When an activity node
 * does not have a "successorNode" attribute slot, it represents an end node (where processes end).
 */
class aCTIVITYnODE extends nODE {
  constructor({id, name, activityTypeName, resourceRoles, duration, waitingTimeout,
                successorNodeName, successorNodeExpr, successorNodeNames}) {
    super({id, name, successorNodeName, successorNodeExpr, successorNodeNames});
    // a user-defined subclass of aCTIVITY
    if (activityTypeName) {
      this.activityTypeName = activityTypeName;
      // copy resourceRoles from AT to node
      if (!resourceRoles) this.resourceRoles = sim.Classes[activityTypeName].resourceRoles;
    }
    if (resourceRoles) {
      for (const resRoleName of Object.keys(resourceRoles)) {
        const resRole = resourceRoles[resRoleName];
        if (typeof resRole.range === "string") resRole.range = sim.Classes[resRole.range];
      }
      this.resourceRoles = resourceRoles;
    }
    // a fixed value or a random variable function expression
    if (duration) this.duration = duration;
    // a fixed value or a random variable function expression
    if (waitingTimeout) this.waitingTimeout = waitingTimeout;
    // create empty task queue
    this.tasks = new qUEUE();
  }
  ifAvailAllocReqResAndStartNextActivity( nextActy) {
    const taskQueue = this.tasks;
    if (!nextActy) {
      if (taskQueue.length === 0) return false;  // no next activity to start
      else nextActy = taskQueue[0];
    }
    // take care of waiting timeouts
    while (nextActy.waitingTimeout && sim.time > nextActy.waitingTimeout) {
      // remove nextActy from queue
      taskQueue.dequeue();
      // increment the waitingTimeouts statistic
      sim.stat.networkNodes[this.name].waitingTimeouts++;
      if (taskQueue.length === 0) return false;
      else nextActy = taskQueue[0];
    }
    const resRoles = this.resourceRoles;
    // Are all required resources available?
    if (Object.keys( resRoles)
        // test only for resources not yet assigned
        .filter( resRoleName => !nextActy[resRoleName])
        .map( resRoleName => resRoles[resRoleName])
        .every( resRole => (resRole.resourcePool?.isAvailable( resRole.card||resRole.minCard) ||
            resRole.range?.resourcePool?.isAvailable( resRole.card||resRole.minCard)))) {
      // remove nextActy from queue if it's its head element
      if (nextActy === taskQueue[0]) taskQueue.dequeue();
      // Allocate all required resources
      for (const resRoleName of Object.keys( resRoles)) {
        if (!nextActy[resRoleName]) {
          const resRole = resRoles[resRoleName],
              resPool = resRole.resourcePool ?? resRole.range.resourcePool;
          // allocate the required/maximal quantity of resources from the pool
          let resQuantity=0;
          if (resRole.card) resQuantity = resRole.card;
          else if (resRole.maxCard) {
            resQuantity = Math.min( resRole.maxCard, resPool.nmrAvailable());
          } else resQuantity = 1;  // default
          const allocatedRes = resPool.allocate( resQuantity);
          if (allocatedRes) {  // individual resource pool
            // create an activity property slot for this resource role
            if (allocatedRes.length === 1) {
              nextActy[resRoleName] = allocatedRes[0];
            } else {
              nextActy[resRoleName] = allocatedRes;
            }
          }
        }
      }
      this.scheduleActivityStartEvent( nextActy);
      return nextActy;
    } else {
      return null;
    }
  }
  scheduleActivityStartEvent( acty) {
    sim.FEL.add( new aCTIVITYsTART({plannedActivity: acty}));
  }
  toString() {
    var str = this.name + `{ tasks:${this.tasks.length}}`;
    return str;
  }
}
/**
 *  Activities are composite events that have some duration and typically depend on
 *  resources. They are composed of an activity start and an activity end event.
 *  Their duration may be either pre-set to a fixed value or to a random value (implying
 *  that they have a scheduled end event), or it may be determined by the occurrence
 *  of an activity end event that is caused by another simulation event (in which case
 *  they have an "open end"). The duration of a pre-set duration activity can be defined
 *  in 2 ways: either for all activities of some type AT by a) a class-level attribute
 *  AT.duration or b) a class-level function AT.duration().
 *
 *  Activities often depend on resources. The actor(s) that (jointly) perform(s) an
 *  activity, called performer(s), are (a) special resource(s). Since a
 *  resource-constrained activity can only be started when all required resources are
 *  available, it may first have to be enqueued as a task (= planned activity).
 *
 *  For any resource of an activity, its utilization by that activity during a certain
 *  time period is measured by the simulator and can be included in the ex-post statistics.
 *
 *  In a simulation model, an activity type is defined as a subtype of the OES class
 *  "aCTIVITY" with an optional class-level "duration" attribute (or function expression).
 *
 *  At any simulation step there is a (possibly empty) set of *ongoing* activities.
 *  The objects that participate in an ongoing activity as resources are in a
 *  certain activity state (e.g., "service-performing").
 *
 *  A pre-defined event type aCTIVITYsTART is used for scheduling activity start
 *  events.
 *
 *  TODO:
 *   - Use all altResTypes, not just altResTypes[0] in rESOURCEpOOL::allocate(...)
 *   - Support built-in WaitingTimeout events related to the Activity::onWaitingTimeout() function
 *   - Introduce task priorities defined per activity type as a number between 0 and 100.
 *   - introduce task preemption
 *   - support the two allocation policies: (1) allocate all resources at once, and (2) allocate resources step by step
 *   - an optional processOwner (= institutional agent); if there is only one (= no collaboration), it may be left implicit
 *     if there are two or more processOwners, can an activity type be included in more than one process container (= Pool)?
 *     if yes, it may have different performers (and other resource pools) in different process containers
 */
// An abstract class
class aCTIVITY extends eVENT {
  // startTime=0 indicates to the eVENT constructor that this is an aCTIVITY
  constructor({id, occTime, startTime=0, duration, node, enqueueTime}) {
    super({occTime, startTime, duration});
    if (!node && sim.model.isAN) {  // assign AN node using the default node name
      const nodeName = oes.getNodeNameFromActTypeName( this.constructor.name);
      node = sim.scenario.networkNodes[nodeName];
    }
    // set activity duration if defined by node or activity type
    if (!duration) {
      const AT = this.constructor;
      if (node?.duration) {
        this.duration = typeof node.duration === "function" ?
            node.duration() : node.duration;
      } else if (AT.duration) {
        this.duration = typeof AT.duration === "function" ?
            AT.duration() : AT.duration;
      } else {
        this.duration = aCTIVITY.defaultDuration();
      }
    }
    if (id) this.id = id;
    else this.id = sim.idCounter++;  // activities need an ID
    this.node = node;
    if (enqueueTime) this.enqueueTime = enqueueTime;
  }
  releaseResources( resRoleNamesSharedWithSuccActivity) {
    const node = this.node,
          resourceRoles = node?.resourceRoles ?? this.constructor.resourceRoles,
          resRoleNames = Object.keys( resourceRoles);
    for (const resRoleName of resRoleNames) {
      const resRole = resourceRoles[resRoleName];
      if (resRoleNamesSharedWithSuccActivity?.includes( resRoleName) ||
          resRole.deferredRelease) continue;
      if (resRole.countPoolName) {
        // release the used number of count pool resources
        resRole.resourcePool.release( resRole.card);
      } else {
        const resObj = this[resRoleName];
        // if it has not been transferred to succActy and is not subject to deferredRelease
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
  startOrEnqueue() {
    // if available, allocate required resources and start activity
    const nextActy = this.node.ifAvailAllocReqResAndStartNextActivity( this);
    if (!nextActy) {
      const taskQueue = this.node.tasks;
      this.enqueueTime = sim.time;
      if (typeof this.node.waitingTimeout === "function") {
        this.waitingTimeout = sim.time + this.node.waitingTimeout();
      }
      taskQueue.enqueue( this);  // add acty to task queue
      const nodeStat = sim.stat.networkNodes[this.node.name];
      nodeStat.enqueuedActivities += 1;
      // compute generic task queue length statistics
      if (taskQueue.length > nodeStat.queueLength.max) {
        nodeStat.queueLength.max = taskQueue.length;
      }
    }
  }
}
// define the exponential PDF as the default duration random variable
aCTIVITY.defaultDurationMean = 1;
aCTIVITY.defaultDuration = function () {
  return rand.exponential( 1/aCTIVITY.defaultDurationMean)
};
/*
 * aCTIVITYsTART events are scheduled with a constructor parameter "plannedActivity"
 * (of some type AT), dequeued from the activity node's task queue. It is an option
 * to assign a duration at activity start time
 * by providing a duration argument to the activity start event constructor.
 * The value of the activityState property of all involved resource objects
 * is updated by adding the activity type name (the activityState is a set of all
 * type names of those activities, in which the object is currently participating).
 */
class aCTIVITYsTART extends eVENT {
  // allow
  constructor({occTime, delay, plannedActivity}) {
    super({occTime, delay});
    this.plannedActivity = plannedActivity;
  }
  onEvent() {
    const acty = this.plannedActivity,
          node = acty.node,
          resourceRoles = node.resourceRoles,
          actyTypeName = node.activityTypeName || "ProcActy",  // the activity's type/class
          followupEvents=[];
    // set  new activity
    acty.startTime = this.occTime;
    // update statistics
    sim.stat.networkNodes[node.name].startedActivities++;
    // set activity state for all involved resource objects
    for (const resRoleName of Object.keys( resourceRoles)) {
      if (resourceRoles[resRoleName].range) {  // an individual pool
        let resObjects = acty[resRoleName];
        if (!Array.isArray( resObjects)) resObjects = [resObjects];
        for (const resObj of resObjects) {
          if (!resObj.activityState) resObj.activityState = new aCTIVITYsTATE();
          resObj.activityState.add( actyTypeName);
        }
      }
    }
    // register new activity as an ongoing activity
    sim.ongoingActivities[acty.id] = acty;
    // if there is an onActivityStart procedure, execute it
    if (typeof acty.onActivityStart === "function") {
      followupEvents.push(...acty.onActivityStart());
    }
    // Schedule an activity end event if the duration is known
    if (acty.duration) {
      let actyEndEvt=null;
      if (typeof pROCESSINGaCTIVITY === "function" && acty instanceof pROCESSINGaCTIVITY) {
        actyEndEvt = new pROCESSINGaCTIVITYeND({delay: acty.duration, activity: acty});
      } else {  // a plain activity
        actyEndEvt = new aCTIVITYeND({delay: acty.duration, activity: acty});
      }
      followupEvents.push( actyEndEvt);
    }
    return followupEvents;
  }
  toString() {
    var decPl = oes.defaults.simLogDecimalPlaces,
        acty = this.plannedActivity, AT = acty.constructor,
        evtTypeName = (AT.shortLabel || AT.name) + "Start",
        evtStr="", slotListStr="";
    Object.keys( AT.resourceRoles).forEach( function (resRoleName) {
      if (AT.resourceRoles[resRoleName].range) {
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
class aCTIVITYeND extends eVENT {
  constructor({occTime, delay, activity}) {
    super({occTime, delay});
    this.activity = activity;
  }
  onEvent() {
    const acty = this.activity,
          node = acty.node,
          AT = acty.constructor,  // the activity's type/class
          resourceRoles = node?.resourceRoles ?? AT.resourceRoles,
          resRoleNames = Object.keys( resourceRoles),
          followupEvents=[];
    let namesOfSharedResRoles=[];
    // if there is an onActivityEnd procedure, execute it
    if (typeof acty.onActivityEnd === "function") {
      followupEvents.push(...acty.onActivityEnd());
    }
    // set the occurrence time of the activity
    acty.occTime = this.occTime;
    // set duration if there is no pre-set duration
    if (!acty.duration) {
      acty.duration = acty.occTime - acty.startTime;
    }
    // drop activity from map/collection of ongoing activities
    delete sim.ongoingActivities[this.activity.id];

    if (node) {  // update AN statistics
      const nodeStat = sim.stat.networkNodes[node.name],
            waitingTimeStat = nodeStat.waitingTime,
            cycleTimeStat = nodeStat.cycleTime,
            resUtilPerNode = nodeStat.resUtil;
      nodeStat.completedActivities++;
      const waitingTime = acty.enqueueTime ? acty.startTime - acty.enqueueTime : 0;
      //waitingTimeStat.total += waitingTime;
      if (waitingTimeStat.max < waitingTime) waitingTimeStat.max = waitingTime;
      const cycleTime = waitingTime + acty.occTime - acty.startTime;
      //cycleTimeStat.total += cycleTime;
      if (cycleTimeStat.max < cycleTime) cycleTimeStat.max = cycleTime;
      // compute resource utilization per node (per resource object or per count pool)
      for (const resRoleName of resRoleNames) {
        const resRole = resourceRoles[resRoleName];
        if (resRole.range) {  // per resource object
          let resObjects = acty[resRoleName];
          if (!Array.isArray( resObjects)) resObjects = [resObjects];
          for (const resObj of resObjects) {
            resUtilPerNode[String(resObj.id)] += acty.duration;
            // update the activity state of resource objects
            resObj.activityState.delete( AT.name);
          }
        } else {  // per count pool
          resUtilPerNode[resRole.countPoolName] += acty.duration;
        }
      }
    }
    // execute this code only for AN activity nodes, and not for PN nodes
    if (node.constructor === aCTIVITYnODE) {  // isDirectInstanceOf
      const succNode = node.getSuccessorNode();
      if (succNode) {
        const SuccAT = sim.Classes[succNode.activityTypeName];
        const succActy = new SuccAT({node: succNode});
        const succResRoles = succNode.resourceRoles ?? SuccAT.resourceRoles,
              succResRoleNames = Object.keys( succResRoles);
        // By default, keep (individual) resources that are shared between AT and SuccAT
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
        // assign variable for passing the list of shared resource roles
        namesOfSharedResRoles = succActy.resRoleNamesSharedWithPredActivity;
        // start or enqueue a successor activity according to the AN model
        // are all successor activity resources already allocated (since included in activity resources)?
        if (succResRoleNames.every( rn => resRoleNames.includes( rn))) {
          // start successor activity with transferred resources
          followupEvents.push( new aCTIVITYsTART({plannedActivity: succActy}));
        } else {  // start/enqueue successor activity
          succActy.startOrEnqueue();
        }
      }
      // release all non-transferred resources of acty
      acty.releaseResources( namesOfSharedResRoles);
      // if there are still planned activities in the task queue
      if (node.tasks.length > 0) {
        // if available, allocate required resources and start next activity
        node.ifAvailAllocReqResAndStartNextActivity();
      }
    }
    return followupEvents;
  }
  toString() {
    var decPl = oes.defaults.simLogDecimalPlaces,
        acty = this.activity,
        AT = acty.constructor,  // the activity's type/class
        eventTypeName = (AT.shortLabel || AT.name) + "End",
        evtStr = "", slotListStr = "";
    Object.keys( acty.node.resourceRoles).forEach(function (resRoleName) {
      if (acty.node.resourceRoles[resRoleName].range) {
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
    if (slotListStr) evtStr = `${eventTypeName}{ ${slotListStr}}`;
    else evtStr = eventTypeName;
    return `${evtStr}@${math.round(this.occTime, decPl)}`;
  }
}

/*********************************************************
* Get the corresponding AN node name from a type name
* as the lower-cased type name suffixed by "{Evt|Act}Node"
**********************************************************/
oes.getNodeNameFromTypeName = function (typeName) {
  const suffix = sim.model.eventTypes.includes( typeName) ? "EvtNode" : "Node";
  return typeName.charAt(0).toLowerCase() + typeName.slice(1) + suffix;
};
oes.getNodeNameFromEvtTypeName = function (evtTypeName) {
  return evtTypeName.charAt(0).toLowerCase() + evtTypeName.slice(1) + "EvtNode";
};
oes.getNodeNameFromActTypeName = function (actTypeName) {
  return actTypeName.charAt(0).toLowerCase() + actTypeName.slice(1) + "Node";
};
/*********************************************************
 * Construct the implicitly defined AN
 **********************************************************/
oes.constructImplicitlyDefinedActNet = function () {
  // construct the event nodes of the implicitly defined AN model
  for (const evtTypeName of sim.model.eventTypes) {
    const ET = sim.Classes[evtTypeName];
    // the AN node name is the lower-cased type name suffixed by "{Evt|Act}Node"
    const nodeName = oes.getNodeNameFromEvtTypeName( evtTypeName);
    sim.model.networkNodes[nodeName] = {name: nodeName, typeName:"eVENTnODE", eventTypeName: evtTypeName};
    if (ET.successorNode) {
      sim.model.networkNodes[nodeName].successorNodeName =
          oes.getNodeNameFromActTypeName( ET.successorNode);
    }
  }
  // construct the activity nodes of the implicitly defined AN model
  for (const actTypeName of sim.model.activityTypes) {
    const AT = sim.Classes[actTypeName];
    AT.resourceRoles ??= Object.create(null);  // make sure AT.resourceRoles is defined
    // the AN node name is the lower-cased type name suffixed by "{E|A}Node"
    const nodeName = oes.getNodeNameFromActTypeName( actTypeName);
    const node = sim.model.networkNodes[nodeName] =
        {name: nodeName, typeName:"aCTIVITYnODE", activityTypeName: actTypeName};
    if (AT.waitingTimeout) node.waitingTimeout = AT.waitingTimeout;
    if (AT.successorNode) {
      if (typeof AT.successorNode === "string") {
        node.successorNodeName = oes.getNodeNameFromActTypeName( AT.successorNode);
      } else if (typeof AT.successorNode === "function") {
        node.successorNodeExpr = AT.successorNode;
      }
    }
  }
};
/*********************************************************************
 * Create resource pools for AN activity nodes and PN processing nodes
 *********************************************************************/
oes.createResourcePools = function () {
  for (const nodeName of Object.keys( sim.model.networkNodes)) {
    const node = sim.model.networkNodes[nodeName];
    // skip any non-activity node
    if (!["activitynode","processingactivitynode","processingnode"].includes(
        node.typeName.toLowerCase())) continue;
    const resourceRoles = node.resourceRoles ||
        sim.Classes[node.activityTypeName]?.resourceRoles || {};
    for (const resRoleName of Object.keys( resourceRoles)) {
      const resRole = resourceRoles[resRoleName];
      if (typeof resRole.range === "string") resRole.range = sim.Classes[resRole.range];
      let pn="";
      // set default cardinality
      if (!resRole.card && !resRole.minCard) resRole.card = 1;
      if (resRole.range) {  // the resource role is associated with an individual pool
        const rn = resRole.range.name;
        // the pool name is the lower-cased pluralized range name
        pn = rn.charAt(0).toLowerCase() + rn.slice(1) + "s";
        // create only if not yet created
        sim.scenario.resourcePools[pn] ??= new rESOURCEpOOL({name: pn, resourceType: resRole.range});
        // assign the (newly created) resource pool to the resource type
        resRole.range.resourcePool = sim.scenario.resourcePools[pn];
      } else {  // the resource role is associated with a count pool
        if (resRole.countPoolName) {
          // a count pool has been explicitly assigned to the resource role
          pn = resRole.countPoolName;
        } else {
          // create default name for implicit count pool
          pn = resRoleName + (!resRole.card||resRole.card===1 ? "s":"");
          // assign count pool to the resource role
          resRole.countPoolName = pn;
        }
        // create count pool only if not yet created
        sim.scenario.resourcePools[pn] ??= new rESOURCEpOOL({name: pn, size:0});
        // assign the (newly created) pool to the resource role
        resRole.resourcePool = sim.scenario.resourcePools[pn];
      }
    }
  }
};
/*******************************************************
 * Initialize resource pools
 ********************************************************/
oes.initializeResourcePools = function () {
  for (const poolName of Object.keys( sim.scenario.resourcePools)) {
    const pool = sim.scenario.resourcePools[poolName];
    pool.clear();
    // add to simulation objects map (reconstructed for each scenario run)
    sim.objects.set( poolName, pool);
  }
};
/*******************************************************
 * Setup AN scenario
********************************************************/
oes.setupActNetScenario = function () {
  const nodeNames = Object.keys( sim.model.networkNodes);
  for (const nodeName of nodeNames) {
    const nodeRec = sim.model.networkNodes[nodeName];
    const NodeType = sim.Classes[nodeRec.typeName];
    // create scenario node object from model node record
    const node = sim.scenario.networkNodes[nodeName] = new NodeType( nodeRec);
    // for all types of activity nodes, incl. processing (activity) nodes
    if (node instanceof aCTIVITYnODE) {
      // construct the list of dependentNodes for resource dependency tracking
      for (const resRoleName of Object.keys( node.resourceRoles)) {
        // processing stations, as resources, need no dependency tracking
        if (resRoleName.includes("ProcStation")) continue;
        const resRole = node.resourceRoles[resRoleName];
        let altResTypes=[];
        if (resRole.range) {  // the resource role is associated with an individual pool
          const rn = resRole.range.name;
          // the pool name is the lower-cased pluralized range name
          const pn = rn.charAt(0).toLowerCase() + rn.slice(1) + "s";
          altResTypes = sim.scenario.resourcePools[pn].resourceType.alternativeResourceTypes || [];
          resRole.range.resourcePool.dependentNodes.push( node);
        } else {
          resRole.resourcePool.dependentNodes.push( node);
        }
        // subscribe node to resource pools
        for (const arT of altResTypes) {
          arT.resourcePool.dependentNodes.push( node);
        }
      }
    }
  }
  // second pass for setting the successorNode property if no branching
  for (const nodeName of nodeNames) {
    const node = sim.scenario.networkNodes[nodeName];
    // only set the successorNode property if no branching
    if (!node.successorNodeName || typeof node.successorNodeName === "function") continue;
    // assign successor node
    node.successorNode = sim.scenario.networkNodes[node.successorNodeName];
    // set predecessor node for being able to handle blocking due to full input buffers
    if (sim.model.isPN) node.successorNode.predecessorNode = node;
  }
};
/*******************************************************
 * Initialize AN scenario
 ********************************************************/
oes.initializeActNetScenario = function () {
  const nodeNames = Object.keys( sim.model.networkNodes);
  for (const nodeName of nodeNames) {
    const nodeRec = sim.model.networkNodes[nodeName];
    const NodeType = sim.Classes[nodeRec.typeName];
    const scenNode = sim.scenario.networkNodes[nodeName];
    if (scenNode instanceof NodeType) {  // node object has already been created
      // reset/initialize the node
      if (scenNode instanceof aCTIVITYnODE) {
        scenNode.tasks.length = 0;  // clear the task queue
      } else if (scenNode instanceof eVENTnODE) {
        scenNode.nmrOfEvents = 0;
      } else if (scenNode instanceof pROCESSINGnODE) {
        scenNode.tasks.length = 0;  // clear the task queue
        scenNode.inputBuffer.length = 0;  // clear the input buffer
        scenNode.workInProgress.clear();  // clear the WiP buffer
        scenNode.nmrOfArrivedObjects = 0;
        scenNode.nmrOfDepartedObjects = 0;
        if (Number.isInteger( scenNode.processingCapacity)) {
          const scenNodeResPool = scenNode.resourceRoles[scenNode.name +"-ProcStation"].resourcePool;
          scenNodeResPool.available = scenNodeResPool.size;
        }
      } else if (scenNode instanceof eNTRYnODE) {
        scenNode.nmrOfArrivedObjects = 0;
      } else if (scenNode instanceof eXITnODE) {
        scenNode.nmrOfDepartedObjects = 0;
      }
    }
  }
};
/*******************************************************
 * Schedule initial events in ANs/PNs
 ********************************************************/
oes.scheduleInitialNetworkEvents = function () {
  const nodeNames = Object.keys( sim.scenario.networkNodes);
  for (const nodeName of nodeNames) {
    const node = sim.scenario.networkNodes[nodeName];
    if (sim.model.isPN) {
      if (node instanceof aRRIVALeVENTnODE) {  // includes the case of entry nodes
        // create auxiliary null event with occurrence time 0
        const nullEvt = new aRRIVAL({occTime: 0, node});
        //...for being able to invoke the recurrence function
        sim.FEL.add(new aRRIVAL({delay: nullEvt.recurrence(), node}));
      }
    } else if (node instanceof eVENTnODE) {
      const ET = sim.Classes[node.eventTypeName];
      if (node.eventRate) {
        sim.FEL.add( new ET({delay: rand.exponential( node.eventRate), node}));
      } else if (typeof node.eventRecurrence === "function") {
        sim.FEL.add( new ET({delay: node.eventRecurrence(), node}));
      } else if (ET.recurrence || ET.eventRate) {
        sim.FEL.add( new ET({node}));
      }
      //TODO: also support initial/recurrent activities
    }
  }
}
/*******************************************************
 * Set up the generic AN ex-post statistics
 ********************************************************/
oes.setupActNetStatistics = function () {
  // per network node
  sim.stat.networkNodes = Object.create(null);  // an empty map
  for (const nodeName of Object.keys( sim.model.networkNodes)) {
    const node = sim.model.networkNodes[nodeName];
    // AN activity node or PN processing (activity) node
    if (node.activityTypeName || ["activitynode","processingactivitynode","processingnode"].includes(
        node.typeName.toLowerCase())) {
      const nodeStat = sim.stat.networkNodes[nodeName] = Object.create(null)
      // generic queue length statistics
      nodeStat.queueLength = Object.create(null);
      // waiting time statistics
      nodeStat.waitingTime = Object.create(null);
      // cycle time statistics
      nodeStat.cycleTime = Object.create(null);
      // resource utilization statistics
      nodeStat.resUtil = Object.create(null);
    }
  }
  // set flag used when rendering the statistics table
  sim.stat.includeTimeouts = Object.keys( sim.model.networkNodes).
      map( nodeName => sim.model.networkNodes[nodeName]).
      some( node => typeof node.waitingTimeout === "function");
};
/*******************************************************
 * Initialize the generic ex-post AN statistics
 ********************************************************/
oes.initializeActNetStatistics = function () {
  // per network node
  for (const nodeName of Object.keys( sim.scenario.networkNodes)) {
    const node = sim.scenario.networkNodes[nodeName];
    // only for activity nodes, which include processing (activity) nodes
    if (node instanceof aCTIVITYnODE) {
      const nodeStat = sim.stat.networkNodes[nodeName],
            resUtilPerNode = nodeStat.resUtil,
            resRoles = node.resourceRoles || sim.Classes[node.activityTypeName].resourceRoles;
      // initialize throughput statistics
      nodeStat.enqueuedActivities = 0;
      if (typeof node.waitingTimeout === "function") nodeStat.waitingTimeouts = 0;
      nodeStat.startedActivities = 0;
      nodeStat.completedActivities = 0;
      // generic queue length statistics
      //nodeStat.queueLength.avg = 0.0;
      nodeStat.queueLength.max = 0;
      // waiting time statistics
      //nodeStat.waitingTime.avg = 0.0;
      nodeStat.waitingTime.max = 0;
      // cycle time statistics
      //nodeStat.cycleTime.avg = 0.0;
      nodeStat.cycleTime.max = 0;
      // initialize resource utilization per resource object or per count pool
      for (const resRoleName of Object.keys( resRoles)) {
        const resRole = resRoles[resRoleName];
        if (resRole.range) {  // per resource object
          const resPool = resRole.resourcePool || resRole.range.resourcePool;
          for (const resObj of resPool.availResources) {
            resUtilPerNode[String(resObj.id)] = 0;
          }
        } else {  // per count pool
          resUtilPerNode[resRole.countPoolName] = 0;
        }
      }
    }
  }
};
/*******************************************************
 * Compute the final AN statistics
 ********************************************************/
oes.computeFinalActNetStatistics = function () {
  // finalize resource utilization statistics
  for (const nodeName of Object.keys( sim.stat.networkNodes)) {
    const node = sim.stat.networkNodes[nodeName];
    if ("resUtil" in node) {
      const resUtilPerNode = node.resUtil;
      for (const key of Object.keys( resUtilPerNode)) {
        var utiliz = resUtilPerNode[key];
        // key is either an objIdStr or a count pool name
        utiliz /= sim.time;
        // if key is a count pool name
        if (sim.scenario.resourcePools[key]) {
          utiliz /= sim.scenario.resourcePools[key].size;
        }
        resUtilPerNode[key] = math.round( utiliz, oes.defaults.expostStatDecimalPlaces);
      }
    }
  }
};

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


/* Changes from OESjs
- sim.objects is a JS Map
- sim.scenario.resourcePools
- etc.
 */

/*
TODO:
- compute generic queue length statistics per activity type
- compute generic cycle time statistics per activity type
- group all activity-induced extensions in "initializeSimulator" and other procedures
 */

/*******************************************************************
 * Initialize Simulator ********************************************
 *******************************************************************/
sim.initializeSimulator = function () {
  if (sim.model.nextMomentDeltaT) sim.nextMomentDeltaT = sim.model.nextMomentDeltaT;
  else {  // assign defaults
    if (sim.model.time === "discrete") sim.nextMomentDeltaT = 1;
    else sim.nextMomentDeltaT = oes.defaults.nextMomentDeltaT;
  }
  // Set timeIncrement for fixed-increment time progression
  if (sim.model.timeIncrement) {
    sim.timeIncrement = sim.model.timeIncrement;
  } else {
    if (sim.model.OnEachTimeStep) sim.timeIncrement = 1;  // default
  }
  // make sure these lists are defined (using ES 2020 syntax)
  sim.model.objectTypes ??= [];
  sim.model.eventTypes ??= [];
  // initialize the Map of all objects (accessible by ID)
  sim.objects = new Map();
  // initialize the Future Events List
  sim.FEL = new EventList();
  // initialize the map of statistics variables
  sim.stat = Object.create(null);
  // initialize the className->Class map
  sim.Classes = Object.create(null);
  // Make object classes accessible via their object type name
  for (const objTypeName of sim.model.objectTypes) {
    sim.Classes[objTypeName] = util.getClass( objTypeName);
  }
  // Make event classes accessible via their event type name
  for (const evtTypeName of sim.model.eventTypes) {
    sim.Classes[evtTypeName] = util.getClass( evtTypeName);
  }
  // Assign scenarioNo = 0 to default scenario
  sim.scenario.scenarioNo ??= 0;
  sim.scenario.title ??= "Default scenario";
  /***********************************************************
  * Activity extensions **************************************
  ************************************************************/
  // make sure these collections are defined
  sim.model.activityTypes ??= [];
  sim.model.networkNodes ??= Object.create(null);
  sim.scenario.networkNodes ??= Object.create(null);
  if (sim.model.activityTypes.length > 0 || Object.keys( sim.model.networkNodes).length > 0) {
    // make activity classes accessible via their activity type name
    for (const actTypeName of sim.model.activityTypes) {
      sim.Classes[actTypeName] = util.getClass( actTypeName);
    }
    // create a map for resource pools (assuming there are no explicit process owners)
    sim.scenario.resourcePools = Object.create(null);
    if (Object.keys( sim.model.networkNodes).length === 0) {
      // construct the implicitly defined AN model
      oes.constructImplicitlyDefinedActNet();
      sim.model.isAN = true;
    } else {  // networkNodes have been defined in simulation.js
      const nodeNames = Object.keys( sim.model.networkNodes);
      if ("typeName" in sim.model.networkNodes[nodeNames[0]]) {  // a PN model
        sim.model.isPN = true;
        sim.Classes["pROCESSINGoBJECT"] = pROCESSINGoBJECT;
        sim.Classes["ArrivalEventNode"] = sim.Classes["aRRIVALeVENTnODE"] = aRRIVALeVENTnODE;
        sim.Classes["EntryNode"] = sim.Classes["eNTRYnODE"] = eNTRYnODE;
        sim.Classes["ProcessingActivityNode"] = sim.Classes["pROCESSINGaCTIVITYnODE"] = pROCESSINGaCTIVITYnODE;
        sim.Classes["ProcessingNode"] = sim.Classes["pROCESSINGnODE"] = pROCESSINGnODE;
        sim.Classes["DepartureEventNode"] = sim.Classes["dEPARTUREeVENTnODE"] = dEPARTUREeVENTnODE;
        sim.Classes["ExitNode"] = sim.Classes["eXITnODE"] = eXITnODE;
      } else {  // AN
        sim.model.isAN = true;
      }
    }
    if (sim.model.isAN) {
      sim.Classes["EventNode"] = sim.Classes["eVENTnODE"] = eVENTnODE;
      sim.Classes["ActivityNode"] = sim.Classes["aCTIVITYnODE"] = aCTIVITYnODE;
    }
    oes.createResourcePools();
    oes.setupActNetStatistics();
    if (sim.model.isPN) oes.setupProcNetStatistics();
  }
  /***********************************************************
   *** Agent extensions **************************************
   ***********************************************************/
  if (Array.isArray( sim.model.agentTypes)) {
    // initialize the Map of all agents (accessible by ID)
    sim.agents = new Map();
    // Make agent classes accessible via their agent type name
    for (const agtTypeName of sim.model.agentTypes) {
      sim.Classes[agtTypeName] = util.getClass( agtTypeName);
    }
    sim.model.agentBased = true;
  }
}
/*******************************************************************
 * Initialize a (standalone or experiment) scenario simulation run *
 *******************************************************************/
sim.initializeScenarioRun = function ({seed, expParSlots}={}) {
  // clear initial state data structures
  sim.objects.clear();
  sim.FEL.clear();
  sim.ongoingActivities = Object.create( null);  // a map of all ongoing activities accessible by ID
  sim.step = 0;  // simulation loop step counter
  sim.time = 0;  // 1 time
  // Set default values for end time parameters
  sim.scenario.durationInSimTime ??= Infinity;
  sim.scenario.durationInSimSteps ??= Infinity;
  sim.scenario.durationInCpuTime ??= Infinity;
  // get ID counter from simulation scenario, or set to default value
  sim.idCounter = sim.scenario.idCounter ?? 1000;
  // set up a random number generator (RNG) method
  if (!sim.experimentType && sim.scenario.randomSeed) {
    // use David Bau's seedrandom RNG
    rand.gen = new Math.seedrandom( sim.scenario.randomSeed);
  } else if (seed) {  // experiment-defined replication-specific seed
    // use David Bau's seedrandom RNG
    rand.gen = new Math.seedrandom( seed);
  } else {  // use the JS built-in RNG
    rand.gen = Math.random;
  }
  // Assign model parameters with experiment parameter values
  if (expParSlots) sim.assignModelParameters( expParSlots);
  // reset model-specific statistics
  if (sim.model.setupStatistics) sim.model.setupStatistics();
  // (re)set the timeSeries statistics variable
  if ("showTimeSeries" in sim.model &&
      Object.keys( sim.model.showTimeSeries).length > 0) {
    sim.stat.timeSeries = Object.create( null);
    for (const tmSerLbl of Object.keys( sim.model.showTimeSeries)) {
      sim.stat.timeSeries[tmSerLbl] = [];
      if (!sim.timeIncrement) {
        sim.stat.timeSeries[tmSerLbl][0] = [];
        sim.stat.timeSeries[tmSerLbl][1] = [];
      }
    }
  }

  /***START Agent extensions BEFORE-setupInitialState ********************/
  if (sim.model.agentBased) sim.agents.clear();
  /*** END Agent extensions BEFORE-setupInitialState *********************/
  /***START AN/PN extensions BEFORE-setupInitialState ********************/
  if (sim.model.isAN || sim.model.isPN) {
    oes.initializeResourcePools();
    oes.setupActNetScenario();
    if (sim.model.isPN) oes.createProcessingStationResourcePools();
  }
  /*** END AN/PN extensions BEFORE-setupInitialState *********************/

  // set up initial state
  if (sim.scenario.setupInitialState) sim.scenario.setupInitialState();

  // create populations per class
  for (const o of sim.objects.values()) {
    const className = o.constructor.name;
    if (className in sim.Classes) {
      sim.Classes[className].instances ??= Object.create(null);
      sim.Classes[className].instances[o.id] = o;
    }
  }

  /***START AN/PN extensions AFTER-setupInitialState ********************/
  if (sim.model.isAN || sim.model.isPN) {
    //TODO: oes.initializeActNetScenario();
    // complete count pool settings
    for (const poolName of Object.keys( sim.scenario.resourcePools)) {
      const resPool = sim.scenario.resourcePools[poolName];
      if (resPool.available) {  // a count pool
        // the size of a count pool is the number of initially available resources
        if (!resPool.size) resPool.size = resPool.available;
      } else {
        resPool.available = resPool.size;
      }
    }
    // schedule initial events, if no initial event has been scheduled
    if (sim.FEL.isEmpty()) oes.scheduleInitialNetworkEvents();
    oes.initializeActNetStatistics();
    if (sim.model.isPN) {
      oes.initializeProcNetStatistics();
    }
    /***END AN/PN extensions AFTER-setupInitialState *********************/
  } else if (sim.FEL.isEmpty()) {
    // schedule initial (exogenous) events if no initial event has been scheduled
    for (const evtTypeName of sim.model.eventTypes) {
      const ET = sim.Classes[evtTypeName];
      if (ET.recurrence || ET.eventRate) {
        sim.FEL.add( new ET());
      }
    }
  }
};
/*******************************************************************
 * Schedule an event or a list of events ***************************
 *******************************************************************/
sim.schedule = function (e) {
  var events;
  if (!Array.isArray(e)) events = [e];
  else events = e;
  for (const evt of events) {
    sim.FEL.add( evt);
  }
}
/*******************************************************************
 * Assign model parameters with experiment parameter values ********
 *******************************************************************/
sim.assignModelParameters = function (expParSlots) {
  for (const parName of Object.keys( sim.model.p)) {
    sim.model.p[parName] = expParSlots[parName];
  }
}
/*******************************************************
 Advance Simulation Time
 ********************************************************/
sim.advanceSimulationTime = function () {
  sim.nextEvtTime = sim.FEL.getNextOccurrenceTime();  // 0 if there is no next event
  // increment the step counter
  sim.step++;
  // advance simulation time
  if (sim.timeIncrement) {  // fixed-increment time progression
    // fixed-increment time progression simulations may also have events
    if (sim.nextEvtTime > sim.time && sim.nextEvtTime < sim.time + sim.timeIncrement) {
      sim.time = sim.nextEvtTime;  // an event occurring before the next incremented time
    } else {
      sim.time += sim.timeIncrement;
    }
  } else if (sim.nextEvtTime > 0) {  // next-event time progression
    sim.time = sim.nextEvtTime;
  }
}
/*******************************************************
 Run a simulation scenario
 ********************************************************/
sim.runScenario = function (createLog) {
  function sendLogMsg( currEvts) {
    let objStr = [...sim.objects.values()].map( el => el.toString()).join("|");
    if (oes.defaults.showResPoolsInLog) {
      objStr += " // "+ Object.values( sim.scenario.resourcePools).toString();
    }
    postMessage({ step: sim.step, time: sim.time,
      // convert values() iterator to array
      objectsStr: objStr,
      currEvtsStr: currEvts.map( el => el.toString()).join("|"),
      futEvtsStr: sim.FEL.toString()
    });
  }
  const startTime = (new Date()).getTime();
  if (createLog) sendLogMsg([]);  // log initial state
  // Simulation Loop
  while (sim.time < sim.scenario.durationInSimTime &&
      sim.step < sim.scenario.durationInSimSteps &&
      (new Date()).getTime() - startTime < sim.scenario.durationInCpuTime) {
    sim.advanceSimulationTime();
    // extract and process next events
    const nextEvents = sim.FEL.removeNextEvents();
    // sort simultaneous events according to priority order
    if (nextEvents.length > 1) nextEvents.sort( eVENT.rank);
    // process next (="current") events
    for (const e of nextEvents) {
      // apply event rule
      const followUpEvents = typeof e.onEvent === "function" ? e.onEvent() : [];
      // schedule follow-up events
      for (const f of followUpEvents) {
        sim.FEL.add( f);
      }
      const EventClass = e.constructor;

      /**** AN/PN extension START ****/
      // handle AN event nodes with a successor node
      if (EventClass.name !== "aRRIVAL" && e.node?.successorNode) {  //TODO: refactor such that a PN item does not occur in AN code
        const successorNode = e.node.successorNode,
              SuccAT = sim.Classes[successorNode.activityTypeName],
              succActy = new SuccAT({node: successorNode});
        // schedule successor activity
        succActy.startOrEnqueue();
      }
      /**** AN/PN extension END ****/

      // test if e is an exogenous event
      if (EventClass.recurrence || e.recurrence || EventClass.eventRate) {
        if ("createNextEvent" in e) {
          /* is this generic approach for maxNmrOfEvents computationally cheap enough?
          let nextEvt=null;
          const maxNmrOfEvents = e.node?.maxNmrOfEvents || EventClass.maxNmrOfEvents;
          if (maxNmrOfEvents) {
            const nmrOfEvents = e.node?.nmrOfEvents;
            if (nmrOfEvents && nmrOfEvents < maxNmrOfEvents) nextEvt = e.createNextEvent();
          } else {
            nextEvt = e.createNextEvent();
          }
          */
          const nextEvt = e.createNextEvent();
          if (nextEvt) sim.FEL.add( nextEvt);
        } else {
          sim.FEL.add( new EventClass());
        }
      }
    }
    // check if any time series has to be stored/returned
    if ("timeSeries" in sim.stat) {
      /*
      if (!statVar.timeSeriesScalingFactor) v = sim.stat[varName];
      else v = sim.stat[varName] * statVar.timeSeriesScalingFactor;
      */
      for (const tmSerLbl of Object.keys( sim.stat.timeSeries)) {
        const tmSerVarDef = sim.model.showTimeSeries[tmSerLbl];
        let val=0;
        // TODO: how to interpolate for implementing time series compression
        if ("objectId" in tmSerVarDef) {
          const obj = sim.objects.get( tmSerVarDef.objectId);
          val = obj[tmSerVarDef.attribute];
        } else if ("statisticsVariable" in tmSerVarDef) {
          val = sim.stat[tmSerVarDef.statisticsVariable];
        }
        if (sim.timeIncrement) {  // fixed increment time progression
          sim.stat.timeSeries[tmSerLbl].push( val);
        } else {  // next-event time progression
          sim.stat.timeSeries[tmSerLbl][0].push( sim.time);
          sim.stat.timeSeries[tmSerLbl][1].push( val);
        }
        /*
        if (oes.stat.timeSeriesCompressionSteps > 1
            && sim.step % oes.stat.timeSeriesCompressionSteps === 0) {
          oes.stat.compressTimeSeries( sim.stat.timeSeries[varName]);
        }
        */
      }
    }
    if (createLog) sendLogMsg( nextEvents);  // log initial state
    // end simulation if no time increment and no more events
    if (!sim.timeIncrement && sim.FEL.isEmpty()) break;
  }
  // compute generic statistics (incl. resource utilization)
  if (sim.model.isAN || sim.model.isPN) {
    oes.computeFinalActNetStatistics();
    if (sim.model.isPN) oes.computeFinalProcNetStatistics();
  }
  // compute user-defined statistics
  if (sim.model.computeFinalStatistics) sim.model.computeFinalStatistics();
}
/*******************************************************
 Run a Standalone Simulation Scenario (in a JS worker)
 ********************************************************/
sim.runStandaloneScenario = function (createLog) {
  sim.initializeSimulator();
  if (!sim.scenario.randomSeed) sim.initializeScenarioRun();
  else sim.initializeScenarioRun({seed: sim.scenario.randomSeed});
  sim.runScenario( createLog);
  // send statistics to main thread
  self.postMessage({statistics: sim.stat, endSimTime: sim.time,
    loadEndTime: sim.loadEndTime});
}
/*******************************************************
 Run an Experiment (in a JS worker)
 ********************************************************/
sim.runExperiment = async function () {
  var exp = sim.experimentType, expRun = Object.create(null),
      compositeStatVarNames = ["nodes"];
  // set up user-defined statistics variables
  sim.model.setupStatistics();
  // create a list of the names of simple statistics variables
  const simpleStatVarNames = Object.keys( sim.stat).filter(
      varName => !compositeStatVarNames.includes( varName));

  async function runSimpleExperiment() {
    var statVarList=[];
    // initialize replication statistics
    exp.replicStat = Object.create(null);  // empty map
    for (const varName of simpleStatVarNames) {
      exp.replicStat[varName] = [];  // an array per statistics variable
    }
    /***START Activity extensions BEFORE-runSimpleExperiment ********************/
    exp.replicStat.nodes = Object.create(null);  // empty map
    let throughputStatVarList = ["enqueuedActivities","waitingTimeouts","startedActivities","completedActivities"];
    let throughputStatVarListWithoutTmout = ["enqueuedActivities","startedActivities","completedActivities"];
    for (const nodeName of Object.keys( sim.stat.networkNodes)) {
      const AT = sim.Classes[sim.model.networkNodes[nodeName].activityTypeName];
      exp.replicStat.nodes[nodeName] = {
        enqueuedActivities:[], startedActivities:[], completedActivities:[],
        queueLength:{max:[]}, waitingTime:{max:[]}, cycleTime:{max:[]}
      };
      if (AT && typeof AT.waitingTimeout === "function") {
        exp.replicStat.nodes[nodeName].waitingTimeouts = [];
      }
      //exp.replicStat.nodes[nodeName].resUtil = Object.create(null);
    }
    /***END Activity extensions BEFORE-runSimpleExperiment ********************/
    // run experiment scenario replications
    for (let k=0; k < exp.nmrOfReplications; k++) {
      if (exp.seeds) sim.initializeScenarioRun({seed: exp.seeds[k]});
      else sim.initializeScenarioRun();
      sim.runScenario();
      // store replication statistics
      for (const key of Object.keys( exp.replicStat)) {
        if (key !== "nodes") exp.replicStat[key][k] = sim.stat[key];
      }
      /***START Activity extensions AFTER-runSimpleExperimentScenario ********************/
      for (const nodeName of Object.keys( exp.replicStat.nodes)) {
        const replStatPerNode = exp.replicStat.nodes[nodeName],
              statPerNode = sim.stat.networkNodes[nodeName];
        const AT = sim.Classes[sim.model.networkNodes[nodeName].activityTypeName];
        replStatPerNode.enqueuedActivities[k] = statPerNode.enqueuedActivities;
        if (AT && typeof AT.waitingTimeout === "function") {
          replStatPerNode.waitingTimeouts[k] = statPerNode.waitingTimeouts;
        }
        replStatPerNode.startedActivities[k] = statPerNode.startedActivities;
        replStatPerNode.completedActivities[k] = statPerNode.completedActivities;
        replStatPerNode.queueLength.max[k] = statPerNode.queueLength.max;
        replStatPerNode.waitingTime.max[k] = statPerNode.waitingTime.max;
        replStatPerNode.cycleTime.max[k] = statPerNode.cycleTime.max;
        //actStat.resUtil = Object.create(null);
      }
      /***END Activity extensions AFTER-runSimpleExperimentScenario ********************/
      if (exp.storeExpResults) {
        try {
          await sim.db.add( "experiment_scenario_runs", {
            id: expRun.id + k + 1,
            experimentRun: expRun.id,
            outputStatistics: {...sim.stat}  // clone
          });
        } catch( err) {
          console.log("DB Error: ", err.message);
        }
      }
    }
    // define exp.summaryStat to be a map for the summary statistics
    exp.summaryStat = Object.create(null);
    // aggregate replication statistics in exp.summaryStat
    for (const key of Object.keys( exp.replicStat)) {
      if (key !== "nodes") {  // key is a user-defined statistics variable name
        exp.summaryStat[key] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;
          exp.summaryStat[key][aggr] = aggrF( exp.replicStat[key]);
        }
      }
    }
    /***START Activity extensions AFTER-runSimpleExperimentScenario ********************/
    exp.summaryStat.nodes = Object.create(null);  // empty map
    for (const nodeName of Object.keys( exp.replicStat.nodes)) {
      const replStatPerNode = exp.replicStat.nodes[nodeName];
      const AT = sim.Classes[sim.model.networkNodes[nodeName].activityTypeName];
      exp.summaryStat.nodes[nodeName] = Object.create(null);  // empty map
      if (typeof AT.waitingTimeout === "function") {
        statVarList = throughputStatVarList
      } else {
        statVarList = throughputStatVarListWithoutTmout
      }
      for (const statVarName of statVarList) {
        exp.summaryStat.nodes[nodeName][statVarName] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;  // an aggregation function
          // compute/store the result of aggregation over the replication value list
          exp.summaryStat.nodes[nodeName][statVarName][aggr] = aggrF( replStatPerNode[statVarName]);
        }
      }
      //Possibly TODO: also support averages
      for (const statVarName of ["queueLength","waitingTime","cycleTime"]) {
        exp.summaryStat.nodes[nodeName][statVarName] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;
          // compute/store the result of aggregation over the replication value list
          exp.summaryStat.nodes[nodeName][statVarName][aggr] = aggrF( replStatPerNode[statVarName].max);
        }
      }
      /*****TODO: support also the following statistics *****/
      //actStat.resUtil = Object.create(null);
    }
    /***END Activity extensions AFTER-runSimpleExperimentScenario ********************/
    // send experiment statistics to main thread
    postMessage({simpleExperiment: exp});
  }
  async function runParVarExperiment() {  // parameter variation experiment
    const valueSets = [], expParSlots = Object.create(null),
        N = exp.parameterDefs.length;
    exp.scenarios = [];
    // create a list of value sets, one set for each parameter
    for (let i=0; i < N; i++) {
      const expPar = exp.parameterDefs[i];
      if (!expPar.values) {
        // create value set
        expPar.values = [];
        const increm = expPar.stepSize || 1;
        for (let x = expPar.startValue; x <= expPar.endValue; x += increm) {
          expPar.values.push( x);
        }
      }
      valueSets.push( expPar.values);
    }
    const cp = math.cartesianProduct( valueSets);
    const M = cp.length;  // size of cartesian product
    // set up statistics variables
    sim.model.setupStatistics();
    // loop over all combinations of experiment parameter values
    for (let i=0; i < M; i++) {
      const valueCombination = cp[i];  // an array list of values, one for each parameter
      // initialize the scenario record
      exp.scenarios[i] = {stat: Object.create(null)};
      exp.scenarios[i].parameterValues = valueCombination;
      // initialize experiment scenario statistics
      for (let varName of Object.keys( sim.stat)) {
        exp.scenarios[i].stat[varName] = 0;
      }
      // create experiment parameter slots for assigning corresponding model variables
      for (let j=0; j < N; j++) {
        expParSlots[exp.parameterDefs[j].name] = valueCombination[j];
      }
      if (exp.storeExpResults) {
        try {
          await sim.db.add("experiment_scenarios", {
            id: expRun.id + i + 1,
            experimentRun: expRun.id,
            experimentScenarioNo: i,
            parameterValueCombination: [...exp.scenarios[i].parameterValues],  // clone
          });
        } catch( err) {
          console.log('error', err.message);
        }
      }
      // run experiment scenario replications
      for (let k=0; k < exp.nmrOfReplications; k++) {
        if (exp.seeds && exp.seeds.length > 0) {
          sim.initializeScenarioRun({seed: exp.seeds[k], expParSlots: expParSlots});
        } else {
          sim.initializeScenarioRun({expParSlots: expParSlots});
        }
        sim.runScenario();
        // add up replication statistics from sim.stat to sim.experimentType.scenarios[i].stat
        Object.keys( sim.stat).forEach( function (varName) {
          exp.scenarios[i].stat[varName] += sim.stat[varName];
        });
        if (exp.storeExpResults) {
          try {
            await sim.db.add("experiment_scenario_runs", {
              id: expRun.id + M + i * exp.nmrOfReplications + k + 1,
              experimentRun: expRun.id,
              experimentScenarioNo: i,
              outputStatistics: {...sim.stat}  // clone
            });
          } catch( err) {
            console.log('error', err.message);
          }
        }
      }
      // compute averages
      Object.keys( sim.stat).forEach( function (varName) {
        exp.scenarios[i].stat[varName] /= exp.nmrOfReplications;
      });
      // send statistics to main thread
      self.postMessage({
        expScenNo: i,
        expScenParamValues: exp.scenarios[i].parameterValues,
        expScenStat: exp.scenarios[i].stat
      });
    }
  }

  if (exp.seeds && exp.seeds.length < exp.nmrOfReplications) {
    console.error(`Not enough seeds defined for ${exp.nmrOfReplications} replications`);
    return;
  }
  sim.initializeSimulator();
  // setup DB connection on demand if browser supports IndexedDB
  if (exp.storeExpResults) {
    // check if browser supports IndexedDB
    if (!('indexedDB' in self)) {
      console.warn("This browser doesn't support IndexedDB. Experiment results will not be stored!");
      exp.storeExpResults = false;
    } else {
      sim.db = await idb.openDB( sim.model.name, 1, {
        upgrade(db) {
          const os1 = db.createObjectStore( "experiment_runs", {keyPath: "id", autoIncrement: true});
          //os1.createIndex('date', 'date');
          db.createObjectStore( "experiment_scenarios", {keyPath: "id", autoIncrement: true});
          db.createObjectStore( "experiment_scenario_runs", {keyPath: "id", autoIncrement: true});
        }
      });
    }
  }
  if (exp.storeExpResults) {
    expRun = {
      id: eXPERIMENTrUN.getAutoId(),
      experimentType: exp.id,
      baseScenarioNo: sim.scenario.scenarioNo,
      dateTime: (new Date()).toISOString(),
    };
    try {
      await sim.db.add("experiment_runs", expRun);
    } catch( err) {
      console.log("IndexedDB error: ", err.message);
    }
  }
  if (exp.parameterDefs?.length) runParVarExperiment();
  else runSimpleExperiment();
}

