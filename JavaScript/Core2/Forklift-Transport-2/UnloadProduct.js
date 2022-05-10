class UnloadProduct extends aCTIVITY {
  constructor({id, startTime, duration, operator, forklift}={}) {
    super({id, startTime, duration});
    this.operator = operator;
    this.forklift = forklift;
  }
  static duration() {return 0.25;}

  onActivityEnd() {
    const followupEvents = [];
    // discharge product
    sim.namedObjects.get("destinationArea").productBuffer.addProduct( this.operator.assignedProduct);
    delete this.operator.assignedProduct;
    // check if there is another suitable product waiting to be assigned
    const product = sim.namedObjects.get("arrivalArea").productBuffer.getUnassignedProductByType(
        Forklift.canTakeProductTypes[this.forklift.type]);
    if (product) {
      this.operator.assignedProduct = product;
      product.isAssigned = true;
    }
    return followupEvents;
  }
}
UnloadProduct.resourceRoles = {
  "operator": {range: Operator},
  "forklift": {range: Forklift}
}
UnloadProduct.PERFORMER = "operator";

UnloadProduct.successorNode = acty => acty.operator.assignedProduct ?
    "DriveForkliftBackToArrivalArea" : "DriveForkliftHome";

