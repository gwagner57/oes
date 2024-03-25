/**
 * A top supply chain node receives orders from as well as sells to downstream nodes.
 */
class TopSupplyChainNode extends AbstractSupplyChainNode {
  constructor({ id, name, downStreamNode}) {
    super({id, name, downStreamNode});
    // object reference or ID
    this.downStreamNode = typeof downStreamNode === "object" ?
        downStreamNode : sim.objects.get( downStreamNode);
  }
  onTimeEvent( timeEvt) {
    switch (timeEvt.constructor.name) {
    case "EndOfWeek":
      /***********************************************
       *** make shipment to downstream node **********
       ***********************************************/
      // deliver all that has been ordered
      const deliveryQuantity = this.lastSalesOrderQuantity;
      if (deliveryQuantity > 0) {
        this.perform( new ShipItems({quantity: deliveryQuantity, performer: this}));
        this.lastSalesOrderQuantity = 0;
      }
      break;
    }
  }
}
