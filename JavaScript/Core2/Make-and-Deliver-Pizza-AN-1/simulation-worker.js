"use strict";
// load general framework code
self.importScripts("../lib/seedrandom.min.js", "../lib/rand.js", "../lib/util.js",
    "../lib/math.js", "../lib/idb5.js", "../lib/EventList.js", "../lib/eNUMERATION.js");
self.importScripts("../OESjs-Core2/OES-Foundation.js", "../OESjs-Core2/OES-Activities.js",
    "../OESjs-Core2/simulator.js");
/*
self.importScripts("../lib/library-files.js");
self.importScripts("../OESjs-Core2/core2-oes.js");
*/
// load simulation-example-specific code
self.importScripts("simulation.js");
if (sim.model.objectTypes) {
  for (const objT of sim.model.objectTypes) {
    self.importScripts( objT + ".js");
  }
}
if (sim.model.eventTypes) {
  for (const evtT of sim.model.eventTypes) {
    self.importScripts( evtT + ".js");
  }
}
if (sim.model.activityTypes) {
  for (const actT of sim.model.activityTypes) {
    self.importScripts( actT + ".js");
  }
}
// start simulation on message from main thread
onmessage = function (e) {
  var scenario={};
  sim.loadEndTime = (new Date()).getTime();
  if (sim.experimentType) {
    // when experimentType has been set, run it
    sim.runExperiment( sim.experimentType);
  } else if (e.data.simToRun) {
    // assign alternative scenario, if selected
    if (e.data.scenarioNo !== undefined && sim.scenarios[e.data.scenarioNo]) {
      scenario = sim.scenarios[e.data.scenarioNo];
      // copy simulation end time from base scenario if not provided
      if (!scenario.durationInSimTime && !scenario.durationInSimSteps && !scenario.durationInCpuTime) {
        if (sim.scenario.durationInSimTime) {
          scenario.durationInSimTime = sim.scenario.durationInSimTime;
        } else if (sim.scenario.durationInSimSteps) {
          scenario.durationInSimSteps = sim.scenario.durationInSimSteps;
        } else if (sim.scenario.durationInCpuTime) {
          scenario.durationInCpuTime = sim.scenario.durationInCpuTime;
        }
      }
      sim.scenario = scenario;
    }
    if (e.data.simToRun === "0") {
      sim.runStandaloneScenario( e.data.createLog);
    } else {
      let expNo = parseInt( e.data.simToRun) - 1;
      sim.experimentType = sim.experimentTypes[expNo];
      sim.experimentType.storeExpResults = e.data.storeExpRes;
      sim.runExperiment();
    }
  }
};