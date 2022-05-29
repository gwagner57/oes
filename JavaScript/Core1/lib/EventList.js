/*******************************************************************************
 * EventList maintains an ordered list of events
 * @copyright Copyright 2015-2016 Gerd Wagner
 *   Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/
class EventList {
  constructor(a) {
    this.events = Array.isArray(a) ? a : [];
  }
  add(e) {
    this.events.push( e);
    this.events.sort( (e1, e2) => e1.occTime - e2.occTime);
  }
  sort() {
    this.events.sort( (e1, e2) => e1.occTime - e2.occTime);
  }
  getNextOccurrenceTime() {
    if (this.events.length > 0) return this.events[0].occTime;
    else return 0;
  }
  getNextEvent() {
    if (this.events.length > 0) return this.events[0];
    else return null;
  }
  isEmpty() {
    return (this.events.length <= 0);
  }
  removeNextEvents() {
    var nextTime=0, nextEvents=[];
    if (this.events.length === 0) return [];
    nextTime = this.events[0].occTime;
    while (this.events.length > 0 && this.events[0].occTime === nextTime) {
      nextEvents.push( this.events.shift());
    }
    return nextEvents;
  }
  containsEventOfType( evtType) {
    return this.events.some( evt => evt.constructor.name === evtType);
  }
  getActivityEndEvent( acty) {
    return this.events.find( evt => evt.constructor.name === "aCTIVITYeND" && evt.activity === acty);
  }
  toString() {
    var str="";
    if (this.events.length > 0) {
      str = this.events.reduce( function (serialization, e) {
        return serialization +", "+ e.toString();
      }, "");
      str = str.slice(1);
    }
    return str;
  }
  clear() {this.events.length = 0;}
}
