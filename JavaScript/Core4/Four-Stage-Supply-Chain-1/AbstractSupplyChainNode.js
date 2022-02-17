/**
 * An abstract supply chain node receives orders from as well as sells
 * to a downstream node or end customer.
 * This applies to all nodes of a supply chain, except the end customer.
 */
class AbstractSupplyChainNode extends aGENT {
  constructor({ id, name, stockQuantity, safetyStock=3, backorderQuantity=0}) {
    super({id, name});
    if (stockQuantity !== undefined) this.stockQuantity = stockQuantity;
    // extra inventory beyond the expected lead time demand
    if (safetyStock !== undefined) this.safetyStock = safetyStock;
    // orders of previous cycles that aren't fulfilled yet
    if (backorderQuantity !== undefined) this.backorderQuantity = backorderQuantity;
    // the quantity ordered last time by the downstream customer from this node
    this.lastSalesOrderQuantity = 0;
    // the accumulated inventory costs of this node
    this.accumulatedInventoryCosts = 0;
  }
  onReceiveOrder( quantity) {
    // store order quantity for later processing
    this.lastSalesOrderQuantity = quantity;
  }
  // not used by TopSupplyChainNode
  onPerceive( percept) {
    switch (percept.type) {
      case "InDelivery":
        this.stockQuantity += percept.quantity;
        break;
    }
  }
  // overwritten by TopSupplyChainNode
  onTimeEvent( e) {
    switch (e.type) {
      case "EndOfWeek":
        /********************************************************
         *** ship items to downstream node or end customer ******
         ********************************************************/
        const stockQuantityAtStartOfWeek = this.stockQuantity;
        let deliveryQuantity = 0, stockoutCosts = 0;
        if (this.stockQuantity < this.lastSalesOrderQuantity + this.backorderQuantity) {
          // not enough stock quantity for fulfilling the sum of order and backorder quantity
          deliveryQuantity = this.stockQuantity;
          if (this.lastSalesOrderQuantity > this.stockQuantity) {
            const newBackorderQuantity = this.lastSalesOrderQuantity - this.stockQuantity;
            stockoutCosts = newBackorderQuantity * sim.model.p.stockoutCostsPerUnit;
            // increment backorder quantity
            this.backorderQuantity += newBackorderQuantity;
          } else if (this.stockQuantity > this.lastSalesOrderQuantity) {
            // decrement backorder quantity
            this.backorderQuantity -= this.stockQuantity - this.lastSalesOrderQuantity;
          }
          // stock quantity is reset to zero
          this.stockQuantity = 0;
        } else {  // enough stock quantity for fulfilling the sum of order and backorder quantity
          deliveryQuantity = this.lastSalesOrderQuantity + this.backorderQuantity;
          // decrement stock quantity
          this.stockQuantity -= deliveryQuantity;
          // backorder quantity is reset to zero
          this.backorderQuantity = 0;
        }
        // only ship non-zero quantities
        if (deliveryQuantity > 0) {
          sim.schedule( new ShipItems({quantity: deliveryQuantity, performer: this}));
        }
        /***********************************************
         *** Send purchase order to upstream node ******
         ***********************************************/
        let orderQuantity = 0;
        // Try to keep the inventory as big as the latest order received by this node (plus a bit extra quantity)
        if (this.stockQuantity > 0) {
          orderQuantity = Math.max( this.lastSalesOrderQuantity -
              this.stockQuantity + this.safetyStock, 0);
        } else {
          orderQuantity = this.lastSalesOrderQuantity + this.safetyStock;
        }
        //TODO: DELETE this.lastPuchaseOrderQuantity = orderQuantity;
        // only place orders with values greater than zero
        if (orderQuantity > 0) {
          sim.schedule( new PurchaseOrder({ quantity: orderQuantity,
            sender: this, receiver: this.upStreamNode}));
        }
        /***********************************************
         *** Calculate inventory costs *****************
         ***********************************************/
            // the average inventory is the stock quantity at the beginning of the week plus the stock quantity
            // at the end of the week divided by two
        const averageStockQuantity = (stockQuantityAtStartOfWeek + this.stockQuantity) / 2,
            totalHoldingCostsPerWeek = averageStockQuantity * sim.model.p.holdingCostsPerUnitPerWeek;
        this.accumulatedInventoryCosts = totalHoldingCostsPerWeek + stockoutCosts;
        break;
    }
  }
}
