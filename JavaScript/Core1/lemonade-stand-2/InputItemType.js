class InputItemType extends ItemType {
  constructor({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity,
                purchasePrice, targetInventory, reorderPeriod, reorderPoint, justInTime,
                inventoryCost, transactionCostPerOrder}) {
    super({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity});
    this.purchasePrice = purchasePrice;
    this.targetInventory = targetInventory;
    this.justInTime = justInTime;
    this.inventoryCost = inventoryCost;
    this.transactionCostPerOrder = transactionCostPerOrder;
    if (reorderPeriod) this.reorderPeriod = reorderPeriod;
    if (reorderPoint) this.reorderPoint = reorderPoint;
  }
}
InputItemType.labels = {"className":"InItem", "stockQuantity":"qty"};
