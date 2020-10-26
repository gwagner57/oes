class Load extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  onActivityEnd() {
    const followupEvents = [];
    // update nmrOfLoads counter
    sim.model.v.nmrOfLoads--;
    return followupEvents;
  }
  duration() {
    let dur = rand.uniform( 10, 20);
    // when the Load operation is performed by two wheel loaders, time is cut in half
    if (Array.isArray( this.wheelLoaders) && this.wheelLoaders.length === 2) dur = dur/2;
    return dur;
  }
}
// A Load operation requires at least one wheel loader, but can also be performed by two
Load.resourceRoles = {
  "wheelLoaders": {range: WheelLoader, minCard:1, maxCard:2},
  "truck": {range: Truck}
}
Load.PERFORMER = ["wheelLoader"];
Load.successorActivity = "Haul";
