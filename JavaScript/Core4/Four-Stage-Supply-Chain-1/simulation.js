/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Four-Stage-Supply-Chain-1";
sim.model.time = "discrete";  // implies using only discrete random variables
sim.model.timeUnit = "D"  // days

sim.model.objectTypes = ["AbstractSupplyChainNode","NonTopSupplyChainNode",
    "IntermediateSupplyChainNode","TopSupplyChainNode"];
sim.model.eventTypes = ["EndOfWeek","EndCustomerDemand","PurchaseOrder",
    "ShipItems","PerceiveInDelivery"];

// the costs for holding one unit in stock per week
sim.model.p.holdingCostsPerUnitPerWeek = 0.5;  // in USD or EUR
// the stockout costs per unit
sim.model.p.stockoutCostsPerUnit = 1;  // in USD or EUR
// extra inventory beyond the expected lead time demand
sim.model.p.safetyStock = 2;

/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 50 * 7;
sim.scenario.description = "Default scenario";
sim.scenario.setupInitialState = function(){
  const retailer = new NonTopSupplyChainNode({id: 1, name:"retailer",
            stockQuantity: 8}),
        distributor = new IntermediateSupplyChainNode({id: 2, name:"distributor",
            downStreamNode: retailer, stockQuantity: 8}),
        wholesaler = new IntermediateSupplyChainNode({id: 3, name:"wholesaler",
            downStreamNode: distributor, stockQuantity: 8}),
        factory = new TopSupplyChainNode({id: 4, name:"factory",
            downStreamNode: wholesaler});
  retailer.upStreamNode = distributor;
  distributor.upStreamNode = wholesaler;
  wholesaler.upStreamNode = factory;
  // Schedule initial events
  sim.schedule( new EndCustomerDemand({occTime: 1}));
  sim.schedule( new EndOfWeek({occTime: 5}));
};

/*******************************************************
 Define Output Statistics Variables
 ********************************************************/
sim.model.setupStatistics = function () {
};

sim.model.computeFinalStatistics = function () {
  sim.stat.retailerCosts = sim.objects.get(1).accumulatedInventoryCosts;
  sim.stat.distributorCosts = sim.objects.get(2).accumulatedInventoryCosts;
  sim.stat.wholesalerCosts = sim.objects.get(3).accumulatedInventoryCosts;

  const tableDef = {name:"scNodes", objectTypeName:"NonTopSupplyChainNode",
      attributes:["stockQuantity","backorderQuantity","accumulatedInventoryCosts"]};
  sim.stat.table = {name: tableDef.name, rows:[]};
  const population = sim.Classes[tableDef.objectTypeName].instances;
  for (const objId of Object.keys( population)) {
    const obj = population[objId], row=[];
    for (const attr of tableDef.attributes) {
      row.push( obj[attr]);
    }
    sim.stat.table.rows.push( row);
  }
};
