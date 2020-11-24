class MakePizza extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
  duration() {
    var dur = 5; //rand.triangular(3, 10, 5);
    /*
    // when the MakePizza operation is performed by two pizza makers, time is cut in half
    if (Array.isArray( this.pizzaMakers) && this.pizzaMakers.length === 2) dur = dur/2;
    */
    return dur;
  }
}
MakePizza.resourceRoles = {
  //"pizzaMaker": {range: PizzaMaker, minCard:1, maxCard:2},
  "pizzaMakers": {range: PizzaMaker, card: 2},
  "oven": {card: 1}
}
MakePizza.PERFORMER = ["pizzaMaker"];
MakePizza.successorActivity = "DeliverPizza";
