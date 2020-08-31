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
 *  available, it may first have to be enqueued as a *planned* activity (with partially
 *  assigned properties).
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
 *   - resource pools (both simple and individualized)
 *   - an optional processOwner (= institutional agent); if there is only one (= no collaboration), it may be left implicit
 *   - pre-defined object type rESOURCE( status / isAvailable, allocate, release) specializing oBJECT,
 *     such that a resource type is defined by specializing rESOURCE
 */
// An abstract class
class aCTIVITY extends eVENT {
  // startTime=0 tells the eVENT constructor that this is an aCTIVITY
  constructor({id, occTime, startTime=0, duration}) {
    super({occTime, startTime, duration});
    if (id) this.id = id;
    else this.id = sim.idCounter++;  // activities need an ID
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

class rESOURCEpOOL {
  constructor( name, available=0) {
    this.name = name;
    this.available = available;
  }
  isAvailable() {
    return this.available > 0;
  }
  allocate() {
    this.available--;
  }
  release() {
    this.available++;
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
        acty = this.plannedActivity, AT = acty.constructor;
    acty.startTime = this.occTime;
    if (this.duration) acty.duration = this.duration;
    else if (AT.duration) {
      if (typeof AT.duration === "function") acty.duration = AT.duration();
      else acty.duration = AT.duration;
    }
    Object.keys( AT.resourceRoles).forEach( function (resRoleName) {
      if (AT.resourceRoles[resRoleName].range) {
        const resObj = acty[resRoleName];
        // set activity state for resource object
        if (!resObj.activityState) resObj.activityState = new aCTIVITYsTATE();
        resObj.activityState.add( AT.name);
      }
    });
    // if there is an onActivityStart procedure, execute it
    if (typeof acty.onActivityStart === "function") {
      followupEvents.push( ...acty.onActivityStart());
    }
    if (acty.duration) {
      // schedule activity end event
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
        acty = this.activity, AT = acty.constructor,
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
    var followupEvents=[],
        acty = this.activity,
        AT = acty.constructor;  // activity type
    // if there is an onActivityEnd procedure, execute it
    if (typeof acty.onActivityEnd === "function") {
      followupEvents.push(...acty.onActivityEnd());
    }
    // set occTime and duration if there was no pre-set duration
    if (!acty.duration) {
      acty.occTime = this.occTime;
      acty.duration = acty.occTime - acty.startTime;
    }
    // compute resource utilization per activity type (per resource object or per count pool)
    for (const resRoleName of Object.keys( AT.resourceRoles)) {
      if (resRoleName === "PERFORMER") continue;
      let resUtilPerAT = sim.stat.resUtil[AT.name];
      if (AT.resourceRoles[resRoleName].range) {  // per resource object
        let objIdStr = String(acty[resRoleName].id);
        if (resUtilPerAT[objIdStr] === undefined) resUtilPerAT[objIdStr] = 0;
        resUtilPerAT[objIdStr] += acty.duration;
        // update the activity state of resource objects
        acty[resRoleName].activityState.delete( AT.name);
      } else {  // per count pool
        let poolName = AT.resourceRoles[resRoleName].countPool;
        if (resUtilPerAT[poolName] === undefined) resUtilPerAT[poolName] = 0;
        resUtilPerAT[poolName] += acty.duration;
      }
    }
    Object.keys( AT.resourceRoles).forEach( function (resRoleName) {
    });
    return followupEvents;
  }
}
