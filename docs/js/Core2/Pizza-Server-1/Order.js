class Order extends eVENT {
  constructor({ occTime, delay, pizzaService}) {
    super({occTime, delay});
    this.pizzaService = pizzaService;
  }
  onEvent() {
    let followupEvents=[];
    // increment queue length
    this.pizzaService.queueLength++;
    // update statistics
    sim.stat.nmrOfOrders++;
    if (this.pizzaService.queueLength > sim.stat.maxQueueLength) {
      sim.stat.maxQueueLength = this.pizzaService.queueLength;
    }
    // if the service desk is not busy
    if (!this.pizzaService.busy) {
      let makePizzaActy = new MakePizza({
        duration: MakePizza.duration(),
        pizzaService: this.pizzaService
      });
      followupEvents.push( new aCTIVITYsTART({plannedActivity: makePizzaActy}));
    }
    return followupEvents;
  }
  createNextEvent() {
    return new Order({
      delay: Order.recurrence(),
      pizzaService: this.pizzaService
    });
  }
  static recurrence() {
    return rand.exponential( 0.5);
  }
}
