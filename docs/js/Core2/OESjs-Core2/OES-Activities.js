/******************************************************************************
 *** Activities Package *******************************************************
 ******************************************************************************/
/**
 *  Activities are composite events that have some duration and typically depend on
 *  resources. They are composed of an activity start and an activity end event.
 *  Their duration may be either pre-set to a fixed value or to a random value (implying
 *  that they have a scheduled end event), or it may be determined by the occurrence
 *  of an activity end event that is caused by another simulation event (in which case
 *  they have an "open end"). The duration of a pre-set duration activity can be defined
 *  in 3 ways: either for all activities of some type AT by a) a class-level attribute
 *  AT.duration or b) a class-level function AT.duration(), or c) by setting the attribute
 *  "duration" of its aCTIVITYsTART event.
 *
 *  Activities often depend on resources. The actor(s) that (jointly) perform(s) an
 *  activity, called performer(s), can be viewed as (a) special resource(s). Since a
 *  resource-constrained activity can only be started when all required resources are
 *  available, it may first have to be enqueued as a *planned* activity*.
 *
 *  As events, activities may also be associated with participating objects, which are
 *  not resources.
 *
 *  For any resource of an activity, its utilization by that activity during a certain
 *  time period is measured by the simulator and can be included in the ex-post statistics.
 *
 *  An activity type is defined as a subtype of the OES class "aCTIVITY" with an
 *  optional class-level "duration" attribute (or function).
 *
 *  At any simulation step there is a (possibly empty) set of *ongoing* activities.
 *  The objects that participate in an ongoing activity as resources are in a
 *  certain activity state (e.g., "service-performing").
 *
 *  A pre-defined event type aCTIVITYsTART is used for creating activity start
 *  events with a constructor parameter "plannedActivity" (of type AT), dequeued from
 *  AT.plannedActivities. It is an option to assign a duration at activity start time
 *  by providing a duration argument to the activity start event constructor.
 *  The value of the activityState property of all involved
 *  resource objects is updated by adding the activity type name (the activityState
 *  is a set of the type names of those activities, in which the object is
 *  currently participating).
 *
 *  TODO: introduce
 *   - cycle time statistics per activity type
 *   - individual resource pools based on pre-defined object type rESOURCE( status / isAvailable, allocate, release)
 *     specializing oBJECT, such that a resource type is defined by specializing rESOURCE
 *   - an optional processOwner (= institutional agent); if there is only one (= no collaboration), it may be left implicit
 */
// An abstract class
class aCTIVITY extends eVENT {
  // startTime=0 tells the eVENT constructor that this is an aCTIVITY
  constructor({id, occTime, startTime=0, duration}) {
    super({occTime, startTime, duration});
    if (id) this.id = id;
    else this.id = sim.idCounter++;  // activities need an ID
  }
  static ifAvailAllocReqResAndStartNextActivity( AT) {
    const nextActy = AT.plannedActivities[0];
    // Are all required resources available?
    if (Object.keys( AT.resourceRoles)
        .map( resRoleName => AT.resourceRoles[resRoleName])
        .every( resRole => (resRole.resPool.isAvailable( resRole.card)))) {
      // remove next activity from queue
      AT.plannedActivities.dequeue();
      // Allocate all required resources
      for (const resRoleName of Object.keys( AT.resourceRoles)) {
        const resRole = AT.resourceRoles[resRoleName];
        // allocate the required quantity of resources from the pool
        const allocatedRes = resRole.resPool.allocate( resRole.card);
        if (allocatedRes) {
          // create an activity property slot for this resource role
          if (allocatedRes.length === 1) {
            nextActy[resRoleName] = allocatedRes[0];
          } else {
            nextActy[resRoleName] = allocatedRes;
          }
        }
      }
      // start next activity with the allocated resources
      sim.FEL.add( new aCTIVITYsTART({plannedActivity: nextActy}));
    }
  }
}
// Define a datatype class for queues of planned activities
class pLANNEDaCTIVITIESqUEUE extends Array {
  constructor() {
    super();
  }
  enqueue( acty) {
    const AT = acty.constructor;
    if (this !== AT.plannedActivities) {
      console.error("Attempt to push an "+ AT.name +" to wrong queue!");
      return;
    }
    this.push( acty);
    sim.stat.actTypes[AT.name].enqueuedPlanActivities += 1;
    // compute generic queue length statistics per activity type
    if (this.length > sim.stat.actTypes[AT.name].queueLength.max) {
      sim.stat.actTypes[AT.name].queueLength.max = this.length;
    }
    //TODO: compute average queue length statistics
    // if available, allocate required resources and start next activity
    aCTIVITY.ifAvailAllocReqResAndStartNextActivity( AT);
  }
  dequeue() {
    const acty = this.shift(),
          AT = acty.constructor;
    sim.stat.actTypes[AT.name].dequeuedPlanActivities += 1;
    return acty;
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
oes.ResourceStatusEL = new eNUMERATION("ResourceStatusEL",
    ["available","busy","out of order"]);
/****************************************************************************
 A resource pool can take one of two forms:
 (1) a count pool abstracts away from individual resources and just maintains
     an "available" counter of the available resources of some type
 (2) an individual pool is a queue of individual resource objects; if a resource
     role of an activity type does not specify an individualPoolName, this name
     is formed from the role's range name (lower-cased and plural "s")
 ****************************************************************************/
class rESOURCEpOOL {
  constructor( {name, available, resources}) {
    this.name = name;
    if (available) this.available = available;
    if (resources) {
      //this.resources = resources;
      this.busyResources = [];
      this.availResources = [];
      for (let res of resources) {
        if (res.status === oes.ResourceStatusEL.AVAILABLE) this.availResources.push( res);
        else if (res.status === oes.ResourceStatusEL.BUSY) this.busyResources.push( res);
      }
    }
  }
  isAvailable( card) {
    if (card === undefined) card = 1;
    if (this.available === undefined) {  // individual pool
      return this.availResources.length >= card;
    } else return this.available >= card;
  }
  allocate( card) {
    if (card === undefined) card = 1;
    if (this.availResources) {  // individual pool
      if (this.availResources.length >= card) {
        // remove the first card resources from availResources
        let allocatedRes = this.availResources.splice( 0, card);
        for (const res of allocatedRes) {
          res.status = oes.ResourceStatusEL.BUSY;
          this.busyResources.push( res);
        }
        return allocatedRes;
      } else {
        console.error(`The pool ${this.name} does not have enough resources at simulation step ${sim.step}!`);
      }
    } else this.available -= card;
  }
  release( nmrOrRes) {  // number or resource(s)
    if (nmrOrRes === undefined) nmrOrRes = 1;
    if (typeof nmrOrRes === "number" && Number.isInteger( this.available)) {
      this.available += nmrOrRes;
    } else if (typeof nmrOrRes === "object" && Array.isArray( this.availResources)) {
      let resources = nmrOrRes;
      if (!Array.isArray( resources)) resources = [resources];
      for (const res of resources) {
        const i = this.busyResources.indexOf( res);
        if (i === -1) {
          console.error(`The pool ${this.name} does not contain resource ${res.toString()} 
at simulation step ${sim.step}!`);
        } else {
          // remove resource from busyResources list
          this.busyResources.splice( i, 1);
          // add resource to availResources list
          res.status = oes.ResourceStatusEL.AVAILABLE;
          this.availResources.push( res);
        }
      }
    } else {
      console.error(`Release attempt for pool ${this.name} with "nmrOrRes" = ${nmrOrRes} failed 
at simulation step ${sim.step}!`);
    }
  }
  clear() {
    this.busyResources.length = 0;
    this.availResources.length = 0;
  }
}

class aCTIVITYsTART extends eVENT {
  constructor({occTime, delay, plannedActivity}) {
    super({occTime, delay});
    this.plannedActivity = plannedActivity;
  }
  toString() {
    var decPl = oes.defaults.simLogDecimalPlaces,
        acty = this.plannedActivity, AT = acty.constructor,
        eventTypeName = (AT.shortLabel || AT.name) + "Start",
        evtStr="", slotListStr="";
    Object.keys( AT.resourceRoles).forEach( function (resRoleName) {
      if (AT.resourceRoles[resRoleName].range) {
        const resObj = acty[resRoleName];
        slotListStr += (resObj.name || String(resObj.id)) +", ";
      }
    });
    if (slotListStr) evtStr = `${eventTypeName}{ ${slotListStr}}`;
    else evtStr = eventTypeName;
    return `${evtStr}@${math.round(this.occTime,decPl)}`;
  }
  onEvent() {
    var slots={}, followupEvents=[],
        acty = this.plannedActivity,
        AT = acty.constructor;  // the activity's type/class
    acty.startTime = this.occTime;
    if (this.duration) acty.duration = this.duration;
    else if (AT.duration) {
      if (typeof AT.duration === "function") acty.duration = AT.duration();
      else acty.duration = AT.duration;
    }
    // update statistics
    sim.stat.actTypes[AT.name].startedActivities += 1;
    // Set activity state for all involved resource objects
    for (const resRoleName of Object.keys( AT.resourceRoles)) {
      if (AT.resourceRoles[resRoleName].range) {  // an individual pool
        const resObj = acty[resRoleName];
        if (!resObj.activityState) resObj.activityState = new aCTIVITYsTATE();
        resObj.activityState.add( AT.name);
      }
    }
    // if there is an onActivityStart procedure, execute it
    if (typeof acty.onActivityStart === "function") {
      followupEvents.push( ...acty.onActivityStart());
    }
    // Schedule an activity end event if the duration is known
    if (acty.duration) {
      slots = {
        occTime: this.occTime + acty.duration,
        activity: acty
      };
      followupEvents.push( new aCTIVITYeND( slots));
    }
    return followupEvents;
  }
}
class aCTIVITYeND extends eVENT {
  constructor({occTime, delay, activity}) {
    super({occTime, delay});
    this.activity = activity;
  }
  toString() {
    var decPl = oes.defaults.simLogDecimalPlaces,
        acty = this.activity,
        AT = acty.constructor,  // the activity's type/class
        eventTypeName = (AT.shortLabel || AT.name) + "End",
        evtStr = "", slotListStr = "";
    Object.keys( AT.resourceRoles).forEach(function (resRoleName) {
      if (AT.resourceRoles[resRoleName].range) {
        let resObj = acty[resRoleName];
        slotListStr += (resObj.name || String(resObj.id)) + ", ";
      }
    });
    if (slotListStr) evtStr = `${eventTypeName}{ ${slotListStr}}`;
    else evtStr = eventTypeName;
    return `${evtStr}@${math.round(this.occTime, decPl)}`;
  }
  onEvent() {
    const followupEvents=[],
        acty = this.activity,
        AT = acty.constructor;  // the activity's type/class
    // if there is an onActivityEnd procedure, execute it
    if (typeof acty.onActivityEnd === "function") {
      followupEvents.push(...acty.onActivityEnd());
    }
    // set occTime and duration if there was no pre-set duration
    if (!acty.duration) {
      acty.occTime = this.occTime;
      acty.duration = acty.occTime - acty.startTime;
    }
    // update statistics
    sim.stat.actTypes[AT.name].completedActivities += 1;
    // compute resource utilization per activity type (per resource object or per count pool)
    for (const resRoleName of Object.keys( AT.resourceRoles)) {
      let resUtilPerAT = sim.stat.actTypes[AT.name].resUtil;
      if (AT.resourceRoles[resRoleName].range) {  // per resource object
        let objIdStr = String( acty[resRoleName].id);
        if (resUtilPerAT[objIdStr] === undefined) resUtilPerAT[objIdStr] = 0;
        resUtilPerAT[objIdStr] += acty.duration;
        // update the activity state of resource objects
        acty[resRoleName].activityState.delete( AT.name);
      } else {  // per count pool
        let poolName = AT.resourceRoles[resRoleName].countPoolName;
        if (resUtilPerAT[poolName] === undefined) resUtilPerAT[poolName] = 0;
        resUtilPerAT[poolName] += acty.duration;
      }
    }
    // if there are still planned activities
    if (AT.plannedActivities.length > 0) {
      const nextActy = AT.plannedActivities.dequeue();
      // copy resource role slots
      for (const resRoleName of Object.keys( AT.resourceRoles)) {
        if (acty[resRoleName]) nextActy[resRoleName] = acty[resRoleName];
      }
      // start next activity with the resources already allocated before
      followupEvents.push( new aCTIVITYsTART({plannedActivity: nextActy}));
    } else {  // release resources
      for (const resRoleName of Object.keys( AT.resourceRoles)) {
        const resRole = AT.resourceRoles[resRoleName];
        if (resRole.countPoolName) {
          // release the used number of resources
          resRole.resPool.release( resRole.card);
        } else {
          // release the used resource(s)
          resRole.resPool.release( acty[resRoleName]);
        }
      }
    }
    return followupEvents;
  }
}
