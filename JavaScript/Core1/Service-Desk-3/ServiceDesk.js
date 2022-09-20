class ServiceDesk extends oBJECT {
  constructor({ id, name, queueLength=0, status="AVAILABLE"}) {
    super( id, name);
    this.queueLength = queueLength;
    this.status = status;
  }
  static serviceTime() {
    return rand.triangular( 3, 8, 4);  // min,max,mode
  }
}
ServiceDesk.labels = {"queueLength":"bufLen", "status":"st"};
