class WorkStation extends oBJECT {
  constructor({ id, name, inputBufferLength=0, status="AVAILABLE"}) {
    super( id, name);
    this.inputBufferLength = inputBufferLength;
    this.status = status;
  }
  static processingTime() {
    return rand.triangular( 3, 8, 4);  // min,max,mode
  }
}
WorkStation.labels = {"inputBufferLength":"bufLen", "status":"st"};
