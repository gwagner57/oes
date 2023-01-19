class SingleProductCompany extends oBJECT {
  constructor({ id, name, productType, liquidity, fixedCostPerDay }) {
    super( id, name);
    if (typeof productType === "object") this.productType = productType;
    else if (typeof productType === "string") {
      const o = sim.namedObjects.get(productType);
      this.productType = o ? o : productType;
    } else if (Number.isInteger( productType)) {
      const o = sim.objects.get( productType);
      this.productType = o ? o : productType;
    }
    this.liquidity = liquidity;
    this.fixedCostPerDay = fixedCostPerDay;  // Includes labor cost and facilities cost
    this.dailyProfit = 0;  // for visualization
  }
  getDemandForecast() {
    // forecast weather state and temperature for the demand period
    function forecastWeather() {
      var forecastState = 0, forecastTemp = 0;
      const r = rand.uniformInt(0, 99),
          // the temperature from yesterday
          temperature = this.temperature.getSecondLast();
      // make forecasts based on yesterday's weather state
    }
    var demandForecast=0;
    const demandHistory = this.productType.productCategory.market.dailyDemandQuantity;  // a ring buffer
    if (demandHistory.nmrOfItems() === 0) {  // buffer still empty
      demandForecast = DailyDemand.quantity();
    } else  {  //TODO: Simple Exponential Smoothing (SES)
      demandForecast = Math.ceil( demandHistory.getMovingAverage(3));
    }
    return demandForecast;
  }
  computeProductBatchCost() {  // "bom" maps input item names to quantities
    const bom = this.productType.bomItems;
    var cost=0;
    for (const inpItemName of Object.keys( bom)) {
      const inpItem = sim.namedObjects.get( inpItemName);
      cost += Math.ceil( bom[inpItemName] / inpItem.quantityPerSupplyUnit) * inpItem.purchasePrice;
    }
    return cost;
  }
  /******************************************************************
   Plan production quantity in number of batches (e.g. pitchers)
   First compute the production quantity based on demand forecast. Then check,
   if the liquidity is sufficient for purchasing the required materials.
   Otherwise, compute the production quantity based on available liquidity.
   ******************************************************************/
  planProdQtyAndJustInTimeOrder( demandForecast) {
    const bom = this.productType.bomItems;
    // compute planned production quantity based on demand forecast
    let planProdQty = Math.ceil( demandForecast * this.productType.quantityPerSupplyUnit /
                      this.productType.batchSize);
    function computeJustInTimeOrder( prodType, planProdQty) {
      const bom = prodType.bomItems,
            packBom = prodType.packagingItemsPerSupplyUnit;
      var justInTimeOrder={}, replenCost=0;
      // compute order quantities for just-in-time input items
      for (const itemName of Object.keys( bom)) {
        const item = sim.namedObjects.get( itemName);
        if (item.justInTime) {
          const requiredQty = planProdQty * bom[itemName],
                orderQty = Math.max( requiredQty - item.stockQuantity, 0);
          // order quantities in supply units
          justInTimeOrder[itemName] = Math.ceil( orderQty / item.quantityPerSupplyUnit);
          replenCost += justInTimeOrder[itemName] * item.purchasePrice;
        }
      }
      // compute just-in-time order quantities for packaging materials
      for (const itemName of Object.keys( packBom)) {
        const item = sim.namedObjects.get( itemName);
        if (item.justInTime) {
          const requiredQty = (planProdQty * prodType.batchSize) / prodType.quantityPerSupplyUnit * packBom[itemName],
                orderQty = Math.max( requiredQty - item.stockQuantity, 0);
          // order quantities in supply units
          justInTimeOrder[itemName] = Math.ceil( orderQty / item.quantityPerSupplyUnit);
          replenCost += justInTimeOrder[itemName] * item.purchasePrice;
        }
      }
      justInTimeOrder.cost = replenCost;
      return justInTimeOrder;
    }
    // decrease planProdQty if required by inventory levels
    for (const inpItemName of Object.keys( bom)) {
      const inpItem = sim.namedObjects.get( inpItemName),
            requiredQty = planProdQty * bom[inpItemName];
      if (!inpItem.justInTime && requiredQty > inpItem.stockQuantity) {
        planProdQty = Math.ceil( inpItem.stockQuantity / bom[inpItemName]);
      }
    }
    // compute replenishment order quantities and cost
    let justInTimeOrder = computeJustInTimeOrder( this.productType, planProdQty);
    // decrease planProdQty if required by budget constraints
    if (justInTimeOrder.cost > this.liquidity) {
      const batchCost = this.computeProductBatchCost();
      planProdQty = Math.floor( this.liquidity / batchCost);
      justInTimeOrder = computeJustInTimeOrder( this.productType, planProdQty);
    }
    return {planProdQty, justInTimeOrder};
  }
  planSalesPrice( demandForecast) {
    const expectedProfitRate = 0.5;
    const batchVariableCosts = this.computeProductBatchCost();
    const supplyUnitVariableCosts = batchVariableCosts / this.productType.batchSize *
        this.productType.quantityPerSupplyUnit;
    const supplyUnitCosts = supplyUnitVariableCosts +
        this.fixedCostPerDay / demandForecast;
    const price = supplyUnitCosts * (1 + expectedProfitRate);
    this.productType.salesPrice = Math.ceil( 10 * price) / 10;
  }
  performProduction( planProdQty) {
    const prodType = this.productType,
          bom = prodType.bomItems;
    // subtract production inputs from inventory
    for (const itemName of Object.keys( bom)) {
      const item = sim.namedObjects.get( itemName);
      item.stockQuantity -= bom[itemName] * planProdQty;
    }
    // put production output to inventory
    prodType.stockQuantity = planProdQty * prodType.batchSize;
  }
}
SingleProductCompany.labels = {"className":"SPC", "liquidity":"liq"};
