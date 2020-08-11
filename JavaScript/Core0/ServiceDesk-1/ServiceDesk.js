class ServiceDesk extends oBJECT {
  constructor({ id, name, queueLength}) {
    super( id, name);
    this.queueLength = queueLength;
  }
  static serviceTime() {
    var r = math.getUniformRandomInteger( 0, 99);
    if ( r < 30) return 2;         // probability 0.30
    else if ( r < 80) return 3;    // probability 0.50
    else return 4;                 // probability 0.20
  }
}
ServiceDesk.labels = {"waitingCustomers":"qLen"};
