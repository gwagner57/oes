class PizzaService extends oBJECT {
  constructor({ id, name, status}) {
    super( id, name);
    this.status = status;
  }
}
PizzaService.labels = {"status":"st", "activityState":"actSt"};
