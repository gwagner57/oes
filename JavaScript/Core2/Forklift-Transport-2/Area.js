class Area extends oBJECT {
  constructor({ id, name}) {
    super( id, name);
    this.productBuffer = new ProductBuffer();
  }
  toString() {
    const t1 = this.productBuffer.filter( p => p.type===1).length,
        t2 = this.productBuffer.filter( p => p.type===2).length,
        t3 = this.productBuffer.filter( p => p.type===3).length;
    return `${this.name}: ${t1}/${t2}/${t3}`;
  }
}
