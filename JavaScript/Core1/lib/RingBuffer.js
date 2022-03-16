class RingBuffer extends Array {
  constructor( size=5) {
    // spread the array (of arrays) to a list of arguments as required for the Array constructor
    super();
    // used for increasing/decreasing the learning matrix probabilities
    this.size = size;
    this.first = 0;  // index of first item
    this.last = -1;  // index of last item
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
  getLast() {
    return this[this.last];
  }
  getMovingAverage(n) {
    var N = this.nmrOfItems(), sum=0;
    if (n) N = Math.min( n, N);
    for (let i=0; i < N; i++) {
      const val = this[(this.first+i) % this.size];
      sum += val;
    }
    return sum / N;
  }
  toString(n) {
    var roundingFactor = 1, str = "[", item, i=0;
    const N = this.nmrOfItems(),
          outputLen = n ? Math.min( n, N) : N;
    if (N === 0) return " ";
    for (i=0; i < outputLen; i++) {
      item = this[(this.first+i) % this.size];
      // serialize enum values as labels
      if (this.itemType instanceof eNUMERATION) item = this.itemType.labels[item-1];
      else if (cLASS.isDecimalType( this.itemType)) {
        //decimalPlaces:
        roundingFactor = Math.pow( 10, this.decimalPlaces);
        item = Math.round( item * roundingFactor) / roundingFactor;
      }
      str += item;
      if (i < outputLen-1) str += ", ";
    }
    return str + "]";
  }
}
