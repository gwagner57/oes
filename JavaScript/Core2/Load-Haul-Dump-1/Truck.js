class Truck extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
Truck.capacity = 15;  // m3
Truck.labels = {"status":"st", "activityState":"act"};
