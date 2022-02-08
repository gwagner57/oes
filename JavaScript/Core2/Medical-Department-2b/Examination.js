class Examination extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.uniform( 5, 10);}
}
// An examination requires a doctor, two nurses and a room
Examination.resourceRoles = {
  // implying an individual pool with default name "doctors"
  "doctor": {range: Doctor}, // by default card=1
  // implying an individual pool with default name "nurses"
  "nurse": {range: EcgTechnician, card:2},
  // implying a count pool with default name "rooms" like with {countPoolName:"rooms"}
  "room": {card:1}
}
/*******************************************************
 *** Process Model Items *******************************
 *******************************************************/
// define the PERFORMER resource role
Examination.PERFORMERS = ["doctor", "nurse"];