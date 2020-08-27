class ServiceDesk extends oBJECT {
  constructor({ id, name, queueLength}) {
    super( id, name);
    this.queueLength = queueLength;
  }
}
ServiceDesk.labels = {"queueLength":"qLen", "activityState":"act"};
