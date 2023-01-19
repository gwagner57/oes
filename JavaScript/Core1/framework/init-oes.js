/**********************************************************************
 *** Create namespace objects and initial objects/maps/arrays *********
 *** (most of them shared by UI thread and worker) ********************
 **********************************************************************/
const sim = Object.create(null); // instead of {}
sim.model = Object.create(null);
sim.model.v = Object.create(null); // map of (global) model variables
sim.model.f = Object.create(null); // map of (global) model functions
sim.model.p = Object.create(null); // map of model parameters
sim.scenario = Object.create(null);
sim.stat = Object.create(null);
sim.scenarios = [];
sim.experimentTypes = [];

sim.config = Object.create(null);
sim.config.ui = Object.create(null);
sim.config.ui.obs = {canvas: Object.create(null), enumAttributes:[]};

const oes = Object.create(null);
oes.defaults = {
  nextMomentDeltaT: 0.01,
  expostStatDecimalPlaces: 2,
  simLogDecimalPlaces: 2,
  imgFolder: "img/"
};

oes.setupInitialStateDataStructures = function () {
  // Add initial objects (possibly changed in UI)
  for (const objTypeName of Object.keys( sim.scenario.initialObjects || {})) {
    const C = sim.Classes[objTypeName];
    const objRecords = sim.scenario.initialObjects[objTypeName];
    C.instances ??= Object.create(null);
    for (const objId of Object.keys( objRecords)) {
      C.instances[objId] = new C( objRecords[objId]);
    }
  }
  // Set up initial state
  if (sim.scenario.setupInitialState) sim.scenario.setupInitialState();
  // create populations per class
  for (const o of sim.objects.values()) {
    const className = o.constructor.name;
    if (className in sim.Classes) {
      sim.Classes[className].instances ??= Object.create(null);
      sim.Classes[className].instances[o.id] = o;
    }
  }
}

