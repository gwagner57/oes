class Examination extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.uniform( 5, 9);}
}
// An examination requires a room and a doctor
Examination.resourceRoles = {
    "doctor": {countPoolName:"doctors", card:1}
}
Examination.PERFORMER = "doctor";