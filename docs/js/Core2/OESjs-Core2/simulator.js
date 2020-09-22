/* Changes from OESjs
- sim.objects is a JS Map
- sim.resourcePools
- etc.
 */

/*
TODO:
- compute generic queue length statistics per activity type
- compute generic cycle time statistics per activity type
- group all activity-induced extensions in "initializeSimulator" and other procedures
 */

/*******************************************************************
 * Initialize Simulator ********************************************
 *******************************************************************/
sim.initializeSimulator = function () {
  if (sim.model.nextMomentDeltaT) sim.nextMomentDeltaT = sim.model.nextMomentDeltaT;
  else {  // assign defaults
    if (sim.model.time === "discrete") sim.nextMomentDeltaT = 1;
    else sim.nextMomentDeltaT = oes.defaults.nextMomentDeltaT;
  }
  // Set timeIncrement for fixed-increment time progression
  if (sim.model.timeIncrement) {
    sim.timeIncrement = sim.model.timeIncrement;
  } else {
    if (sim.model.OnEachTimeStep) sim.timeIncrement = 1;  // default
  }
  // Make sure these lists are defined
  sim.model.objectTypes ??= [];
  sim.model.eventTypes ??= [];
  // A Map of all objects (accessible by ID)
  sim.objects = new Map();
  // The Future Events List
  sim.FEL = new EventList();
  // A map for statistics variables
  sim.stat = Object.create(null);
  sim.initializeStatistics();
  // Create a className->Class map
  sim.Classes = Object.create(null);
  // Make object classes accessible via their object type name
  sim.model.objectTypes.forEach( function (objTypeName) {
    sim.Classes[objTypeName] = util.getClass( objTypeName);
  });
  // Make event classes accessible via their event type name
  sim.model.eventTypes.forEach( function (evtTypeName) {
    sim.Classes[evtTypeName] = util.getClass( evtTypeName);
  });
  // Assign scenarioNo = 0 to default scenario
  sim.scenario.scenarioNo ??= 0;
  sim.scenario.title ??= "Default scenario";
  /*** Activity extensions **********************************************/
  sim.model.activityTypes ??= [];
  // Make activity classes accessible via their activity type name
  sim.model.activityTypes.forEach( function (actTypeName) {
    sim.Classes[actTypeName] = util.getClass( actTypeName);
  });
  // A map for resource pools if there are no explicit process owners
  sim.resourcePools = Object.create(null);
  // Initializations per activity type
  sim.model.activityTypes.forEach( function (actTypeName) {
    const AT = sim.Classes[actTypeName];
    // Reset the generic (per activity) statistics
    if (!AT.resourceRoles) AT.resourceRoles = Object.create(null);
    // Initialize the plannedActivities queues
    AT.plannedActivities = new pLANNEDaCTIVITIESqUEUE();
    // Initialize the resource pools
    for (const resRoleName of Object.keys( AT.resourceRoles)) {
      const resRole = AT.resourceRoles[resRoleName],
            cpn = resRole.countPoolName;
      if (cpn) {  // the resource role is associated with a count pool
        sim.resourcePools[cpn] = new rESOURCEpOOL( {name: cpn, available:0});
        resRole.resPool = sim.resourcePools[cpn];
      } else {  // the resource role is associated with an individual pool
        const rn = resRole.range.name,
              pn = rn.charAt(0).toLowerCase() + rn.slice(1) + "s";
        sim.resourcePools[pn] = new rESOURCEpOOL( {name: pn, resources:[]});
        resRole.resPool = sim.resourcePools[pn];
      }
    }
  });
}
/*******************************************************************
 * Initialize a (standalone or experiment scenario) simulation run *
 *******************************************************************/
sim.initializeScenarioRun = function ({seed, expParSlots}={}) {
  // clear initial state data structures
  sim.objects.clear();
  sim.FEL.clear();
  sim.step = 0;  // simulation loop step counter
  sim.time = 0;  // 1 time
  // Set default values for end time parameters
  sim.scenario.durationInSimTime ??= Infinity;
  sim.scenario.durationInSimSteps ??= Infinity;
  sim.scenario.durationInCpuTime ??= Infinity;
  // get ID counter from simulation scenario, or set to default value
  sim.idCounter = sim.scenario.idCounter ?? 1000;
  // set up a random number generator (RNG) method
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
  if (sim.model.setupStatistics) {  // reset model-specific statistics
    sim.model.setupStatistics();
  }
  /*** Activity extensions **********************************************/
  sim.model.activityTypes.forEach( function (actTypeName) {
    // Reset/clear the plannedActivities queues
    sim.Classes[actTypeName].plannedActivities.length = 0;
    // Reset resource utilization statistics per activity type
    sim.stat.actTypes[actTypeName].resUtil = Object.create(null);
    // Reset generic queue length statistics per activity type
    sim.stat.actTypes[actTypeName].queueLength.max = 0;
    //sim.stat.actTypes[actTypeName].queueLength.avg = 0.0;
  });
  // Initialize resource pools
  for (const poolName of Object.keys( sim.resourcePools)) {
    const nmrOfAvailRes = sim.resourcePools[poolName].available;
    if (nmrOfAvailRes) {  // a count pool
      // the size of a count pool is the number of initially available resources
      sim.resourcePools[poolName].size = nmrOfAvailRes;
    }
  }
};
/*******************************************************************
 * Assign model parameters with experiment parameter values ********
 *******************************************************************/
sim.assignModelParameters = function (expParSlots) {
  for (let parName of Object.keys( sim.model.p)) {
    sim.model.p[parName] = expParSlots[parName];
  }
}
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
        // convert values() iterator to array
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
  sim.computeFinalStatistics();  // resource utilization
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
sim.runExperiment = async function () {
  var exp = sim.experimentType, expRun={},
      compositeStatVarNames = ["actTypes", "resUtil"],
      simpleStatVarNames = [];
  // set up statistics variables
  sim.model.setupStatistics();
  // create a list of the names of simple statistics variables
  simpleStatVarNames = Object.keys( sim.stat).filter(
      varName => !compositeStatVarNames.includes( varName));

  async function runSimpleExperiment() {
    // initialize replication statistics record
    exp.replicStat = Object.create(null);  // empty map
    for (let varName of simpleStatVarNames) {
      exp.replicStat[varName] = [];  // an array per statistics variable
    }
    // run experiment scenario replications
    for (let k=0; k < exp.nmrOfReplications; k++) {
      if (exp.seeds) sim.initializeScenarioRun({seed: exp.seeds[k]});
      else sim.initializeScenarioRun();
      sim.runScenario();
      // store replication statistics
      Object.keys( exp.replicStat).forEach( function (varName) {
        exp.replicStat[varName][k] = sim.stat[varName];
      });
      if (exp.storeExpResults) {
        try {
          await sim.db.add( "experiment_scenario_runs", {
            id: expRun.id + k + 1,
            experimentRun: expRun.id,
            outputStatistics: {...sim.stat}  // clone
          });
        } catch( err) {
          console.log("Error: ", err.message);
        }
      }
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
  }
  async function runParVarExperiment() {
    var cp = [], valueSets = [], M = 0,
        N = exp.parameterDefs.length,
        increm = 0, x = 0, expPar = {},
        valueCombination = [], expParSlots = {};
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
    // loop over all combinations of experiment parameter values
    for (let i=0; i < M; i++) {
      valueCombination = cp[i];  // an array list of values, one for each parameter
      // initialize the scenario record
      exp.scenarios[i] = {stat: Object.create(null)};
      exp.scenarios[i].parameterValues = valueCombination;
      // initialize experiment scenario statistics
      for (let varName of simpleStatVarNames) {
        exp.scenarios[i].stat[varName] = 0;
      }
      // create experiment parameter slots for assigning corresponding model variables
      for (let j=0; j < N; j++) {
        expParSlots[exp.parameterDefs[j].name] = valueCombination[j];
      }
      if (exp.storeExpResults) {
        try {
          await sim.db.add("experiment_scenarios", {
            id: expRun.id + i + 1,
            experimentRun: expRun.id,
            experimentScenarioNo: i,
            parameterValueCombination: [...exp.scenarios[i].parameterValues],  // clone
          });
        } catch( err) {
          console.log('error', err.message);
        }
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
        simpleStatVarNames.forEach( function (varName) {
          exp.scenarios[i].stat[varName] += sim.stat[varName];
        });
        if (exp.storeExpResults) {
          try {
            await sim.db.add("experiment_scenario_runs", {
              id: expRun.id + M + i * exp.nmrOfReplications + k + 1,
              experimentRun: expRun.id,
              experimentScenarioNo: i,
              outputStatistics: {...sim.stat}  // clone
            });
          } catch( err) {
            console.log('error', err.message);
          }
        }
      }
      // compute averages
      simpleStatVarNames.forEach( function (varName) {
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
  }

  if (exp.seeds && exp.seeds.length < exp.nmrOfReplications) {
    console.error(`Not enough seeds defined for ${exp.nmrOfReplications} replications`);
    return;
  }
  sim.initializeSimulator();
  // setup DB connection on demand if browser supports IndexedDB
  if (exp.storeExpResults) {
    // check if browser supports IndexedDB
    if (!('indexedDB' in self)) {
      console.warn("This browser doesn't support IndexedDB. Experiment results will not be stored!");
      exp.storeExpResults = false;
    } else {
      sim.db = await idb.openDB( sim.model.name, 1, {
        upgrade(db) {
          const os1 = db.createObjectStore( "experiment_runs", {keyPath: "id", autoIncrement: true});
          //os1.createIndex('date', 'date');
          db.createObjectStore( "experiment_scenarios", {keyPath: "id", autoIncrement: true});
          db.createObjectStore( "experiment_scenario_runs", {keyPath: "id", autoIncrement: true});
        }
      });
    }
  }
  if (exp.storeExpResults) {
    expRun = {
      id: eXPERIMENTrUN.getAutoId(),
      experimentType: exp.id,
      baseScenarioNo: sim.scenario.scenarioNo,
      dateTime: (new Date()).toISOString(),
    };
    try {
      //await idbc.add( "experiment_runs", expRun);
      await sim.db.add("experiment_runs", expRun);
    } catch( err) {
      console.log("IndexedDB error: ", err.message);
    }
  }
  if (exp.parameterDefs?.length) runParVarExperiment();
  else runSimpleExperiment();
}
/*******************************************************
 * Initialize the pre-defined ex-post statistics
 ********************************************************/
sim.initializeStatistics = function () {
  // Per activity type
  if (Array.isArray( sim.model.activityTypes) && sim.model.activityTypes.length > 0) {
    sim.stat.actTypes = Object.create(null);  // an empty map
    sim.model.activityTypes.forEach( function (actTypeName) {
      sim.stat.actTypes[actTypeName] = Object.create(null);
      // initialize throughput statistics
      sim.stat.actTypes[actTypeName].enqueuedPlanActivities = 0;
      sim.stat.actTypes[actTypeName].dequeuedPlanActivities = 0;
      sim.stat.actTypes[actTypeName].startedActivities = 0;
      sim.stat.actTypes[actTypeName].completedActivities = 0;
      // generic queue length statistics
      sim.stat.actTypes[actTypeName].queueLength = Object.create(null);
      //sim.stat.actTypes[actTypeName].queueLength.avg = 0.0;
      sim.stat.actTypes[actTypeName].queueLength.max = 0;
      // initialize resource utilization statistics
      sim.stat.actTypes[actTypeName].resUtil = Object.create(null);
    });
  }
  /*
  // initialize PN statistics
  if (Object.keys( oes.ProcessingNode.instances).length > 0) {
    sim.stat.resUtil["pROCESSINGaCTIVITY"] = {};
  }
  */
}
/*******************************************************
 * Compute the final statistics
 ********************************************************/
sim.computeFinalStatistics = function () {
  // finalize resource utilization statistics
  if (Array.isArray( sim.model.activityTypes)) {
    sim.model.activityTypes.forEach( function (actTypeName) {
      var resUtilPerAT = sim.stat.actTypes[actTypeName].resUtil;
      Object.keys( resUtilPerAT).forEach( function (key) {
        var utiliz = resUtilPerAT[key];
        // key is either an objIdStr or a count pool name
        utiliz /= sim.time;
        // if key is a count pool name
        if (sim.resourcePools[key]) {
          utiliz /= sim.resourcePools[key].size;
        }
        resUtilPerAT[key] = math.round( utiliz, oes.defaults.expostStatDecimalPlaces);
      });
    });
  }
}

