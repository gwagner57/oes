class MakePizza extends aCTIVITY {
  constructor({id, startTime, duration, node}={}) {
    super({id, startTime, duration, node});
  }
  static duration() {return rand.triangular(3,6,4);}
}
MakePizza.resourceRoles = {
  "pizzaMakers": {range: PizzaMaker, card: 2},
  "oven": {card: 1}
}
MakePizza.PERFORMER = ["pizzaMaker"];
MakePizza.successorNode = "DeliverPizza";
