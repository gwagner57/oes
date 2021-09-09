class Haul extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.triangular( 40, 60, 55);}
}
// An examination requires a doctor, two nurses and a room
Haul.resourceRoles = {
  "truck": {range: Truck}
}
Haul.PERFORMER = "truck";
Haul.successorNode = "Dump";
