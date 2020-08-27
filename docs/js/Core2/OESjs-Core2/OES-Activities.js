/******************************************************************************
 *** Activities Package *******************************************************
 ******************************************************************************/
/**
 *  Activities are events that have some duration and typically depend on resources.
 *  Their duration may be either pre-set to a fixed value or to a random value (implying
 *  that they have a scheduled end event), or it may be determined by the occurrence
 *  of an activity end event that is caused by another simulation event (in which case
 *  they have an "open end"). The duration of a pre-set duration activity can be defined
 *  in 3 ways: either for all activities of some type AT by a) a class-level attribute
 *  AT.duration or b) a class-level function AT.duration(), or
 *  c) by setting the attribute "duration" of its aCTIVITYsTART event.
 *
 *  Activities typically depend on resources. The actor(s)
 *  that (jointly) perform(s) an activity can be viewed as (a) special resource(s).
 *  At any simulation step there is a (possibly empty) set of ongoing activities.
 *  The objects that participate in an ongoing activity as resources are in a
 *  certain activity state (e.g., "printing", "service-performing"), in which they
 *  are no more available for other activities that try to allocate them as
 *  resources, if their resource role is exclusive/non-shareable.
 *
 *  As events, activities may be associated with participating objects, which are
 *  not resources.
 *
 *  For any resource of an activity, its utilization by that activity during
 *  a certain time period is measured by the simulator and can be included
 *  in the ex-post statistics.
 *
 *  An activity type is defined as a subtype of the OES class "aCTIVITY" with a
 *  mandatory class-level method "generateId" and a mandatory class-level attribute
 *  "resourceRoles", and an optional class-level method "duration".
 *
 *  A pre-defined event type oes.ActivityStart is used for creating activity start
 *  events with a constructor parameter "resourceRoles" defining a resource roles map
 *  assigning resource object references to resource role names. When an activity
 *  start event occurs, a JS object representing the activity is created, the
 *  resource roles map is copied to corresponding property slots of the activity,
 *  and the value of the activityState property of all resource objects is updated
 *  by adding the activity type name (the activityState is a set/map of the names
 *  of those types of activities, in which the object is participating).
 */
// An abstract class
class aCTIVITY extends eVENT {
  constructor({id, occTime, startTime, duration, resourceRoles}) {
    super({occTime, startTime, duration});
    this.id = id;
    // on activity creation, resource roles are copied to corresp. property slots
    this.resourceRoles = resourceRoles;
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
class aCTIVITYsTART extends eVENT {
  constructor({occTime, delay, activityType, resourceRoles}) {
    super({occTime, delay});
    this.activityType = activityType;
    // on activity creation, resource roles are copied to corresp. property slots
    this.resourceRoles = resourceRoles;
  }
  toString() {
    var decPl = oes.defaults.simLogDecimalPlaces,
        eventTypeName = (this.activityType.shortLabel || this.activityType.name) + "Start",
        evtStr="", slotListStr="";
    Object.keys( this.resourceRoles).forEach( function (resRole) {
      var resObj = this.resourceRoles[resRole];
      slotListStr += (resObj.name || String(resObj.id)) +", ";
    }, this);
    if (slotListStr) evtStr = `${eventTypeName}{ ${slotListStr}}`;
    else evtStr = eventTypeName;
    return `${evtStr}@${math.round(this.occTime,decPl)}`;
  }
  onEvent() {
    var slots={}, acty=null, followupEvents=[],
        AT = this.activityType;
    if (this.duration > 0) slots.duration = this.duration;
    else if (AT.duration) {
      if (typeof AT.duration === "function") slots.duration = AT.duration();
      else slots.duration = AT.duration;
    }
    Object.keys( this.resourceRoles).forEach( function (resRole) {
      var resObj = this.resourceRoles[resRole];
      // copy resource def. slots as ref. prop. slots
      if (!slots[resRole]) slots[resRole] = resObj;
      // set activity state for resource object
      if (!resObj.activityState) resObj.activityState = new aCTIVITYsTATE();
      resObj.activityState.add( this.activityType.name);
    }, this);
    slots.id = sim.idCounter++;  // activities need an ID
    slots.startTime = this.occTime;
    slots.resourceRoles = this.resourceRoles;
    // create new activity
    acty = new AT( slots);
    // register new activity as an ongoing activity
    sim.ongoingActivities.set( acty.id, acty);
    // if there is an onActivityStart procedure, execute it
    if (typeof acty.onActivityStart === "function") {
      followupEvents = acty.onActivityStart();
    }
    if (acty.duration) {
      // schedule activity end event
      slots = {
        occTime: this.occTime + acty.duration,
        activityType: AT,
        activityIdRef: acty.id
      };
      if (this.performer) slots.performer = this.performer;
      followupEvents.push( new aCTIVITYeND( slots));
    }
    return followupEvents;
  }
}
class aCTIVITYeND extends eVENT {
  constructor({occTime, delay, activityType, activityIdRef}) {
    super({occTime, delay});
    this.activityType = activityType;
    this.activityIdRef = activityIdRef;
  }
  toString() {
    var decPl = oes.defaults.simLogDecimalPlaces,
        eventTypeName = (this.activityType.shortLabel || this.activityType.name) + "End",
        resourceRoles = sim.ongoingActivities.get( this.activityIdRef).resourceRoles,
        evtStr = "", slotListStr = "";
    Object.keys( resourceRoles).forEach(function (resRole) {
      var resObj = resourceRoles[resRole];
      slotListStr += (resObj.name || String(resObj.id)) + ", ";
    }, this);
    if (slotListStr) evtStr = `${eventTypeName}{ ${slotListStr}}`;
    else evtStr = eventTypeName;
    return `${evtStr}@${math.round(this.occTime, decPl)}`;
  }
  onEvent() {
    var followupEvents=[],
        acty = sim.ongoingActivities.get( this.activityIdRef);  // retrieve activity
    // if there is an onActivityEnd procedure, execute it
    if (acty.onActivityEnd) followupEvents = acty.onActivityEnd();
    // set occTime and duration if there was no pre-set duration
    if (!acty.duration) {
      acty.occTime = this.occTime;
      acty.duration = acty.occTime - acty.startTime;
    }
    // compute resource utilization per resource per activity type
    Object.keys( acty.resourceRoles).forEach( function (resRole) {
      var objIdStr = String(acty[resRole].id),
          resUtilMap = sim.stat.resUtil[this.activityType.name];
      if (resUtilMap[objIdStr] === undefined) resUtilMap[objIdStr] = 0;
      resUtilMap[objIdStr] += acty.duration;
      // update the activity state of resource objects
      acty[resRole].activityState.delete( this.activityType.name);
    }, this);
    // drop activity from list of ongoing activities
    delete sim.ongoingActivities[String( this.activityIdRef)];
    return followupEvents;
  }
}
