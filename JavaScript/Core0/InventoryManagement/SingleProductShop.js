class SingleProductShop extends oBJECT {
  constructor({ id, name, quantityInStock, reorderLevel, targetInventory}) {
    super( id, name);
    this.quantityInStock = quantityInStock;
    this.reorderLevel = reorderLevel;
    this.targetInventory = targetInventory;
  }
}
SingleProductShop.labels = {"quantityInStock":"stock"};

