class Operator extends oBJECT {
  constructor({ id, name, status, type, assignedProduct}) {
    super( id, name);
    this.status = status;
    this.type = type;  // 1,2,3
    if (assignedProduct) this.assignedProduct = assignedProduct;
  }
}
// assign admissible forklift types to operator types 1-3
Operator.canTakeForkliftTypes = [[],[1,3],[2],[3]];
Operator.labels = {"status":"st", "activityState":"act"};
