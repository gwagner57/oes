class PerformUsScan extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  static duration() {return rand.uniform( 5, 10);}
}
// An US scan requires a doctor and a US bed
PerformUsScan.resourceRoles = {
  // implying an individual pool with default name "doctors"
  "doctor": {range: Doctor}, // by default card=1
  // implying a count pool with default name "rooms" like with {countPoolName:"rooms"}
  "usBed": {card:1}
}
