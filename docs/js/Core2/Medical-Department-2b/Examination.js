class Examination extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.uniform( 5, 10);}
}
// An examination requires a doctor, two nurses and a room
Examination.resourceRoles = {
  "doctor": {range: Doctor},
  "nurse": {range: Nurse, card:2},
  "room": {countPoolName:"rooms"}
}
Examination.PERFORMERS = ["doctor", "nurse"];