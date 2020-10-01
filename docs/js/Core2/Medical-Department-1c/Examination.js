class Examination extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.uniform( 5, 9);}
}
// An examination requires a doctor
Examination.resourceRoles = {
  "doctor": {range: Doctor, card:1}
}
Examination.PERFORMER = "doctor";