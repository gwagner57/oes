class Load extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  onActivityEnd() {
    var followupEvents = [];
    // update nmrOfLoads counter
    sim.model.v.nmrOfLoads--;
    return followupEvents;
  }
  static duration() {return rand.uniform( 10, 20);}
}
// An examination requires a doctor, two nurses and a room
Load.resourceRoles = {
  "wheelLoader": {range: WheelLoader},
  "truck": {range: Truck}
}
Load.PERFORMER = ["wheelLoader"];
Load.successorActivity = "Haul";
