class SingleProductShop extends oBJECT {
  constructor({ id, name, quantityInStock, reorderLevel, targetInventory, reorderInterval}) {
    super( id, name);
    this.quantityInStock = quantityInStock;
    this.reorderLevel = reorderLevel;  // for continuous review policy
    this.targetInventory = targetInventory;
    this.reorderInterval = reorderInterval;  // for periodic review policy
  }
}
SingleProductShop.labels = {"quantityInStock":"stock"};

