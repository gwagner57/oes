class LoadProduct extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return 0.5;}

  onActivityEnd() {
    const followupEvents = [];
    sim.namedObjects.get("arrivalArea").productBuffer.removeProduct(
        this.operator.assignedProduct);
    return followupEvents;
  }
}
// A Load operation requires at least one wheel loader, but can also be performed by two
LoadProduct.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
LoadProduct.PERFORMER = ["operator"];
LoadProduct.successorNode = "TransportProduct";
