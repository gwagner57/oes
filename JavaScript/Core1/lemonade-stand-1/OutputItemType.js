class OutputItemType extends ItemType {
  constructor({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity,
                salesPrice, batchSize, bomItemsPerBatch}) {
    super({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity});
    this.salesPrice = salesPrice;
    this.batchSize = batchSize;
    this.bomItemsPerBatch = bomItemsPerBatch;  // Bill of materials
    // auxiliary variable
    this.plannedProductionQuantity = 0;  // in number of batches
  }
}