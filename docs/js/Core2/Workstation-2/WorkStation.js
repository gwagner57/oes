class WorkStation extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
WorkStation.labels = {"inputBufferLength":"bufLen", "status":"st"};
