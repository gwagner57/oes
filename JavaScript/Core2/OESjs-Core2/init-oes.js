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
sim.scenarios = [];
sim.stat = Object.create(null);
sim.config = Object.create(null);
sim.experimentTypes = [];

const oes = Object.create(null);
oes.defaults = {
  nextMomentDeltaT: 0.01,
  expostStatDecimalPlaces: 2,
  simLogDecimalPlaces: 2,
  timeSeriesCompressionRate: 1  // number of array values to be compressed into one value
};
