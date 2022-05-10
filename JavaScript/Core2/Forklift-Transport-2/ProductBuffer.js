class ProductBuffer extends Array {
  constructor( size=Infinity) {
    // spread the array (of arrays) to a list of arguments as required for the Array constructor
    super();
    this.size = size;
  }
  addProduct( product) {
    if (this.length < this.size) {
      this.push( product);
      return true;
    } else {  // buffer is full
      return false;
    }
  }
  getUnassignedProductByType( types) {
    var product=null;
    for (let i=0; i < this.length; i++) {
      if (this[i].isAssigned) continue;
      if (types.includes(this[i].type)) product = this[i];
    }
    return product;
  }
  removeProduct( p) {
    const index = this.indexOf( p);
    // discard from buffer
    if (index >= 0)  this.splice( index, 1);
    else console.error(`Product ${p.id} with arrival time ${p.arrivalTime} not found in buffer!`)
  }
  toString() {
    return JSON.stringify( this);
  }
}
