class OrderTaker extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
OrderTaker.labels = {"status":"st", "activityState":"act"};
