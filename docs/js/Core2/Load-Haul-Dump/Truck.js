class Truck extends oBJECT {
  constructor({ id, name, status, capacity}) {
    super( id, name);
    this.status = status;
    this.capacity = capacity;
  }
}
Truck.labels = {"status":"st", "activityState":"act"};
