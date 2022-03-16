class SingleProductCompany extends oBJECT {
  constructor({ id, name, productType, inputInventoryItemTypes, liquidity, fixedCostPerDay }) {
    super( id, name);
    this.productType = typeof productType === "object" ?
        productType : sim.objects.get( productType);
    // a map of itemTypeName keys to quantity values like {"Lemon":5, ...}
    this.inputInventoryItemTypes = inputInventoryItemTypes;
    this.liquidity = liquidity;
    this.fixedCostPerDay = fixedCostPerDay;  // Includes labor cost and facilities cost
    //*** statistics variables ***
    this.dailyDemandQuantity = new RingBuffer();
    this.dailyRevenue = new RingBuffer();
    this.dailyCosts = 0;
    this.dailyProfit = new RingBuffer();
  }
  getDemandForecast() {
    var sum=0, demandForecast=0;
    const demandHistory = this.dailyDemandQuantity,  // a ring buffer
          N = demandHistory.nmrOfItems();
    if (N < 3) {  // buffer still too empty
      demandForecast = DailyDemand.quantity();
    } else  {  // Simple Exponential Smoothing (SES) with simple moving average
      for (let i=0; i < N; i++) {
        const val = demandHistory[(demandHistory.first+i) % demandHistory.size];
        sum += val;
      }
      demandForecast = Math.ceil( sum / N);
    }
    return demandForecast;
  }
  computeBatchCost( bom) {  // "bom" maps input item IDs/names to qauntities
    var cost=0;
    for (const inpItemName of Object.keys( bom)) {
      const inpItem = sim.namedObjects.get( inpItemName);
      cost += Math.ceil( bom[inpItemName] / inpItem.quantityPerSupplyUnit) * inpItem.purchasePrice;
    }
    return cost;
  }
  computeReplenishmentOrder( planProdQty) {
    var inpInvItems = this.inputInventoryItemTypes,
        bom = this.productType.bomItemsPerBatch,
        replenOrder={}, replenCost=0;
    // compute replenishment order quantities
    for (const inpItemName of Object.keys( bom)) {
      const inpItem = sim.namedObjects.get( inpItemName),
            requiredQty = planProdQty * bom[inpItemName],
            orderQty = Math.max( requiredQty - inpInvItems[inpItemName], 0);
      replenOrder[inpItemName] = Math.ceil( orderQty / inpItem.quantityPerSupplyUnit);
      replenCost += replenOrder[inpItemName] * inpItem.purchasePrice;
    }
    replenOrder.cost = replenCost;
    return replenOrder;
  }
  // plan production quantity in number of batches (e.g. pitchers)
  planProductionQuantityAndReplenishmentOrder( demandForecast) {
    // in number of batches (e.g. pitchers)
    let planProdQty = Math.ceil( demandForecast * this.productType.quantityPerSupplyUnit /
            this.productType.batchSize);
    // compute replenishment order quantities and cost
    let replenOrder = this.computeReplenishmentOrder( planProdQty);
    // decrease planProdQty if required by budget constraints
    if (replenOrder.cost > this.liquidity) {
      const batchCost = this.computeBatchCost( this.productType.bomItemsPerBatch);
      planProdQty = Math.floor( this.liquidity / batchCost);
      replenOrder = this.computeReplenishmentOrder( planProdQty);
    }
    this.productType.plannedProductionQuantity = planProdQty;
    return replenOrder;
  }
  planSalesPrice( demandForecast) {
    const expectedProfitRate = 0.1;
    const batchVariableCosts = this.computeBatchCost( this.productType.bomItemsPerBatch);
    const supplyUnitVariableCosts = batchVariableCosts / this.productType.batchSize *
        this.productType.quantityPerSupplyUnit;
    const supplyUnitCosts = supplyUnitVariableCosts +
        this.fixedCostPerDay / demandForecast;
    const price = supplyUnitCosts * (1 + expectedProfitRate);
    this.productType.salesPrice = Math.round( 100 * price) / 100;
  }
  performProduction() {
    const prodType = this.productType,
          bom = prodType.bomItemsPerBatch,
          planProdQty = prodType.plannedProductionQuantity,
          inpInvItems = this.inputInventoryItemTypes;
    // subtract inputs from inventory
    for (const itemId of Object.keys( bom)) {
      const qty = inpInvItems[itemId] - bom[itemId] * planProdQty;
      // round to 2 decimal places
      inpInvItems[itemId] = Math.round( 100 * qty) / 100;
    }
    // add product output to inventory
    prodType.stockQuantity = planProdQty * prodType.batchSize;
  }
}
SingleProductCompany.labels = {"liquidity":"liq"};
