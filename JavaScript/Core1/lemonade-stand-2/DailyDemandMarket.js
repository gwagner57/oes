/*
 An abstract class
 */
class DailyDemandMarket extends oBJECT {
  constructor({ id, name}) {
    super( id, name);
  }
  // abstract method
  getDailyDemandQuantity() {return 0;}
}
