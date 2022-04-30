class OutputItemType extends ItemType {
  constructor({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity,
                salesPrice, batchSize, bomItemsPerBatch, packItemsPerSupplyUnit}) {
    super({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity});
    this.salesPrice = salesPrice;
    this.batchSize = batchSize;
    // Bill of production materials
    this.bomItemsPerBatch = bomItemsPerBatch;
    // Bill of packaging materials
    this.packagingItemsPerSupplyUnit = packItemsPerSupplyUnit;
    // auxiliary variable
    this.plannedProductionQuantity = 0;  // in number of batches
  }
}
OutputItemType.labels = {"className":"OutItem", "stockQuantity":"qty",
    "plannedProductionQuantity":"planProdQty"};
