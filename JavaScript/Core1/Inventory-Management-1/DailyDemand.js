class DailyDemand extends eVENT {
  constructor({occTime, delay, quantity, shop}) {
    super({occTime, delay});
    this.quantity = quantity;
    this.shop = shop;
  }
  onEvent() {
    const followupEvents=[];
    const demQty = this.quantity,
          stockQty = this.shop.stockQuantity,
          salesQty = Math.min( demQty, stockQty);
    // update lostSales if demand quantity greater than stock level
    if (demQty > stockQty) {
      // increment the stock-out counter by 1
      sim.stat.nmrOfStockOuts++;
      // increment the "lostSales" statistics variable by the missing quantity
      sim.stat.lostSales += demQty - stockQty;
    }
    sim.stat.totalSales += salesQty;
    // update stockQuantity
    this.shop.stockQuantity = stockQty - salesQty;
    // create potential new Delivery event
    const newDelEvt = new Delivery({
      delay: Delivery.leadTime(),
      quantity: this.shop.targetInventory - this.shop.stockQuantity,
      receiver: this.shop
    });
    switch (sim.model.p.reviewPolicy) {
    case "continuous":
      // schedule Delivery if stock level falls below reorder level
      if (stockQty > this.shop.reorderPoint &&
          this.shop.stockQuantity <= this.shop.reorderPoint) {
        followupEvents.push( newDelEvt);
      } else return [];  // no follow-up events
    case "periodic":
      // periodically schedule new Delivery events
      if (sim.time % this.shop.reorderInterval === 0) {
        followupEvents.push( newDelEvt);
      }
    }
    return followupEvents;
  }
  static quantity() {
    return rand.uniformInt( 5, 30);
  }
  static recurrence() {
    return 1;  // each day
  }
  createNextEvent() {
    return new DailyDemand({
      delay: DailyDemand.recurrence(),
      quantity: DailyDemand.quantity(),
      shop: this.shop
    });
  }
}
DailyDemand.labels = {"quantity":"quant"};

