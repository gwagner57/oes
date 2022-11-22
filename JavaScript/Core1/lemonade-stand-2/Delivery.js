class Delivery extends eVENT {
  constructor({occTime, delay, receiver, deliveredItems}={}) {
    super({occTime, delay});
    this.receiver = receiver;
    this.deliveredItems = deliveredItems;
  }
  onEvent() {
    const followupEvents=[],
          recv = this.receiver,
          delItems = this.deliveredItems;
    // add delivered items to inventory
    for (const itemName of Object.keys( delItems)) {
      // exclude special "cost" field from map processing
      if (itemName === "cost") continue;
      const item = sim.namedObjects.get( itemName);
      item.stockQuantity += delItems[itemName] * item.quantityPerSupplyUnit;
      item.outstandingOrder = false;
    }
    // paying for the delivered items results in decrementing the liquidity
    recv.liquidity -= delItems.cost;
    // update costing
    sim.stat.dailyCosts += delItems.cost;
    sim.stat.totalCosts += delItems.cost;
    return followupEvents;
  }
}
Delivery.labels = {"className":"Del", "deliveredItems":"items"};
