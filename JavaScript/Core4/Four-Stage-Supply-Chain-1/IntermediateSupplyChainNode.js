/**
 * An intermediate supply chain node is a non-top node that
 * receives orders from as well as sells to downstream nodes.
 */
class IntermediateSupplyChainNode extends AbstractSupplyChainNode {
  constructor({ id, name, stockQuantity, safetyStock, backorderQuantity,
                downStreamNode, upStreamNode}) {
    super({id, name, stockQuantity, safetyStock, backorderQuantity});
    if (upStreamNode) {
      // object reference or ID
      this.upStreamNode = typeof upStreamNode === "object" ?
          upStreamNode : sim.objects.get( upStreamNode);
    }
    // object reference or ID
    this.downStreamNode = typeof downStreamNode === "object" ?
        downStreamNode : sim.objects.get( downStreamNode);
  }
}
IntermediateSupplyChainNode.labels = {className:"Node",
    stockQuantity:"inv", backorderQuantity:"back", accumulatedInventoryCosts:"costs"};