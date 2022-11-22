class StartOfDay extends eVENT {
  constructor({occTime, delay, company} = {}) {
    super({occTime, delay});
    this.company = typeof company === "object" ?
        company : sim.objects.get( company);
  }
  onEvent( slots) { // slots possibly provided by UI
    const followupEvents=[],
          prodType = this.company.productType,
          inpInvItems = Object.keys( prodType.bomItems),
          packItems = Object.keys( prodType.packagingItemsPerSupplyUnit),
          invItems = [...inpInvItems, ...packItems],
          dayNo = Math.ceil( sim.time / 24),
          market = prodType.productCategory.market,
          // update weather and get dailyDemandQuantity
          dailyDemandQuantity = market.getDailyDemandQuantity();
    let planProdQty=0, justInTimeOrder={};
    // reset daily statistics
    sim.stat.dailyCosts = 0;
    sim.stat.dailyRevenue = 0;
    sim.stat.dailyProfit = 0;
    // forecast today's demand
    const dailyDemandForecast = this.company.getDemandForecast();
    // production planning and just-in-time orders
    if (slots && slots.planProdQty) {  // provided by UI
      planProdQty = slots.planProdQty;
    } else {
      // compute today's production quantity and just-in-time order
      const rec = this.company.planProdQtyAndJustInTimeOrder( dailyDemandForecast);
      planProdQty = rec.planProdQty;
      justInTimeOrder = rec.justInTimeOrder;
    }
    // sales price planning
    if (slots && slots.planSalesPrice) {  // provided by UI
      prodType.salesPrice = slots.planSalesPrice;
    } else {
      this.company.planSalesPrice( dailyDemandForecast);
    }
    // create just-in-time delivery
    followupEvents.push( new Delivery({
      delay: 2,  // 2 hours later (at 10 am)
      receiver: this.company,
      deliveredItems: justInTimeOrder
    }));
    // create replenishment deliveries based on inventory
    for (const itemName of invItems) {
      let delivItems={};
      const invItem = sim.namedObjects.get( itemName);
      if (invItem.justInTime) continue;
      if (invItem.reorderPeriod && dayNo % invItem.reorderPeriod === 0 ||
          invItem.reorderPoint && !invItem.outstandingOrder &&
          invItem.stockQuantity <= invItem.reorderPoint) {
        // compute order quantity (in supply units)
        const oq = (invItem.targetInventory - invItem.stockQuantity) / invItem.quantityPerSupplyUnit,
              leadTime = typeof invItem.leadTime === "function" ? invItem.leadTime() : 0;  // in days
        delivItems[itemName] = Math.ceil( oq);
        delivItems.cost = delivItems[itemName] * invItem.purchasePrice;
        followupEvents.push( new Delivery({
          delay: leadTime * 24 + 6,  // 6 hours later (at 2 pm)
          receiver: this.company,
          deliveredItems: delivItems
        }));
        invItem.outstandingOrder = true;
      }
    }
    // schedule DailyProduction event
    followupEvents.push( new DailyProduction({
      delay: 3,  // at 11 am
      company: this.company,
      quantity: planProdQty
    }));
    followupEvents.push( new DailyDemand({
      delay: 9,  // 9 hours later (at 5 pm)
      company: this.company,
      quantity: dailyDemandQuantity
    }));
    followupEvents.push( new EndOfDay({
      delay: 10,  // 10 hours later
      company: this.company
    }));
    return followupEvents;
  }
  createNextEvent() {
    return new StartOfDay({
      delay: StartOfDay.recurrence(),
      company: this.company
    });
  }}
// Any exogenous event type needs to define a static function "recurrence"
StartOfDay.recurrence = function () {
  return 24;
};
