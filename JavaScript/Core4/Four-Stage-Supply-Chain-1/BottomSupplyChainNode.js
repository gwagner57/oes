/**
 * A bottom supply chain node orders and purchases from upstream nodes,
 * and maintains an inventory.
 */
class BottomSupplyChainNode extends AbstractSupplyChainNode {
  constructor({ id, name, stockQuantity, safetyStock, backorderQuantity, upStreamNode}) {
    super({id, name, stockQuantity, safetyStock, backorderQuantity});
    if (upStreamNode) {
      // object reference or ID
      this.upStreamNode = typeof upStreamNode === "object" ?
          upStreamNode : sim.objects[upStreamNode];
    }
  }
}
BottomSupplyChainNode.labels = {className:"Node", stockQuantity:"inv",
    backorderQuantity:"back", accumulatedInventoryCosts:"costs"};