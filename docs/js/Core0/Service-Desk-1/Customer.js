class Customer extends oBJECT {
  constructor({ id, arrivalTime}) {
    super( id);
    this.arrivalTime = arrivalTime;
  }
}
Customer.labels = {"arrivalTime":"arrT"};
