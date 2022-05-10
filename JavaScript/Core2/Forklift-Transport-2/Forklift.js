class Forklift extends oBJECT {
  constructor({ id, name, status, type}) {
    super( id, name);
    this.status = status;
    this.type = type;  // 1,2,3
  }
}
Forklift.labels = {"status":"st", "activityState":"act"};
// assign admissible product types to forklift types 1-3
Forklift.canTakeProductTypes = [[],[1,2],[2],[2,3]];
