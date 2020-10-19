class Examination extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.uniform( 5, 10);}
}
// An examination requires a room and a doctor
Examination.resourceRoles = {
  "doctor": {range: Doctor},
  "room": {countPoolName:"rooms"}
}
Examination.PERFORMER = "doctor";