class DailyDelivery extends eVENT {
  constructor({occTime, delay, receiver, deliveredItems}={}) {
    super({occTime, delay});
    this.receiver = receiver;
    this.deliveredItems = deliveredItems;
  }
  onEvent() {
    const followupEvents=[],
          recv = this.receiver,
          deliveredItems = this.deliveredItems;
    // add delivered items to inventory
    for (const inpItemId of Object.keys( deliveredItems)) {
      const inpItem = sim.namedObjects.get( inpItemId);
      if (inpItemId !== "cost") {  // exclude special "cost" field from map processing
        const newQ = recv.inputInventoryItemTypes[inpItemId] +
            deliveredItems[inpItemId] * inpItem.quantityPerSupplyUnit;
        // round to 2 decimal places
        recv.inputInventoryItemTypes[inpItemId] = Math.round( 100 * newQ) / 100;
      }
    }
    // pay for delivered items
    recv.liquidity = Math.round( 100 * (recv.liquidity - deliveredItems.cost)) / 100;
    // update costing
    this.receiver.dailyCosts = deliveredItems.cost;
    // perform production
    this.receiver.performProduction();
    followupEvents.push( new DailyDemand({
      delay: 6,  // 6 hours later
      company: this.receiver
    }));
    return followupEvents;
  }
}
