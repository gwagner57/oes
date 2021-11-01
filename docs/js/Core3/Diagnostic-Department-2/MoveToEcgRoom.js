class MoveToEcgRoom extends aCTIVITY {
  constructor({id, startTime, duration, patient}={}) {
    super({id, startTime, duration});
    this.patient = patient;
  }
  static duration() {return rand.uniform( 0.5, 2.5);}
}
// A walk to a room requires a room and a nurse
MoveToEcgRoom.resourceRoles = {
  // implying a count pool, see below for its name (countPoolName="rooms")
  "ecgRoom": {card:1}
}
/*******************************************************
 *** Process Model Items *******************************
 *******************************************************/
// assign resource pools to resource roles
MoveToEcgRoom.resourceRoles["ecgRoom"].countPoolName = "ecgRooms";
// enqueue a new planned examination
MoveToEcgRoom.successorNode = "Examination";
