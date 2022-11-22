class OutputItemType extends ItemType {
  constructor({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity, productCategory,
                salesPrice, batchSize, bomItems, packItemsPerSupplyUnit}) {
    super({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity, productCategory});
    this.salesPrice = salesPrice;
    this.batchSize = batchSize;
    // Bill of materials per production batch
    this.bomItems = bomItems;
    // Bill of packaging materials
    this.packagingItemsPerSupplyUnit = packItemsPerSupplyUnit;
  }
}
OutputItemType.labels = {"className":"OutItem", "salesPrice":"price", "stockQuantity":"qty"};
