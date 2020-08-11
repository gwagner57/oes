class ServiceDesk extends oBJECT {
  constructor({ id, name, waitingCustomers=[]}) {
    super( id, name);
    this.waitingCustomers = waitingCustomers;
  }
  static serviceDuration() {
    return math.getUniformRandomNumber(0.5, 5);
  }
}
ServiceDesk.labels = {"waitingCustomers":"queue"};
