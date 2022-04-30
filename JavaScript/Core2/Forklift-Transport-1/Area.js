class Area extends oBJECT {
  constructor({ id, name}) {
    super( id, name);
    this.productBuffer = new ProductBuffer();
  }
  toString() {
    return `${this.name}: ${this.productBuffer.length}`;
  }
}
Area.labels = {"className":"A", "productBuffer":"buf"};