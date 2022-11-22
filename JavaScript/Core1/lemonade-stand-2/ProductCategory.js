class ProductCategory extends oBJECT {
  constructor({ id, name, market}) {
    super( id, name);
    this.market = market;  // references a DailyDemandMarket
  }
}
