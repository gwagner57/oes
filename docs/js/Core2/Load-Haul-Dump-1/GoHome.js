class GoHome extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.triangular( 30, 50, 40);}
}
// An examination requires a doctor, two nurses and a room
GoHome.resourceRoles = {
  "truck": {range: Truck}
}
GoHome.PERFORMER = "truck";