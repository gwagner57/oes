// load general framework code
self.importScripts("../lib/EventList.js", "../lib/math.js",
    "../framework/OES-Foundation.js", "../framework/simulator.js");
// load simulation-example-specific code
self.importScripts("simulation.js");
if (sim.model.objectTypes) {
  sim.model.objectTypes.forEach( function (objT) {
    self.importScripts( objT + ".js");
  });
}
if (sim.model.eventTypes) {
  sim.model.eventTypes.forEach( function (evtT) {
    self.importScripts( evtT + ".js");
  });
}
// start simulation on message from main thread
onmessage = function (e) {
  if (!sim.experimentType) {
    // run simulation
    sim.runStandaloneScenario();
    // send statistics to main thread
    self.postMessage({statistics: sim.stat, endTime: sim.endTime});
  } else {
    // run simulation experiment
    sim.runSimpleExperiment( sim.experimentType);
  }
};