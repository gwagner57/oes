class Forklift extends oBJECT {
  constructor({ id, name, status, type}) {
    super( id, name);
    this.status = status;
    this.type = type;  // ForkliftType reference
  }
}
Forklift.labels = {"status":"st", "activityState":"act"};
