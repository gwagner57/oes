// load general framework code
self.importScripts("../oes-js-core0/EventList.js", "../oes-js-core0/math.js",
    "../oes-js-core0/OES-Foundation.js", "../oes-js-core0/simulator.js");
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
  if (!sim.experiment) {
    sim.initializeScenarioRun();
    // run simulation
    sim.runScenario();
    // send statistics to main thread
    self.postMessage({statistics: sim.stat, endTime: sim.endTime});
  } else {
    // run simulation experiment
    sim.runExperiment( sim.experiment);
  }
};