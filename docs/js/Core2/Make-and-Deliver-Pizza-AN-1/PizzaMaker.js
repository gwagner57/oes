class PizzaMaker extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
PizzaMaker.labels = {"status":"st", "activityState":"act"};
