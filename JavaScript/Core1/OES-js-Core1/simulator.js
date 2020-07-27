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
sim.initializeScenarioRun = function (expParamSlots, seed) {
  sim.step = 0;  // simulation loop step counter
  sim.time = 0;  // simulation time
  // set default endTime
  sim.endTime = sim.scenario?.simEndTime || sim.endTime || Number.MAX_SAFE_INTEGER;
  // get ID counter from simulation scenario, or set to default value
  sim.idCounter = sim.scenario?.idCounter || 1000;
  // set up a default random variate sampling method
  /*
  if (!sim.experiment && sim.scenario.randomSeed) {  // use the Mersenne Twister RNG
    rand = new Random( sim.scenario.randomSeed);
  } else if (seed) {  // experiment-defined replication-specific seed
    rand = new Random( seed);
  } else {  // use the JS built-in RNG
    rand = new Random();
  }
  */
  // set up initial state
  //sim.initializeModelVariables( expParamSlots);
  if (sim.scenario.setupInitialState) sim.scenario.setupInitialState();
  //else sim.createInitialObjEvt();
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
sim.runScenario = function () {
  // Simulation Loop
  while (sim.time < sim.endTime && !sim.FEL.isEmpty()) {
    // if not executed in a worker, create simulation log
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
  var cp = [], valueSets = [], M = 0,
      N = exp.parameterDefs.length,
      increm = 0, x = 0, expPar = {},
      expRunId = (new Date()).getTime(),
      valueCombination = [], expParamSlots = {};
  if (N === 0) {  // simple experiment (without parameters)
    cp = [[]];  // Cartesian Product with only 1 empty parameter value combination
    M = cp.length;  // size of cartesian product
    // initialize replication statistics record
    if (sim.model.setupStatistics) sim.model.setupStatistics();
    exp.replicStat = {};
    for (let varName of Object.keys( sim.stat)) {
      exp.replicStat[varName] = [];  // an array per statistics variable
    }
  } else {  // parameter variation experiment
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
    cp = util.cartesianProduct( valueSets);
    M = cp.length;  // size of cartesian product
  }
  // loop over all combinations of experiment parameter values
  for (let i=0; i < M; i++) {
    valueCombination = cp[i];  // a JS array
    // initialize the scenario record
    exp.scenarios[i] = {stat:{}};
    exp.scenarios[i].parameterValues = valueCombination;
    // initialize experiment scenario statistics
    for (let varName of Object.keys( sim.stat)) {
      exp.scenarios[i].stat[varName] = 0;
    }
    // create experiment parameter slots for assigning corresponding model variables
    for (let j=0; j < N; j++) {
      expParamSlots[exp.parameterDefs[j].name] = valueCombination[j];
    }
    // run experiment scenario replications
    for (let k=0; k < exp.nmrOfReplications; k++) {
      if (exp.seeds.length > 0) {
        sim.initializeScenarioRun( expParamSlots, exp.seeds[k]);
      } else {
        sim.initializeScenarioRun( expParamSlots);
      }
      sim.runScenario();
      if (N > 0) {  // parameter variation experiment
        /*
        // for the first replication, initialize experiment scenario statistics
        if (k === 0) {
          Object.keys( sim.stat).forEach( function (varName) {
            if (sim.stat[varName].isSimpleOutputStatistics) {
              exp.scenarios[i].stat[varName] = 0;
            }
          } );
        }
        // aggregate replication statistics from sim.stat to sim.experiment.scenarios[i].stat
        Object.keys( sim.stat).forEach( function (varName) {
          if (sim.stat[varName].isSimpleOutputStatistics) {
            exp.scenarios[i].stat[varName] += sim.stat[varName];
          }
        });
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
      } else {  // simple experiment
        // store replication statistics
        Object.keys( exp.replicStat).forEach( function (varName) {
          exp.replicStat[varName][k] = sim.stat[varName];
        });
      }
    }
    if (N === 0) {  // simple experiment (without parameters)
      // aggregate replication statistics in exp.scenarios[0].stat
      Object.keys( exp.replicStat).forEach( function (varName) {
        exp.scenarios[i].stat[varName] = {};
        Object.keys( math.stat.summary).forEach( function (aggr) {
          var aggrF = math.stat.summary[aggr].f;
          exp.scenarios[i].stat[varName][aggr] = aggrF( exp.replicStat[varName]);
        });
      });
    }
    if (N > 0) {  // parameter variation experiment
      // send statistics to main thread
      self.postMessage({
        expScenNo: i,
        expScenParamValues: exp.scenarios[i].parameterValues,
        expScenStat: exp.scenarios[i].stat
      });
    } else {  // simple experiment (without parameters)
      // send statistics to main thread
      self.postMessage({experiment: exp});
    }
  }
  self.postMessage({endTime: sim.endTime});
};

