class PizzaService extends oBJECT {
  constructor({ id, name, queueLength, busy}) {
    super( id, name);
    this.queueLength = queueLength;
    this.busy = busy;
  }
}
PizzaService.labels = {"status":"st", "activityState":"actSt"};
