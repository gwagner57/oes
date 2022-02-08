class MakePizza extends aCTIVITY {
  constructor({id, startTime, duration, pizzaService}={}) {
    super({id, startTime, duration});
    this.pizzaService = pizzaService;
  }
  static duration() {
    return rand.uniform( 1, 3);
  }
}
MakePizza.resourceRoles = {
  "pizzaService": {range: PizzaService, card: 1}
}
