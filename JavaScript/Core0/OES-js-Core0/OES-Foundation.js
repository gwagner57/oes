/*******************************************************************************
 * OES Foundation - A simple Discrete Event Simulation Framework
 *
 * @copyright Copyright 2020 Gerd Wagner
 *   Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

// Define namespace variables
const sim = Object.create(null); // instead of {}
sim.model = Object.create(null);
sim.scenario = Object.create(null);

class oBJECT {
  constructor( id, name) {
    this.id = id || sim.scenario.idCounter++;
    this.name = name;  // optional
    // add each new object to list of simulation objects
    sim.objects.set( this.id, this);
  }
  // overwrite/improve the standard toString method
  toString() {
    var str = this.constructor.name +"-"+this.id +"{ ",
        i=0, valStr="";
    Object.keys( this).forEach( function (prop) {
      var propLabel = (this.constructor.labels && this.constructor.labels[prop]) ?
          this.constructor.labels[prop] : "", val = this[prop];
      if (typeof val === "number" && !Number.isInteger( val)) {
        valStr = String( math.round( val, oes.ui.simLogDecimalPlaces));
      } else if (Array.isArray( val)) {
        valStr = "["+ val.map( v => v.id).toString() +"]";
      } else valStr = JSON.stringify( val);
      if (propLabel && val !== undefined) {
        str += (i>0 ? ", " : "") + propLabel +": "+ valStr;
        i = i+1;
      }
    }, this);
    return str +"}";
  }
}
class eVENT {
  constructor( occTime, startTime, duration) {
    this.occTime = occTime;
    // only meaningful for events with duration (e.g., activities)
    this.startTime = startTime;
    this.duration = duration;
  }
  // overwrite/improve the standard toString method
  toString() {
    var eventTypeName = this.constructor.name,
        slotListStr="", i=0, evtStr="", decPl = oes.ui.simLogDecimalPlaces;
    Object.keys( this).forEach( function (prop) {
      var propLabel = (this.constructor.labels && this.constructor.labels[prop]) ?
          this.constructor.labels[prop] : "";
      if (propLabel && this[prop] !== undefined) {
        slotListStr += (i>0 ? ", " : "") + propLabel +": "+ JSON.stringify( this[prop]);
        i = i+1;
      }
    }, this);
    if (slotListStr) evtStr = `${eventTypeName}{ ${slotListStr}}`;
    else evtStr = eventTypeName;
    return `${evtStr}@${math.round(this.occTime,decPl)}`;
/*
    var occT = sim.model.time === "continuous" && sim.timeRoundingFactor ?
        Math.round( this.occTime * sim.timeRoundingFactor) / sim.timeRoundingFactor :
        this.occTime;
    var str1="", str2="", evtStr="", i=0,
        eventTypeName = this.constructor.Name, AT=null,
        propDs={}, slots={};
    switch (eventTypeName) {
      case "aCTIVITYsTART":
        AT = cLASS[this.activityType];
        if (!AT.shortLabel) return "";
        str1 = AT.shortLabel + "Start";
        propDs = AT.properties;
        slots = this.resources;
        break;
      case "pROCESSINGaCTIVITYsTART":
        break;
      case "aCTIVITYeND":
        AT = cLASS[this.activityType];
        if (!AT.shortLabel) return "";
        str1 = AT.shortLabel + "End";
        propDs = AT.properties;
        slots = {"activityIdRef": this.activityIdRef};
        break;
      default:
        if (!this.constructor.shortLabel) return "";
        str1 = this.constructor.shortLabel;
        propDs = cLASS[eventTypeName].properties;
        slots = this;
    }
    str2 = "{";
    Object.keys( slots).forEach( function (p) {
      var propDecl = propDs[p], val = slots[p], propLabel="", valStr="";
      if (propDecl && propDecl.shortLabel) {
        propLabel = propDecl.shortLabel;
        if (cLASS[propDecl.range]) {  // a reference property
          valStr = val.id;
        } else {  // if the property is not a reference property
          if (typeof val === "number" && !Number.isInteger(val) && sim.timeRoundingFactor) {
            valStr = JSON.stringify( Math.round(
                val * sim.timeRoundingFactor) / sim.timeRoundingFactor);
          } else valStr = JSON.stringify( val);
        }
      }
      if (val !== undefined && propLabel) {
        str2 += (i>0 ? ", " : "") + propLabel +":"+ valStr;
        i = i+1;
      }
    });
*/
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
  constructor( name, values) {
    this.name = name;
    this.values = values;  // an array list of numbers
  }
  static val2str(v) {
    return v.toString();  // JSON.stringify( v);
  }
  static str2val(str) {
    return JSON.parse( str);
  }
}
/**
 * An experiment type is defined for a scenario, which is defined for a model.
 */
class eXPERIMENTtYPE {
  constructor({model, scenarioNo, experimentNo, title,
                nmrOfReplications, parameterDefs=[], seeds=[]}) {
    this.model = model;  // optional (by default the model is defined in the context)
    // The sequence number relative to the underlying simulation model
    this.scenarioNo = scenarioNo;  // optional (by default the scenario is defined in the context)
    // The sequence number relative to the underlying simulation scenario
    this.experimentNo = experimentNo;
    this.title = title;  // optional
    this.nmrOfReplications = nmrOfReplications;
    this.parameterDefs = parameterDefs;  // an array list
    this.seeds = seeds;  // an array list with seeds.length = nmrOfReplications
    this.scenarios = [];  // experiment scenarios (will be created at runtime)
  }
}
class eXPERIMENTrUN {
  constructor({id, experimentDef, dateTime}) {
    this.id = id;  // an AutoNumber (possibly a timestamp)
    this.experimentDef = experimentDef;
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
