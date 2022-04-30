class Product extends oBJECT {
  constructor({ id, name, type, arrivalTime, isAssigned}) {
    super( id, name);
    this.type = type;
    this.arrivalTime = arrivalTime;
    if (isAssigned) this.isAssigned = isAssigned;
  }
}
