class ServiceDesk extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
    this.plannedServices = [];  // a queue
  }
}
ServiceDesk.labels = {"status":"st", "activityState":"act"};
