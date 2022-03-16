class ItemType extends oBJECT {
  constructor({ id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity}) {
    super( id, name);
    this.quantityUnit = quantityUnit;  // string
    this.supplyUnit = supplyUnit;  // string
    this.quantityPerSupplyUnit = quantityPerSupplyUnit;  // Decimal
    this.stockQuantity = stockQuantity;  // Number
  }
}
