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
    // if there are still waiting orders
    if (this.pizzaService.queueLength > 0) {
      // start next MakePizza activity
      let makePizzaActy = new MakePizza({
        duration: MakePizza.duration(),
        pizzaService: this.pizzaService
      });
      followupEvents.push( new aCTIVITYsTART({plannedActivity: makePizzaActy}));
    } else {
      this.pizzaService.busy = false;
    }
    return followupEvents;
  }
  static duration() {
    return rand.uniform( 1, 3);
  }
}
