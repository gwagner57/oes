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
      let allocatedRes = [...this.availResources];  // clone array
      for (const res of this.availResources) {
        res.status = rESOURCEsTATUS.BUSY;
        this.busyResources.push( res);
      }
      this.availResources.length = 0;
      return allocatedRes;
    } else this.available = 0;  // count pool
  }
  allocateById( id) {
    const index = this.availResources.findIndex( res => res.id === id);
    if (index >= 0) {
      const allocatedRes = this.availResources[index];
      allocatedRes.status = rESOURCEsTATUS.BUSY;
      this.busyResources.push( allocatedRes);
      // discard from availResources
      this.availResources.splice( index, 1);
      return allocatedRes;
    } else {
      return null;
    }
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
  // acty is the activity that has been currently executed at the node
  getSuccessorNodes( acty) {
    let succNodes = [];
    if (this.successorNodeName || this.successorNodeExpr || this.successorNodeNames) {
      if (typeof this.successorNodeName === "string") {
        succNodes.push( sim.scenario.networkNodes[this.successorNodeName]);
      } else if (typeof this.successorNodeExpr === "function") {
        const succActyTypeName = this.successorNodeExpr( acty);
        const successorNodeName = oes.getNodeNameFromActTypeName(succActyTypeName);
        succNodes.push( sim.scenario.networkNodes[successorNodeName]);
      } else if (typeof this.successorNodeNames === "object") {
        // a map from names to conditions for (X)OR/AND splitting
        for (const nodeName of Object.keys(this.successorNodeNames)) {
          if (this.successorNodeNames[nodeName](acty)) {
            if (sim.scenario.networkNodes[nodeName]) {
              succNodes.push( sim.scenario.networkNodes[nodeName]);
            }
          }
        }
      }
    }
    return succNodes;
  }
  toString() {
    return "";  // overwrite the default serialization
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
 * the node's resource roles (including the performer) and duration are provided by the
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
    var str="";
    if (sim.Classes[this.activityTypeName].labels?.showNodeObjects) {
      str = this.name + `{ tasks:${this.tasks.length}}`;
    }
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
  releaseResources() {
    const node = this.node,
          resourceRoles = node?.resourceRoles ?? this.constructor.resourceRoles,
          resRoleNames = Object.keys( resourceRoles);
    for (const resRoleName of resRoleNames) {
      const resRole = resourceRoles[resRoleName];
      if (this.namesOfTransferredResRoles?.includes( resRoleName) || resRole.deferredRelease) continue;
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
  // mode=1 represents the preemption mode PreemptionModeEL.ABORT
  static preempt( acty, succActyOrSuccActyType, mode=1) {
    var succActy=null, SuccActyType=null;
    const namesOfTransferredResources=[];  // just for logging
    if (!Object.keys( sim.ongoingActivities).includes( String(acty.id)))
      throw `Attempt to preempt an activity (of type ${acty.constructor.name}) that is not ongoing at ${sim.time.toFixed(2)}`;
    if (succActyOrSuccActyType instanceof aCTIVITY) {
      succActy = succActyOrSuccActyType;
    } else {
      SuccActyType = succActyOrSuccActyType;
      succActy = new SuccActyType();
    }
    const actyResRoles = Object.keys( acty.constructor.resourceRoles),
          succActyResRoles = Object.keys( succActy.constructor.resourceRoles);
    acty.namesOfTransferredResRoles = [];
    for (const resRole of succActyResRoles) {
      if (succActy[resRole]) continue;  // has already been allocated
      if (actyResRoles.includes( resRole)) {
        // transfer resource
        succActy[resRole] = acty[resRole];
        acty.namesOfTransferredResRoles.push( resRole);
        namesOfTransferredResources.push( acty[resRole].name);
      } else {
        console.error(`Attempt to preempt an activity (of type ${acty.constructor.name}) that does not 
provide all required resources for its successor activity (of type ${succActy.constructor.name}) at ${sim.time.toFixed(2)}`);
      }
    }
    console.log(`Preemption: ${acty.constructor.name} at ${sim.time.toFixed(2)} with transferred resources ${namesOfTransferredResources}`);
    acty.preempted = true;
    // change the scheduled activity end event to occur immediately
    sim.FEL.getActivityEndEvent(acty).occTime = sim.time + sim.nextMomentDeltaT;
    // return the preemption successor activity
    return new aCTIVITYsTART({plannedActivity: succActy});
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
    const decPl = oes.defaults.simLogDecimalPlaces,
        acty = this.plannedActivity,
        AT = acty.constructor,  // the activity's type/class
        labels = AT.labels,
        evtTypeName = (labels?.className || AT.name) + "End";
    var evtStr = "", slotListStr = "";
    for (const resRoleName of Object.keys( acty.node.resourceRoles)) {
      if (acty.node.resourceRoles[resRoleName].range) {  // individual resource
        const resObj = acty[resRoleName];
        let resObjStr = "";
        if (Array.isArray( resObj)) {
          resObjStr = resObj.map( o => o.name || String(o.id)).toString();
        } else {
          resObjStr = resObj.name || String(resObj.id);
        }
        slotListStr += resObjStr +", ";
      }
    }
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
      const waitingTime = acty.enqueueTime ? acty.startTime - acty.enqueueTime : 0;
      const cycleTime = waitingTime + acty.occTime - acty.startTime;
      if (acty.preempted) {
        nodeStat.preemptedActivities++;
      } else {
        nodeStat.completedActivities++;
        waitingTimeStat.total += waitingTime;
        if (waitingTimeStat.max < waitingTime) waitingTimeStat.max = waitingTime;
        cycleTimeStat.total += cycleTime;
        if (cycleTimeStat.max < cycleTime) cycleTimeStat.max = cycleTime;
      }
      // compute resource utilization per node (per resource object or per count pool)
      for (const resRoleName of resRoleNames) {
        const resRole = resourceRoles[resRoleName];
        if (resRole.range) {  // per resource object
          let resObjects = acty[resRoleName];
          if (!Array.isArray( resObjects)) resObjects = [resObjects];
          for (const resObj of resObjects) {
            resUtilPerNode[String(resObj.id)] += acty.duration;
            // update the activity state of resource objects
            if (!resObj.activityState) {
              console.error("Missing activity state at "+ sim.time +": "+ resObj.name +":"+ acty.constructor.name);
            } else resObj.activityState.delete( AT.name);
          }
        } else {  // per count pool
          resUtilPerNode[resRole.countPoolName] += acty.duration;
        }
      }
    }
    if (node.constructor === aCTIVITYnODE) {  // isDirectInstanceOf
      // [execute this code only for AN activity nodes, and not for PN nodes]
      if (!acty.preempted) {
        const succNodes = node.getSuccessorNodes( this.activity);
        // schedule successor activities according to network structure
        for (const succNode of succNodes) {
          //TODO: make this work for multiple successor nodes
          const SuccAT = sim.Classes[succNode.activityTypeName],
              succActy = new SuccAT({node: succNode}),
              succResRoles = succNode.resourceRoles ?? SuccAT.resourceRoles,
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
          // assign attribute for passing the list of transferred resource roles
          acty.namesOfTransferredResRoles = succActy.resRoleNamesSharedWithPredActivity;
          // start or enqueue a successor activity according to the AN model
          // are all successor activity resources already allocated (since included in activity resources)?
          if (succResRoleNames.every( rn => resRoleNames.includes( rn))) {
            // start successor activity with transferred resources
            followupEvents.push( new aCTIVITYsTART({plannedActivity: succActy}));
          } else {  // start/enqueue successor activity
            succActy.startOrEnqueue();
          }
        }
      }
      // release all non-transferred resources of acty
      acty.releaseResources();
      // if there are still planned activities in the task queue
      if (node.tasks.length > 0) {
        // if available, allocate required resources and start next activity
        node.ifAvailAllocReqResAndStartNextActivity();
      }
    }
    return followupEvents;
  }
  toString() {
    const decPl = oes.defaults.simLogDecimalPlaces,
          acty = this.activity,
          AT = acty.constructor,  // the activity's type/class
          labels = AT.labels,
          evtTypeName = (labels?.className || AT.name) + "End";
    var evtStr = "", slotListStr = "";
    for (const resRoleName of Object.keys( acty.node.resourceRoles)) {
      if (acty.node.resourceRoles[resRoleName].range) {  // individual resource
        const resObj = acty[resRoleName];
        let resObjStr = "";
        if (Array.isArray( resObj)) {
          resObjStr = resObj.map( o => o.name || String(o.id)).toString();
        } else {
          resObjStr = resObj.name || String(resObj.id);
        }
        slotListStr += resObjStr +", ";
      }
    }
    if (slotListStr) evtStr = `${evtTypeName}{ ${slotListStr}}`;
    else evtStr = evtTypeName;
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
    // the AN node name is the lower-cased type name suffixed by "Node"
    const nodeName = oes.getNodeNameFromEvtTypeName( evtTypeName);
    const node = sim.model.networkNodes[nodeName] =
        {name: nodeName, typeName:"eVENTnODE", eventTypeName: evtTypeName};
    if (ET.successorNode) {  // providing the name of a successor activity type
      if (typeof ET.successorNode === "string") {
        node.successorNodeName = oes.getNodeNameFromActTypeName( ET.successorNode);
      } else if (typeof ET.successorNode === "function") {
        node.successorNodeExpr = ET.successorNode;
      }
    }
  }
  // construct the activity nodes of the implicitly defined AN model
  for (const actTypeName of sim.model.activityTypes) {
    const AT = sim.Classes[actTypeName];
    AT.resourceRoles ??= Object.create(null);  // make sure AT.resourceRoles is defined
    // the AN node name is the lower-cased type name suffixed by "Node"
    const nodeName = oes.getNodeNameFromActTypeName( actTypeName);
    const node = sim.model.networkNodes[nodeName] =
        {name: nodeName, typeName:"aCTIVITYnODE", activityTypeName: actTypeName};
    if (AT.waitingTimeout) node.waitingTimeout = AT.waitingTimeout;
    if (AT.successorNode) {  // providing the name of a successor activity type
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
      nodeStat.preemptedActivities = 0;
      // generic queue length statistics
      //nodeStat.queueLength.avg = 0.0;
      nodeStat.queueLength.max = 0;
      // waiting time statistics
      nodeStat.waitingTime.total = 0.0;
      nodeStat.waitingTime.avg = 0.0;
      nodeStat.waitingTime.max = 0;
      // cycle time statistics
      nodeStat.cycleTime.total = 0.0;
      nodeStat.cycleTime.avg = 0.0;
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
  for (const nodeName of Object.keys( sim.stat.networkNodes)) {
    const nodeStat = sim.stat.networkNodes[nodeName];
    // avoid dividing by 0 with x||1 expression
    nodeStat.waitingTime.avg = nodeStat.waitingTime.total / (nodeStat.completedActivities||1);
    nodeStat.cycleTime.avg = nodeStat.cycleTime.total / (nodeStat.completedActivities||1);
    if ("resUtil" in nodeStat) {  // finalize resource utilization statistics
      const resUtilPerNode = nodeStat.resUtil;
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
