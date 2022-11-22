class ItemType extends oBJECT {
  constructor({ id, name, quantityUnit, supplyUnit, quantityPerSupplyUnit, stockQuantity,
                expirationTimeSpan, productCategory}) {
    super( id, name);
    this.quantityUnit = quantityUnit;  // string
    this.supplyUnit = supplyUnit;  // string
    this.quantityPerSupplyUnit = quantityPerSupplyUnit;  // Decimal
    this.stockQuantity = stockQuantity;  // Number
    if (expirationTimeSpan) this.expirationTimeSpan = expirationTimeSpan;  // for perishable items (in days)
    // while the item type name may be vendor-specific, productCategory provides a common name
    if (productCategory) this.productCategory = productCategory;  // reference to a ProductCategory
  }
}
