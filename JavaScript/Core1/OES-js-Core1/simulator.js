/* Changes from OESjs
- sim.objects is a JS Map
 */

/*******************************************************************
 * Initialize Simulator ********************************************
 *******************************************************************/
sim.initializeSimulator = function () {
  // Set default values for end time parameters
  if (!sim.scenario.durationInSimTime) sim.scenario.durationInSimTime = Infinity;
  if (!sim.scenario.durationInSimSteps) sim.scenario.durationInSimSteps = Infinity;
  if (!sim.scenario.durationInCpuTime) sim.scenario.durationInCpuTime = Infinity;
  // Set timeIncrement for fixed-increment time progression
  if (sim.model.timeIncrement) {
    sim.timeIncrement = sim.model.timeIncrement;
  } else {
    if (sim.model.OnEachTimeStep) sim.timeIncrement = 1;  // default
  }
  // The Future Events List
  sim.FEL = new EventList();
  // Create map for statistics variables
  sim.stat = Object.create(null);
}
/*******************************************************************
 * Assign model parameters with experiment parameter values ********
 *******************************************************************/
sim.assignModelParameters = function (expParSlots) {
  for (let parName of Object.keys( sim.model.p)) {
    sim.model.p[parName] = expParSlots[parName];
  }
}
/*******************************************************************
 * Initialize a (standalone or experiment scenario) simulation run *
 *******************************************************************/
sim.initializeScenarioRun = function ({seed, expParSlots}={}) {
  // clear initial state data structures
  sim.objects = new Map();  // a map of all objects (accessible by ID)
  sim.FEL.clear();
  //sim.ongoingActivities = Object.create( null);  // a map of all ongoing activities accessible by ID
  sim.step = 0;  // simulation loop step counter
  sim.time = 0;  // 1 time
  // get ID counter from simulation scenario, or set to default value
  sim.idCounter = sim.scenario.idCounter || 1000;
  // set up a default random variate sampling method
  if (!sim.experimentType && sim.scenario.randomSeed) {
    // use David Bau's seedrandom RNG
    rand.gen = new Math.seedrandom( sim.scenario.randomSeed);
  } else if (seed) {  // experiment-defined replication-specific seed
    // use David Bau's seedrandom RNG
    rand.gen = new Math.seedrandom( seed);
  } else {  // use the JS built-in RNG
    rand.gen = Math.random;
  }
  // Assign model parameters with experiment parameter values
  if (expParSlots) sim.assignModelParameters( expParSlots);
  // Set up initial state and statistics
  if (sim.scenario.setupInitialState) sim.scenario.setupInitialState();
  //if (Object.keys( oes.EntryNode.instances).length > 0) oes.setupProcNetStatistics();
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
  if (sim.timeIncrement) {  // fixed-increment time progression
    // fixed-increment time progression simulations may also have events
    if (sim.nextEvtTime > sim.time && sim.nextEvtTime < sim.time + sim.timeIncrement) {
      sim.time = sim.nextEvtTime;  // an event occurring before the next incremented time
    } else {
      sim.time += sim.timeIncrement;
    }
  } else if (sim.nextEvtTime > 0) {  // next-event time progression
    sim.time = sim.nextEvtTime;
  }
}
/*******************************************************
 Run a simulation scenario
 ********************************************************/
sim.runScenario = function (createLog) {
  var startTime = (new Date()).getTime();
  // Simulation Loop
  while (sim.time < sim.scenario.durationInSimTime &&
      sim.step < sim.scenario.durationInSimSteps &&
      (new Date()).getTime() - startTime < sim.scenario.durationInCpuTime) {
    if (createLog) {
      self.postMessage({ step: sim.step, time: sim.time,
        objectsStr: [...sim.objects.values()].toString(),
        eventsStr: sim.FEL.toString()
      });
    }
    sim.advanceSimulationTime();
    // extract and process next events
    let nextEvents = sim.FEL.removeNextEvents();
    // sort simultaneous events according to priority order
    if (nextEvents.length > 1) nextEvents.sort( eVENT.rank);
    // process next (=current) events
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
        // create and schedule next exogenous event
        sim.FEL.add( e.createNextEvent());
      }
    }
    // end simulation if no time increment and no more events
    if (!sim.timeIncrement && sim.FEL.isEmpty()) break;
  }
  if (sim.model.computeFinalStatistics) sim.model.computeFinalStatistics();
}
/*******************************************************
 Run a Standalone Simulation Scenario (in a JS worker)
 ********************************************************/
sim.runStandaloneScenario = function (createLog) {
  sim.initializeSimulator();
  if (!sim.scenario.randomSeed) sim.initializeScenarioRun();
  else sim.initializeScenarioRun({seed: sim.scenario.randomSeed});
  sim.runScenario( createLog);
}
/*******************************************************
 Run an Experiment (in a JS worker)
 ********************************************************/
sim.runExperiment = function (exp) {
  if (exp.parameterDefs?.length) sim.runParVarExperiment( exp);
  else sim.runSimpleExperiment( exp);
}
/*******************************************************
 Run a Simple Experiment (in a JS worker)
 ********************************************************/
sim.runSimpleExperiment = function (exp) {
  sim.initializeSimulator();
  if (sim.model.setupStatistics) sim.model.setupStatistics();
  // initialize replication statistics record
  exp.replicStat = Object.create(null);  // empty map
  for (let varName of Object.keys( sim.stat)) {
    exp.replicStat[varName] = [];  // an array per statistics variable
  }
  // run experiment scenario replications
  for (let k=0; k < exp.nmrOfReplications; k++) {
    if (exp.seeds) {
      if (exp.seeds.length >= exp.nmrOfReplications) {
        sim.initializeScenarioRun({seed: exp.seeds[k]});
      } else {
        console.error(`Not enough seeds defined for ${exp.nmrOfReplications} replications`);
      }
    } else sim.initializeScenarioRun();
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
  self.postMessage({simpleExperiment: exp});
};
/*******************************************************
 Run a Parameter Variation Experiment (in a JS worker)
********************************************************/
sim.runParVarExperiment = function (exp) {
  var cp = [], valueSets = [], M = 0,
      N = exp.parameterDefs.length,
      increm = 0, x = 0, expPar = {},
      expRunId = (new Date()).getTime(),
      valueCombination = [], expParSlots = {};
  sim.initializeSimulator();
  exp.scenarios = [];
  // create a list of value sets, one set for each parameter
  for (let i=0; i < N; i++) {
    expPar = exp.parameterDefs[i];
    if (!expPar.values) {
      // create value set
      expPar.values = [];
      increm = expPar.stepSize || 1;
      for (x = expPar.startValue; x <= expPar.endValue; x += increm) {
        expPar.values.push( x);
      }
    }
    valueSets.push( expPar.values);
  }
  cp = math.cartesianProduct( valueSets);
  M = cp.length;  // size of cartesian product
  // set up statistics variables
  sim.model.setupStatistics();
  // loop over all combinations of experiment parameter values
  for (let i=0; i < M; i++) {
    valueCombination = cp[i];  // an array list of values, one for each parameter
    // initialize the scenario record
    exp.scenarios[i] = {stat: Object.create(null)};
    exp.scenarios[i].parameterValues = valueCombination;
    // initialize experiment scenario statistics
    for (let varName of Object.keys( sim.stat)) {
      exp.scenarios[i].stat[varName] = 0;
    }
    // create experiment parameter slots for assigning corresponding model variables
    for (let j=0; j < N; j++) {
      expParSlots[exp.parameterDefs[j].name] = valueCombination[j];
    }
    // run experiment scenario replications
    for (let k=0; k < exp.nmrOfReplications; k++) {
      if (exp.seeds.length > 0) {
        sim.initializeScenarioRun({seed: exp.seeds[k], expParSlots: expParSlots});
      } else {
        sim.initializeScenarioRun({expParSlots: expParSlots});
      }
      sim.runScenario();
      // add up replication statistics from sim.stat to sim.experimentType.scenarios[i].stat
      Object.keys( sim.stat).forEach( function (varName) {
        exp.scenarios[i].stat[varName] += sim.stat[varName];
      });
      /*
      if (exp.storeEachExperimentScenarioRun) {
        await sim.storeMan.add( oes.ExperimentScenarioRun, {
          id: expRunId + i * exp.replications + k + 1,
          experimentRun: expRunId,
          experimentScenarioNo: i,
          parameterValueCombination: exp.scenarios[i].parameterValues,
          outputStatistics: Object.assign({}, sim.stat)  // clone
        });
      }
      */
    }
    // compute averages
    Object.keys( sim.stat).forEach( function (varName) {
      exp.scenarios[i].stat[varName] /= exp.nmrOfReplications;
    });
    // send statistics to main thread
    self.postMessage({
      expScenNo: i,
      expScenParamValues: exp.scenarios[i].parameterValues,
      expScenStat: exp.scenarios[i].stat
    });
  }
  self.postMessage({endTime: sim.endTime});
};

