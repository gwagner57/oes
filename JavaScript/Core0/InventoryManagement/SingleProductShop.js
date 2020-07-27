class SingleProductShop extends oBJECT {
  constructor({ id, name, quantityInStock, reorderLevel, reorderUpToLevel}) {
    super( id, name);
    this.quantityInStock = quantityInStock;
    this.reorderLevel = reorderLevel;
    this.reorderUpToLevel = reorderUpToLevel;
  }
}
SingleProductShop.labels = {"quantityInStock":"stock"};

