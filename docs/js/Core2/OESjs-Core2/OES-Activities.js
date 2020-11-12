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
 *  TODO:
 *   - introduce alternative resource pools
 *   - introduce resource allocation priorities defined per activity
 *   - support the two allocation policies: (1) allocate all resources at once, and (2) allocate resources step by step
 *   - ? introduce object type rESOURCE (with status attribute) specializing oBJECT,
 *     such that a resource type is defined by specializing rESOURCE
 *   - an optional processOwner (= institutional agent); if there is only one (= no collaboration), it may be left implicit
 *     if there is are two or more processOwners, can an activity type be included in more than one process container (= Pool)?
 *     if yes, it may have different performers (and other resource pools) in different process containers
 */
// An abstract class
class aCTIVITY extends eVENT {
  // startTime=0 indicates to the eVENT constructor that this is an aCTIVITY
  constructor({id, occTime, startTime=0, duration, enqueueTime}) {
    super({occTime, startTime, duration});
    if (id) this.id = id;
    else this.id = sim.idCounter++;  // activities need an ID
    if (enqueueTime) this.enqueueTime = enqueueTime;
  }
}
// Define a datatype class for queues of planned activities
class pLANNEDaCTIVITIESqUEUE extends Array {
  constructor() {
    super();
  }
  static ifAvailAllocReqResAndStartNextActivity( AT) {
    if (AT.plannedActivities.length === 0) return;
    const nextActy = AT.plannedActivities[0];
    // Are all required resources available?
    if (Object.keys( AT.resourceRoles)
        // test only for resources not yet assigned
        .filter( resRoleName => !nextActy[resRoleName])
        .map( resRoleName => AT.resourceRoles[resRoleName])
        .every( resRole => (resRole.resPool.isAvailable( resRole.card||resRole.minCard)))) {
      // remove next activity from queue
      AT.plannedActivities.dequeue();
      // Allocate all required resources
      for (const resRoleName of Object.keys( AT.resourceRoles)) {
        if (!nextActy[resRoleName]) {
          const resRole = AT.resourceRoles[resRoleName];
          // allocate the required/maximal quantity of resources from the pool
          let resQuantity=0;
          if (resRole.card) resQuantity = resRole.card;
          else if (resRole.maxCard) {
            resQuantity = Math.min( resRole.maxCard, resRole.resPool.nmrAvailable());
          }
          const allocatedRes = resRole.resPool.allocate( resQuantity);
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
      // start next activity with the allocated resources
      sim.FEL.add( new aCTIVITYsTART({plannedActivity: nextActy}));
    }
  }
  enqueue( acty) {
    const AT = acty.constructor;
    if (this !== AT.plannedActivities) {
      console.error("Attempt to push an "+ AT.name +" to wrong queue!");
      return;
    }
    acty.enqueueTime = sim.time;
    this.push( acty);
    sim.stat.actTypes[AT.name].enqueuedActivities += 1;
    // compute generic queue length statistics per activity type
    if (this.length > sim.stat.actTypes[AT.name].queueLength.max) {
      sim.stat.actTypes[AT.name].queueLength.max = this.length;
    }
    //TODO: compute average queue length statistics
    // if available, allocate required resources and schedule next activity
    pLANNEDaCTIVITIESqUEUE.ifAvailAllocReqResAndStartNextActivity( AT);
  }
  dequeue() {
    const acty = this.shift(),
          AT = acty.constructor;
    sim.stat.actTypes[AT.name].dequeuedActivities += 1;
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
     is formed from the role's range name (lower-cased and pluralized by appending "s")
 ****************************************************************************/
class rESOURCEpOOL {
  constructor( {name, available, resources}) {
    this.name = name;
    if (available !== undefined) this.available = available;
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
  nmrAvailable() {
    return this.availResources.length;
  }
  allocateAll() {
    if (this.availResources) {  // individual pool
      let allocatedRes = [...this.availResources];
      for (const res of this.availResources) {
        res.status = oes.ResourceStatusEL.BUSY;
        this.busyResources.push( res);
      }
      this.availResources.length = 0;
      return allocatedRes;
    } else this.available = 0;  // count pool
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
          return;
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
      return;
    }
    // try starting enqueued planned activities depending on this type of resource
    for (const AT of this.dependentActivityTypes) {
      pLANNEDaCTIVITIESqUEUE.ifAvailAllocReqResAndStartNextActivity( AT);
    }
  }
  clear() {
    if (this.available === undefined) {  // individual pool
      this.busyResources.length = 0;
      this.availResources.length = 0;
    } else {  // count pool
      this.available = 0;
    }
  }
  toString() {
    if (this.available === undefined) {  // individual pool
      const availRes = this.availResources.map( r => r.name || r.id);
      return `av. ${this.name}: ${availRes}`;
    } else {
      return `av. ${this.name}: ${this.available}`;
    }
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
    return `${evtStr}@${math.round(this.occTime,decPl)}`;
  }
  onEvent() {
    var followupEvents=[],
        acty = this.plannedActivity,
        AT = acty.constructor;  // the activity's type/class
    acty.startTime = this.occTime;
    if (AT.duration) {
      if (typeof AT.duration === "function") acty.duration = AT.duration();
      else acty.duration = AT.duration;
    } else if (typeof acty.duration === "function") {
      acty.duration = acty.duration();
    }
    // update statistics
    sim.stat.actTypes[AT.name].startedActivities += 1;
    // Set activity state for all involved resource objects
    for (const resRoleName of Object.keys( AT.resourceRoles)) {
      if (AT.resourceRoles[resRoleName].range) {  // an individual pool
        let resObjects = acty[resRoleName];
        if (!Array.isArray( resObjects)) resObjects = [resObjects];
        for (const resObj of resObjects) {
          if (!resObj.activityState) resObj.activityState = new aCTIVITYsTATE();
          resObj.activityState.add( AT.name);
        }
      }
    }
    // if there is an onActivityStart procedure, execute it
    if (typeof acty.onActivityStart === "function") {
      followupEvents.push( ...acty.onActivityStart());
    }
    // Schedule an activity end event if the duration is known
    if (acty.duration) {
      const slots = {
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
  onEvent() {
    const followupEvents=[],
        acty = this.activity,
        AT = acty.constructor,  // the activity's type/class
        waitingTimeStat = sim.stat.actTypes[AT.name].waitingTime,
        cycleTimeStat = sim.stat.actTypes[AT.name].cycleTime,
        resUtilPerAT = sim.stat.actTypes[AT.name].resUtil;
    // if there is an onActivityEnd procedure, execute it
    if (typeof acty.onActivityEnd === "function") {
      followupEvents.push(...acty.onActivityEnd());
    }
    acty.occTime = this.occTime;
    // set duration if there was no pre-set duration
    if (!acty.duration) {
      acty.duration = acty.occTime - acty.startTime;
    }
    // update statistics
    sim.stat.actTypes[AT.name].completedActivities++;
    const waitingTime = acty.enqueueTime ? acty.startTime - acty.enqueueTime : 0;
    //waitingTimeStat.total += waitingTime;
    if (waitingTimeStat.max < waitingTime) waitingTimeStat.max = waitingTime;
    const cycleTime = waitingTime + acty.occTime - acty.startTime;
    //cycleTimeStat.total += cycleTime;
    if (cycleTimeStat.max < cycleTime) cycleTimeStat.max = cycleTime;
    // compute resource utilization per activity type (per resource object or per count pool)
    for (const resRoleName of Object.keys( AT.resourceRoles)) {
      const resRole = AT.resourceRoles[resRoleName];
      if (resRole.range) {  // per resource object
        let resObjects = acty[resRoleName];
        if (!Array.isArray( resObjects)) resObjects = [resObjects];
        for (const resObj of resObjects) {
          resUtilPerAT[String(resObj.id)] += acty.duration;
          // update the activity state of resource objects
          resObj.activityState.delete( AT.name);
        }
      } else {  // per count pool
        resUtilPerAT[resRole.countPoolName] += acty.duration;
      }
    }
    // enqueue or schedule a successor activity according to the process model
    if (AT.successorActivity) {
      const SuccAT = typeof AT.successorActivity === "function" ?
                     sim.Classes[AT.successorActivity()] : sim.Classes[AT.successorActivity],
            succActy = new SuccAT(),
            succActyResRoleNames = Object.keys( SuccAT.resourceRoles),
            actyResRoleNames = Object.keys( AT.resourceRoles);
      // By default, keep (individual) resources that are shared between AT and SuccAT
      for (const resRoleName of actyResRoleNames) {
        if (SuccAT.resourceRoles[resRoleName] && acty[resRoleName]) {
          succActy[resRoleName] = acty[resRoleName];
          delete acty[resRoleName];
        }
      }
      // are all successor activity resources allocated (included in activity resources)?
      if (succActyResRoleNames.every( rn => actyResRoleNames.includes( rn))) {
        // start successor activity
        followupEvents.push( new aCTIVITYsTART({plannedActivity: succActy}));
      } else {  // enqueue successor activity
        SuccAT.plannedActivities.enqueue( succActy);
      }
    }
    // release all resources of acty
    for (const resRoleName of Object.keys( AT.resourceRoles)) {
      const resRole = AT.resourceRoles[resRoleName];
      if (resRole.countPoolName) {
        // release the used number of count pool resources
        resRole.resPool.release( resRole.card);
      } else {
        // release the used individual resource if it has not been transferred to succActy
        if (acty[resRoleName]) resRole.resPool.release( acty[resRoleName]);
      }
    }
    // if there are still planned activities of type AT
    if (AT.plannedActivities.length > 0) {
      // if available, allocate required resources and schedule next activity
      pLANNEDaCTIVITIESqUEUE.ifAvailAllocReqResAndStartNextActivity( AT);
    }
    return followupEvents;
  }
}
/*******************************************************
 * Set up the generic ex-post statistics
 ********************************************************/
oes.setupGenericStatistics = function () {
  // Per activity type
  if (Array.isArray( sim.model.activityTypes) && sim.model.activityTypes.length > 0) {
    sim.stat.actTypes = Object.create(null);  // an empty map
    for (const actTypeName of sim.model.activityTypes) {
      sim.stat.actTypes[actTypeName] = Object.create(null);
      // generic queue length statistics
      sim.stat.actTypes[actTypeName].queueLength = Object.create(null);
      // resource utilization statistics
      sim.stat.actTypes[actTypeName].resUtil = Object.create(null);
      // waiting time statistics
      sim.stat.actTypes[actTypeName].waitingTime = Object.create(null);
      // cycle time statistics
      sim.stat.actTypes[actTypeName].cycleTime = Object.create(null);
    }
  }
  //if (Object.keys( oes.EntryNode.instances).length > 0) oes.setupProcNetStatistics();
  /*
  // initialize PN statistics
  if (Object.keys( oes.ProcessingNode.instances).length > 0) {
    sim.stat.resUtil["pROCESSINGaCTIVITY"] = {};
  }
  */
}
/*******************************************************
 * Initialize the pre-defined ex-post statistics
 ********************************************************/
oes.initializeGenericStatistics = function () {
  // Per activity type
  if (Array.isArray( sim.model.activityTypes) && sim.model.activityTypes.length > 0) {
    for (const actTypeName of sim.model.activityTypes) {
      const actStat = sim.stat.actTypes[actTypeName],
          resUtilPerAT = actStat.resUtil,
          AT = sim.Classes[actTypeName];
      // initialize throughput statistics
      actStat.enqueuedActivities = 0;
      actStat.dequeuedActivities = 0;
      actStat.startedActivities = 0;
      actStat.completedActivities = 0;
      // generic queue length statistics
      //actStat.queueLength.avg = 0.0;
      actStat.queueLength.max = 0;
      // waiting time statistics
      //actStat.waitingTime.avg = 0.0;
      actStat.waitingTime.max = 0;
      // cycle time statistics
      //actStat.cycleTime.avg = 0.0;
      actStat.cycleTime.max = 0;
      // initialize resource utilization per resource object or per count pool
      for (const resRoleName of Object.keys( AT.resourceRoles)) {
        const resRole = AT.resourceRoles[resRoleName];
        if (resRole.range) {  // per resource object
          for (const resObj of resRole.resPool.availResources) {
            resUtilPerAT[String(resObj.id)] = 0;
          }
        } else {  // per count pool
          resUtilPerAT[resRole.countPoolName] = 0;
        }
      }
    }
  }
  //if (Object.keys( oes.EntryNode.instances).length > 0) oes.setupProcNetStatistics();
  /*
  // initialize PN statistics
  if (Object.keys( oes.ProcessingNode.instances).length > 0) {
    sim.stat.resUtil["pROCESSINGaCTIVITY"] = {};
  }
  */
}
