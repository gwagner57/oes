/*******************************************************************************
 * OES JS Core 0 Foundation Objects and Classes
 *
 * @copyright Copyright 2020 Gerd Wagner
 *   Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

// Create initial objects/maps
const sim = Object.create(null); // instead of {}
sim.model = Object.create(null);
sim.model.v = Object.create(null);
sim.model.f = Object.create(null);
sim.scenario = Object.create(null);

/**
 * An OES object has an ID and may have a unique name. If no ID value is provided on creation,
 * an ID value is automatically assigned using the simulators "idCounter".
 */
class oBJECT {
  constructor( id, name) {
    // if no "id" value provided, use (and increment) "idCounter"
    this.id = id || sim.scenario.idCounter++;
    this.name = name;  // optional unique
    // add each new object to the collection of simulation objects
    sim.objects.set( this.id, this);
  }
  // overwrite/improve the standard toString method
  toString() {
    var Class = this.constructor, str = Class.name + `-${this.id}{ `,
        i=0, valStr="";
    Object.keys( this).forEach( function (prop) {
      var propLabel = (Class.labels && Class.labels[prop]) ? Class.labels[prop] : "",
          val = this[prop];
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
 * An OES Core 0 event is instantaneous
 */
class eVENT {
  constructor( occTime) {
    this.occTime = occTime;
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
}
/**
 * An experiment type is defined for a model.
 */
class eXPERIMENTtYPE {
  constructor({model, title, nmrOfReplications}) {
    this.model = model;  // optional (by default the model is defined in the context)
    this.title = title;  // the combination of model and title forms an ID
    this.nmrOfReplications = nmrOfReplications;
  }
}
