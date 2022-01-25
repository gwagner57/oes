/**
 * A top supply chain node receives orders from as well as sells to downstream nodes.
 */
class TopSupplyChainNode extends AbstractSupplyChainNode {
  constructor({ id, name, downStreamNode}) {
    super({id, name, downStreamNode});
    // object reference or ID
    this.downStreamNode = typeof downStreamNode === "object" ?
        downStreamNode : sim.objects[downStreamNode];
  }
  onTimeEvent( e) {
    switch (e.type) {
    case "EndOfWeek":
      /***********************************************
       *** make shipment to downstream node **********
       ***********************************************/
      const deliveryQuantity = this.lastSalesOrderQuantity;
      if (deliveryQuantity > 0) {
        // the delay accounts for the production lag
        sim.schedule( new ShipItems({quantity: deliveryQuantity, performer: this}));
      }
      break;
    }
  }
}
