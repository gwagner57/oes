class InputItemType extends ItemType {
  constructor({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity, purchasePrice}) {
    super({id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity});
    this.purchasePrice = purchasePrice;
  }
}
InputItemType.labels = {"className":"InItem", "stockQuantity":"qty"};
