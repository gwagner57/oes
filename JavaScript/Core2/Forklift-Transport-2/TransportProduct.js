class TransportProduct extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return rand.triangular( 0.5*TransportProduct.meanTime,
      2*TransportProduct.meanTime, TransportProduct.meanTime);}
}
TransportProduct.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
TransportProduct.PERFORMER = "operator";

TransportProduct.meanTime = sim.model.p.distanceArrivalToDestinationArea /
    sim.model.p.forkliftSpeed / 60;  // in min
TransportProduct.successorNode = "UnloadProduct";