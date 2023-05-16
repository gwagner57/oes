class OutputItemType extends ItemType {
  constructor({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity,
                salesPrice, batchSize, bomItems, packagingItemsPerSupplyUnit}) {
    super({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity});
    this.salesPrice = salesPrice;
    this.batchSize = batchSize;
    // Bill of production materials
    this.bomItems = bomItems;
    // Bill of packaging materials
    this.packagingItemsPerSupplyUnit = packagingItemsPerSupplyUnit;
  }
}
OutputItemType.labels = {"className":"OutItem", "stockQuantity":"qty"};
OutputItemType.isAbstract = false;