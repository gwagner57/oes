/**
 * An intermediate supply chain node is a non-top node that
 * receives orders from as well as sells to downstream nodes.
 */
class IntermediateSupplyChainNode extends NonTopSupplyChainNode {
  constructor({ id, name, downStreamNode, upStreamNode,
                stockQuantity, safetyStock=3, backorderQuantity=0}) {
    super({id, name, upStreamNode, stockQuantity, safetyStock, backorderQuantity});
    // object reference or ID
    this.downStreamNode = typeof downStreamNode === "object" ?
        downStreamNode : sim.objects[downStreamNode];
  }
}
IntermediateSupplyChainNode.labels = {className:"Node",
    stockQuantity:"inv", backorderQuantity:"back", accumulatedInventoryCosts:"costs"};