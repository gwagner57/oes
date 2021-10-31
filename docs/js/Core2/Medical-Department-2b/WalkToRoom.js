class WalkToRoom extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.uniform( 0.5, 2.5);}
}
// A walk to a room requires a room and a nurse
WalkToRoom.resourceRoles = {
  // implying an individual pool with default name "nurses"
  "nurse": {range: EcgTechnician},
  // implying a count pool, see below for its name (countPoolName="rooms")
  "room": {card:1}
}
/*******************************************************
 *** Process Model Items *******************************
 *******************************************************/
// define the PERFORMER resource role
WalkToRoom.PERFORMER = "nurse";
// assign resource pools to resource roles
WalkToRoom.resourceRoles["room"].countPoolName = "rooms";
// enqueue a new planned examination
WalkToRoom.successorNode = "Examination";
