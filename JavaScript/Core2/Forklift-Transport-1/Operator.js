class Operator extends oBJECT {
  constructor({ id, name, status, type, assignedProduct}) {
    super( id, name);
    this.status = status;
    this.type = type;  // OperatorType reference
    if (assignedProduct) this.assignedProduct = assignedProduct;
  }
}
Operator.labels = {"status":"st", "activityState":"act"};
