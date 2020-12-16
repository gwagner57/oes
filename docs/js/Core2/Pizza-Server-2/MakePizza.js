class MakePizza extends aCTIVITY {
  constructor({id, startTime, duration, pizzaService}={}) {
    super({id, startTime, duration});
    this.pizzaService = pizzaService;
  }
  onActivityStart() {
    var followupEvents = [];
    this.pizzaService.busy = true;
    return followupEvents;
  }
  onActivityEnd() {
    var followupEvents = [];
    // decrement queue length
    this.pizzaService.queueLength--;
    // update statistics
    sim.stat.nmrOfDeliveredPizzas++;
    return followupEvents;
  }
  static duration() {
    return rand.uniform( 1, 3);
  }
}
MakePizza.resourceRoles = {
  "pizzaService": {range: PizzaService, card: 1}
}
