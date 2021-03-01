class MakePizza extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  duration() {return rand.triangular(3,6,4);}
}
MakePizza.resourceRoles = {
  "pizzaMakers": {range: PizzaMaker, card: 2},
  "oven": {card: 1}
}
MakePizza.PERFORMER = ["pizzaMaker"];
MakePizza.successorActivity = "DeliverPizza";
