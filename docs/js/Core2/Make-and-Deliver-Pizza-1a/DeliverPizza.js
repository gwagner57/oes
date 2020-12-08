class DeliverPizza extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  onActivityEnd() {
    sim.stat.deliveredPizzas++;
    return []
  }
  duration() {
    return rand.triangular(15, 60, 30);
  }
}
// A DeliverPizza operation requires at least one wheel loader, but can also be performed by two
DeliverPizza.resourceRoles = {
  "scooter": {card: 1}
}
DeliverPizza.PERFORMER = ["scooter"];