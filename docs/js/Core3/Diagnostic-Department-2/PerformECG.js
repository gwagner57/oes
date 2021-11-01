class DoECG extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.triangular( 5, 10, 7);}
}
// An examination requires a doctor, two nurses and a room
DoECG.resourceRoles = {
  // implying an individual pool with default name "ecgTechnicians"
  "ecgTechnician": {range: EcgTechnician}, // by default card=1
  // implying a count pool with default name "ecgRooms"
  "ecgRoom": {card:1}
}
/*******************************************************
 *** Process Model Items *******************************
 *******************************************************/
// define the PERFORMER resource role
DoECG.PERFORMERS = ["doctor", "nurse"];