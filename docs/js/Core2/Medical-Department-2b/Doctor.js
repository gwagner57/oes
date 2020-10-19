class Doctor extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
Doctor.labels = {"status":"st", "activityState":"act"};
