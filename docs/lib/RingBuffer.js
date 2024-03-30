class RingBuffer extends Array {
  constructor({size=10, itemType} = {}) {
    // spread the array (of arrays) to a list of arguments as required for the Array constructor
    super();
    // used for increasing/decreasing the learning matrix probabilities
    this.size = size;
    this.first = 0;  // index of first item
    this.last = -1;  // index of last item
    if (itemType) this.itemType = itemType;
  }
  nmrOfItems() {
    if (this.last === -1) return 0;
    else if (this.first <= this.last) return this.last - this.first + 1;
    else return this.last + this.size - this.first + 1;
  }
  add( item) {
    if (this.nmrOfItems() < this.size) {
      this.last++;  // still filling the buffer
    } else {  // buffer is full, move both pointers
      this.first = (this.first+1) % this.size;
      this.last = (this.last+1) % this.size;
    }
    this[this.last] = item;
  }
  getSecondLast() {
    if (this.last > 0) return this[this.last-1];
    else if (this.nmrOfItems() === 1) return this[this.last];  // there is no second last
    else return this[this.size-1];  // this.last = 0
  }
  getLast() {
    return this[this.last];
  }
  getMovingAverage(n) {
    var N = this.nmrOfItems(), sum=0;
    if (N === 0) return 0;
    if (n) N = Math.min( n, N);
    for (let i=0; i < N; i++) {
      const val = this[(this.first+i) % this.size];
      sum += val;
    }
    return sum / N;
  }
  toString(n) {
    var str="";
    const decimalPlaces = 1,
          N = this.nmrOfItems(),
          outputLen = n ? Math.min( n, N) : N;
    if (N === 0) return " ";
    for (let i=0; i < outputLen; i++) {
      let item = this[(this.first+i) % this.size];
      // serialize enum values as labels
      if (this.itemType instanceof eNUMERATION) item = this.itemType.labels[item-1];
      else if (this.itemType === "Decimal") {
        const roundingFactor = Math.pow( 10, decimalPlaces);
        item = Math.round( item * roundingFactor) / roundingFactor;
      }
      str += item;
      if (i < outputLen-1) str += ", ";
    }
    return str;
  }
}
