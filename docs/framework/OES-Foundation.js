/*******************************************************************************
 * OES JS Core 2 Foundation Objects and Classes
 *
 * @copyright Copyright 2020 Gerd Wagner
 *   Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

oes.defaults.showResPoolsInLog = false;

/******************************************************************************
 *** Lists of predefined cLASSes as reserved names for constraint checks ******
 ******************************************************************************/
oes.predefinedObjectTypes = ["oBJECT"];
oes.predefinedEventTypes = ["eVENT"];

/******************************************************************************
 * An OES object has an ID and may have a unique name. If no ID value is
 * provided on creation, an ID value is automatically assigned using the
 * simulator's "idCounter".
 ******************************************************************************/
class oBJECT {
  constructor( id, name) {
    this.id = id || sim.idCounter++;
    // add each new object to the Map of simulation objects by ID
    sim.objects.set( id, this);
    if (name) {  // name is optional
      this.name = name;
      // also add to the Map of simulation objects by name
      sim.namedObjects.set( name, this);
    }
  }
  // overwrite/improve the standard toString method
  toString() {
    const Class = this.constructor,
          labels = Class.labels,
          decPl = oes.defaults.simLogDecimalPlaces;
    var i=0, valStr="", str="";
    // suppress display, if class name is not specified in "labels"
    if (!labels?.className) return "";
    if (this.name) str = `${this.name}{ `;  // display object name
    else str = (labels?.className || Class.name) + `-${this.id}{ `;
    for (const prop of Object.keys( this)) {
      if (!labels || !labels[prop]) continue;
      const propLabel = labels[prop],
          val = this[prop];
      if (typeof val === "number" && !Number.isInteger( val)) {
        valStr = String( math.round( val, decPl));
      } else if (Array.isArray( val)) {
        valStr = "["+ val.map( v => v.id).toString() +"]";
      } else if (typeof val === "object") {
        if (val instanceof oBJECT) valStr = String( val.id);
        else valStr = JSON.stringify( val); //"{"+ val.toString() +"}";
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
          labels = Class.labels,
          eventTypeName = labels?.className || Class.name,
          decPl = oes.defaults.simLogDecimalPlaces;
    var slotListStr="", i=0, evtStr="", valStr="";
    Object.keys( this).forEach( function (prop) {
      const propLabel = (labels && labels[prop]) ? labels[prop] : "",
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
    evtStr = `${evtStr}@${math.round(this.occTime,decPl)}`;
    // event strings may be colored for highlighting
    if (this.color) evtStr = `<span style="color:${this.color}">${evtStr}</span>`;
    return evtStr;
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
