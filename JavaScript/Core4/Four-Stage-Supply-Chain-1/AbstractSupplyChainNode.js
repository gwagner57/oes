/**
 * An abstract supply chain node receives orders from as well as sells
 * to a downstream node or end customer.
 * This applies to all nodes of a supply chain, except the end customer.
 */
class AbstractSupplyChainNode extends aGENT {
  constructor({ id, name}) {
    super({id, name});
    // the quantity ordered last time by the downstream customer from this node
    this.lastSalesOrderQuantity = 0;
  }
  onReceiveOrder( quantity) {
    this.lastSalesOrderQuantity = quantity;
  }
}
