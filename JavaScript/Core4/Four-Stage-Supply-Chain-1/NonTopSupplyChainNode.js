/**
 * A non-top supply chain node orders and purchases from upstream nodes,
 * and maintains an inventory.
 */
class NonTopSupplyChainNode extends AbstractSupplyChainNode {
  constructor({ id, name, upStreamNode, stockQuantity,
                safetyStock=3, backorderQuantity=0}) {
    super({id, name});
    this.stockQuantity = stockQuantity;
    // extra inventory beyond the expected lead time demand
    this.safetyStock = safetyStock;
    // orders of previous cycles that aren't fulfilled yet
    this.backorderQuantity = backorderQuantity;
    if (upStreamNode) {
      // object reference or ID
      this.upStreamNode = typeof upStreamNode === "object" ?
          upStreamNode : sim.objects[upStreamNode];
    }
    // the accumulated inventory costs of this node
    this.accumulatedInventoryCosts = 0;
  }
  onPerceive( percept) {
    switch (percept.type) {
    case "InDelivery":
      this.stockQuantity += percept.quantity;
      break;
    }
  }
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
NonTopSupplyChainNode.labels = {className:"Node", stockQuantity:"inv",
    backorderQuantity:"back", accumulatedInventoryCosts:"costs"};