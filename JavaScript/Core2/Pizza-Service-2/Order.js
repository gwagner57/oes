class Order extends eVENT {
  constructor({ occTime, delay, pizzaService}) {
    super({occTime, delay});
    this.pizzaService = pizzaService;
  }
  onEvent() {
    let followupEvents=[];
    // update statistics
    sim.stat.nmrOfOrders++;
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
Order.successorNode = "MakePizza";
