/* Changes from OESjs
- sim.objects is a JS Map
 */

/*******************************************************
 General Variables and Functions
 ********************************************************/
// A map of all simulation objects
sim.objects = new Map();
// The Future Events List
sim.FEL = new EventList();
// The statistics variables map
sim.stat = Object.create(null);

/*******************************************************************
 * Initialize a (standalone or experiment scenario) simulation run *
 *******************************************************************/
sim.initializeScenarioRun = function () {
  sim.step = 0;  // simulation loop step counter
  sim.time = 0;  // simulation time
  // set default endTime
  sim.endTime = sim.scenario?.simEndTime || sim.endTime || Number.MAX_SAFE_INTEGER;
  // get ID counter from simulation scenario, or set to default value
  sim.idCounter = sim.scenario?.idCounter || 1000;
  // set up initial state
  if (sim.scenario.setupInitialState) sim.scenario.setupInitialState();
  if (sim.model.setupStatistics) sim.model.setupStatistics();
};
/*******************************************************
 Advance Simulation Time
 ********************************************************/
sim.advanceSimulationTime = function () {
  sim.nextEvtTime = sim.FEL.getNextOccurrenceTime();  // 0 if there is no next event
  // increment the step counter
  sim.step += 1;
  // advance simulation time
  if (sim.nextEvtTime > 0) sim.time = sim.nextEvtTime;
}
/*******************************************************
 Run a simulation scenario
 ********************************************************/
sim.runScenario = function () {
  // Simulation Loop
  while (sim.time < sim.endTime && !sim.FEL.isEmpty()) {
    // if not executed in a JS worker, create simulation log
    if (typeof WorkerGlobalScope === 'undefined' && simLogTableEl) logSimulationStep( simLogTableEl);
    sim.advanceSimulationTime();
    // extract and process next events
    let nextEvents = sim.FEL.removeNextEvents();
    for (let e of nextEvents) {
      // apply event rule
      let followUpEvents = e.onEvent();
      // schedule follow-up events
      for (let f of followUpEvents) {
        sim.FEL.add( f);
      }
      let EventClass = e.constructor;
      // test if e is an exogenous event
      if (EventClass.recurrence) {
        // create and schedule next exogenous events
        sim.FEL.add( e.createNextEvent());
      }
    }
  }
  if (sim.model.computeFinalStatistics) sim.model.computeFinalStatistics();
}
/*******************************************************
 Run an Experiment (in a JS worker)
 ********************************************************/
sim.runExperiment = function (exp) {
  // initialize replication statistics record
  if (sim.model.setupStatistics) sim.model.setupStatistics();
  exp.replicStat = Object.create(null);  // empty map
  for (let varName of Object.keys( sim.stat)) {
    exp.replicStat[varName] = [];  // an array per statistics variable
  }
  // run experiment scenario replications
  for (let k=0; k < exp.nmrOfReplications; k++) {
    sim.initializeScenarioRun();
    sim.runScenario();
    // store replication statistics
    Object.keys( exp.replicStat).forEach( function (varName) {
      exp.replicStat[varName][k] = sim.stat[varName];
    });
  }
  // define exp.summaryStat to be a map for the summary statistics
  exp.summaryStat = Object.create(null);
  // aggregate replication statistics in exp.summaryStat
  Object.keys( exp.replicStat).forEach( function (varName) {
    exp.summaryStat[varName] = Object.create(null);  // empty map
    Object.keys( math.stat.summary).forEach( function (aggr) {
      var aggrF = math.stat.summary[aggr].f;
      exp.summaryStat[varName][aggr] = aggrF( exp.replicStat[varName]);
    });
  });
  // send experiment statistics to main thread
  self.postMessage({experiment: exp});
};

