/**
 * A bottom supply chain node (such as a retailer) orders and purchases
 * from its upstream node, and maintains an inventory.
 */
class BottomSupplyChainNode extends AbstractSupplyChainNode {
  constructor({ id, name, stockQuantity, safetyStock, backorderQuantity, upStreamNode}) {
    super({id, name, stockQuantity, safetyStock, backorderQuantity});
    if (upStreamNode) {
      // object reference or ID
      this.upStreamNode = typeof upStreamNode === "object" ?
          upStreamNode : sim.objects.get( upStreamNode);
    }
  }
}
BottomSupplyChainNode.labels = {className:"Node", stockQuantity:"inv",
    backorderQuantity:"back", accumulatedInventoryCosts:"costs"};