class EcgTechnician extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
EcgTechnician.labels = {"status":"st", "activityState":"act"};
