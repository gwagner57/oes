class DailyDemand extends eVENT {
  constructor({occTime, delay, quantity, shop}) {
    super({occTime, delay});
    this.quantity = quantity;
    this.shop = shop;
  }
  onEvent() {
    var q = this.quantity,
        prevStockLevel = this.shop.stockQuantity;
    // update lostSales if demand quantity greater than stock level
    if (q > prevStockLevel) {
      // increment the stock-out counter by 1
      sim.stat.nmrOfStockOuts++;
      // increment the "lostSales" statistics variable by the missing quantity
      sim.stat.lostSales += q - prevStockLevel;
    }
    // update stockQuantity
    this.shop.stockQuantity = Math.max( prevStockLevel-q, 0);
    switch (sim.model.p.reviewPolicy) {
    case "continuous":
      // schedule Delivery if stock level falls below reorder level
      if (prevStockLevel > this.shop.reorderPoint &&
          prevStockLevel - q <= this.shop.reorderPoint) {
        return [new Delivery({
          delay: Delivery.leadTime(),
          quantity: this.shop.targetInventory - this.shop.stockQuantity,
          receiver: this.shop
        })];
      } else return [];  // no follow-up events
    case "periodic":
      // periodically schedule new Delivery events
      if (sim.time % this.shop.reorderInterval === 0) {
        return [new Delivery({
          delay: Delivery.leadTime(),
          quantity: this.shop.targetInventory - this.shop.stockQuantity,
          receiver: this.shop
        })];
      } else return [];  // no follow-up events
    }
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

