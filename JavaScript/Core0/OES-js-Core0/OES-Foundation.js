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

/**
 * An objet has an ID and may have a unique name.
 */
class oBJECT {
  constructor( id, name) {
    this.id = id || sim.scenario.idCounter++;
    this.name = name;  // optional unique
    // add each new object to the collection of simulation objects
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
/**
 * An event may be instantaneous or it may have a non-zero duration.
 */
class eVENT {
  constructor( occTime, startTime, duration) {
    this.occTime = occTime;
    // only meaningful for events with duration (e.g., activities)
    this.startTime = startTime;  // optional
    this.duration = duration;  // optional
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
  }
  // an event priority comparison function for Array.sort
  static rank( e1, e2) {
    var p1=0, p2=0;
    if (e1.constructor.priority) p1 = e1.constructor.priority;
    if (e2.constructor.priority) p2 = e2.constructor.priority;
    return p2 - p1;
  }
}
/**
 * An experiment type is defined for a scenario, which is defined for a model.
 */
class eXPERIMENTtYPE {
  constructor({model, scenarioNo, experimentNo, title, nmrOfReplications}) {
    this.model = model;  // optional (by default the model is defined in the context)
    // The sequence number relative to the underlying simulation model
    this.scenarioNo = scenarioNo;  // optional (by default the scenario is defined in the context)
    // The sequence number relative to the underlying simulation scenario
    this.experimentNo = experimentNo;
    this.title = title;  // optional
    this.nmrOfReplications = nmrOfReplications;
  }
}
