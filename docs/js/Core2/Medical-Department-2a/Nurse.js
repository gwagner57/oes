class Nurse extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
Nurse.labels = {"status":"st", "activityState":"act"};
