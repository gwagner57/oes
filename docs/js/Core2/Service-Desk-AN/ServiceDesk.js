class ServiceDesk extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
ServiceDesk.labels = {"status":"st", "activityState":"act"};
