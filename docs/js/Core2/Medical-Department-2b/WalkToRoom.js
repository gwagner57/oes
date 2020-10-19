class WalkToRoom extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.uniform( 0.5, 2.5);}
}
// A walk to a room requires a room and a nurse
WalkToRoom.resourceRoles = {
  "nurse": {range: Nurse, card:1},
  "room": {countPoolName:"rooms", card:1}
}
WalkToRoom.PERFORMER = "nurse";
// Enqueue a new planned examination
WalkToRoom.successorActivity = "Examination";
