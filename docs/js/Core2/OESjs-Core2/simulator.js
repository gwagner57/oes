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
  sim.model.objectTypes ??= [];  // ES 2020
  sim.model.eventTypes ??= [];
  // a Map of all objects (accessible by ID)
  sim.objects = new Map();
  // The Future Events List
  sim.FEL = new EventList();
  // a map for statistics variables
  sim.stat = Object.create(null);
  // a className->Class map
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
  oes.setupActivityStatistics();
  // a map for resource pools if there are no explicit process owners
  sim.resourcePools = Object.create(null);
  // Initializations per activity type
  for (const actTypeName of sim.model.activityTypes) {
    const AT = sim.Classes[actTypeName];
    AT.resourceRoles ??= Object.create(null);
    // Create the plannedActivities queues
    AT.plannedActivities = new pLANNEDaCTIVITIESqUEUE();
    // Create the resource pools
    for (const resRoleName of Object.keys( AT.resourceRoles)) {
      const resRole = AT.resourceRoles[resRoleName];
      let pn="", altResTypes=null;
      // set default cardinality
      if (!resRole.card && !resRole.minCard) resRole.card = 1;
      if (resRole.range) {  // the resource role is associated with an individual pool
        let rn = resRole.range.name;
        pn = rn.charAt(0).toLowerCase() + rn.slice(1) + "s";
        // create only if not yet created
        sim.resourcePools[pn] ??= new rESOURCEpOOL( {name: pn, resourceType: resRole.range});
        // assign resource pool to resource type
        resRole.range.resourcePool = sim.resourcePools[pn];
        altResTypes = sim.resourcePools[pn].resourceType.alternativeResourceTypes;
      } else {  // the resource role is associated with a count pool
        if (resRole.countPoolName) {
          // a count pool has been explicitly assigned to the resource role
          pn = resRole.countPoolName;
        } else {
          // create default name for implicit count pool
          pn = resRoleName + (!resRole.card||resRole.card===1 ? "s":"");
          // assign count pool to the resource role
          resRole.countPoolName = pn;
        }
        // create count pool only if not yet created
        sim.resourcePools[pn] ??= new rESOURCEpOOL( {name: pn, available:0});
      }
      // assign the (newly created) pool to the resource role
      resRole.resPool = sim.resourcePools[pn];
      // Subscribe activity types to resource pools
      resRole.resPool.dependentActivityTypes.push( AT);
      if (altResTypes) {  // only individual pools have alternativeResourceTypes
        for (arT of altResTypes) {
          resRole.resPool.dependentActivityTypes.push( arT);
        }
      }
    }
  }
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
  // reset model-specific statistics
  if (sim.model.setupStatistics) sim.model.setupStatistics();
  /***START Activity extensions BEFORE-setupInitialState ********************/
  // Initialize resource pools
  for (const poolName of Object.keys( sim.resourcePools)) {
    sim.resourcePools[poolName].clear();
  }
  /***END Activity extensions BEFORE-setupInitialState *********************/
  // Set up initial state
  if (sim.scenario.setupInitialState) sim.scenario.setupInitialState();
  /***START Activity extensions AFTER-setupInitialState ********************/
  oes.initializeActivityStatistics();
  for (const actTypeName of sim.model.activityTypes) {
    // Reset/clear the plannedActivities queues
    sim.Classes[actTypeName].plannedActivities.length = 0;
  }
  // Initialize resource pools
  for (const poolName of Object.keys( sim.resourcePools)) {
    const nmrOfAvailRes = sim.resourcePools[poolName].available;
    if (nmrOfAvailRes !== undefined) {  // a count pool
      // the size of a count pool is the number of initially available resources
      sim.resourcePools[poolName].size = nmrOfAvailRes;
    }
  }
  /***END Activity extensions AFTER-setupInitialState *********************/
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
  sim.step++;
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
  function sendLogMsg() {
    let objStr = [...sim.objects.values()].toString();
    if (objStr) objStr += " | ";
    postMessage({ step: sim.step, time: sim.time,
      // convert values() iterator to array
      objectsStr: objStr + Object.values( sim.resourcePools).toString(),
      eventsStr: sim.FEL.toString()
    });
  }
  const startTime = (new Date()).getTime();
  // Simulation Loop
  while (sim.time < sim.scenario.durationInSimTime &&
      sim.step < sim.scenario.durationInSimSteps &&
      (new Date()).getTime() - startTime < sim.scenario.durationInCpuTime) {
    if (createLog) sendLogMsg();
    sim.advanceSimulationTime();
    // extract and process next events
    const nextEvents = sim.FEL.removeNextEvents();
    // sort simultaneous events according to priority order
    if (nextEvents.length > 1) nextEvents.sort( eVENT.rank);
    // process next (=current) events
    for (const e of nextEvents) {
      // apply event rule
      const followUpEvents = typeof e.onEvent === "function" ? e.onEvent() : [];
      // schedule follow-up events
      for (const f of followUpEvents) {
        sim.FEL.add( f);
      }
      const EventClass = e.constructor;

      /**** ACTIVITIES extension START ****/
      // if event class with successorActivity
      if (EventClass.successorActivity) {
        const SuccActivityClass = sim.Classes[EventClass.successorActivity];
        // enqueue successor activity
        SuccActivityClass.plannedActivities.startOrEnqueue( new SuccActivityClass());
      }
      /**** ACTIVITIES extension END ****/

      // test if e is an exogenous event
      if (EventClass.recurrence) {
        // create and schedule next exogenous event
        const ne = e.createNextEvent();
        if (ne) sim.FEL.add( ne);
      }
    }
    // end simulation if no time increment and no more events
    if (!sim.timeIncrement && sim.FEL.isEmpty()) {
      if (createLog) sendLogMsg();
      break;
    }
  }
  // compute generic statistics (incl. resource utilization)
  sim.computeFinalStatistics();
  // compute user-defined statistics
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
  // send statistics to main thread
  self.postMessage({statistics: sim.stat, endTime: sim.time});
}
/*******************************************************
 Run an Experiment (in a JS worker)
 ********************************************************/
sim.runExperiment = async function () {
  var exp = sim.experimentType, expRun={},
      compositeStatVarNames = ["actTypes"],
      simpleStatVarNames = [];
  // set up user-defined statistics variables
  sim.model.setupStatistics();
  // create a list of the names of simple statistics variables
  simpleStatVarNames = Object.keys( sim.stat).filter(
      varName => !compositeStatVarNames.includes( varName));

  async function runSimpleExperiment() {
    var statVarList=[];
    // initialize replication statistics
    exp.replicStat = Object.create(null);  // empty map
    for (const varName of simpleStatVarNames) {
      exp.replicStat[varName] = [];  // an array per statistics variable
    }
    /***START Activity extensions BEFORE-runSimpleExperiment ********************/
    exp.replicStat.actTypes = Object.create(null);  // empty map
    let throughputStatVarList = ["enqueuedActivities","waitingTimeouts","startedActivities","completedActivities"];
    let throughputStatVarListWithoutTmout = ["enqueuedActivities","startedActivities","completedActivities"];
    for (const actTypeName of Object.keys( sim.stat.actTypes)) {
      if (typeof sim.Classes[actTypeName].waitingTimeout === "function") {
        exp.replicStat.actTypes[actTypeName] = {
          enqueuedActivities:[], waitingTimeouts:[], startedActivities:[], completedActivities:[],
          queueLength:{max:[]}, waitingTime:{max:[]}, cycleTime:{max:[]}
        };
      } else {
        exp.replicStat.actTypes[actTypeName] = {
          enqueuedActivities:[], startedActivities:[], completedActivities:[],
          queueLength:{max:[]}, waitingTime:{max:[]}, cycleTime:{max:[]}
        };
      }
      //exp.replicStat.actTypes[actTypeName].resUtil = {};
    }
    /***END Activity extensions BEFORE-runSimpleExperiment ********************/
    // run experiment scenario replications
    for (let k=0; k < exp.nmrOfReplications; k++) {
      if (exp.seeds) sim.initializeScenarioRun({seed: exp.seeds[k]});
      else sim.initializeScenarioRun();
      sim.runScenario();
      // store replication statistics
      for (const key of Object.keys( exp.replicStat)) {
        if (key !== "actTypes") exp.replicStat[key][k] = sim.stat[key];
      }
      /***START Activity extensions AFTER-runSimpleExperimentScenario ********************/
      for (const actTypeName of Object.keys( exp.replicStat.actTypes)) {
        const replActStat = exp.replicStat.actTypes[actTypeName],
              actStat = sim.stat.actTypes[actTypeName];
        replActStat.enqueuedActivities[k] = actStat.enqueuedActivities;
        if (typeof sim.Classes[actTypeName].waitingTimeout === "function") {
          replActStat.waitingTimeouts[k] = actStat.waitingTimeouts;
        }
        replActStat.startedActivities[k] = actStat.startedActivities;
        replActStat.completedActivities[k] = actStat.completedActivities;
        replActStat.queueLength.max[k] = actStat.queueLength.max;
        replActStat.waitingTime.max[k] = actStat.waitingTime.max;
        replActStat.cycleTime.max[k] = actStat.cycleTime.max;
        //actStat.resUtil = {};
      }
      /***END Activity extensions AFTER-runSimpleExperimentScenario ********************/
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
    for (const key of Object.keys( exp.replicStat)) {
      if (key !== "actTypes") {  // key is a user-defined statistics variable name
        exp.summaryStat[key] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;
          exp.summaryStat[key][aggr] = aggrF(exp.replicStat[key]);
        }
      }
    }
    /***START Activity extensions AFTER-runSimpleExperimentScenario ********************/
    exp.summaryStat.actTypes = Object.create(null);  // empty map
    for (const actTypeName of Object.keys( exp.replicStat.actTypes)) {
      const replActStat = exp.replicStat.actTypes[actTypeName];
      exp.summaryStat.actTypes[actTypeName] = Object.create(null);  // empty map
      if (typeof sim.Classes[actTypeName].waitingTimeout === "function") {
        statVarList = throughputStatVarList
      } else {
        statVarList = throughputStatVarListWithoutTmout
      }
      for (const statVarName of statVarList) {
        exp.summaryStat.actTypes[actTypeName][statVarName] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;
          // compute/store the result of aggregation over the replication value list
          exp.summaryStat.actTypes[actTypeName][statVarName][aggr] = aggrF( replActStat[statVarName]);
        }
      }
      //Possibly TODO: also support averages
      for (const statVarName of ["queueLength","waitingTime","cycleTime"]) {
        exp.summaryStat.actTypes[actTypeName][statVarName] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;
          // compute/store the result of aggregation over the replication value list
          exp.summaryStat.actTypes[actTypeName][statVarName][aggr] = aggrF( replActStat[statVarName].max);
        }
      }
      /*****TODO: support also the following statistics *****/
      //actStat.resUtil = {};
    }
    /***END Activity extensions AFTER-runSimpleExperimentScenario ********************/
    // send experiment statistics to main thread
    postMessage({simpleExperiment: exp});
  }
  async function runParVarExperiment() {
    const valueSets = [], expParSlots = {},
        N = exp.parameterDefs.length;
    exp.scenarios = [];
    // create a list of value sets, one set for each parameter
    for (let i=0; i < N; i++) {
      const expPar = exp.parameterDefs[i];
      if (!expPar.values) {
        // create value set
        expPar.values = [];
        const increm = expPar.stepSize || 1;
        for (let x = expPar.startValue; x <= expPar.endValue; x += increm) {
          expPar.values.push( x);
        }
      }
      valueSets.push( expPar.values);
    }
    const cp = math.cartesianProduct( valueSets);
    const M = cp.length;  // size of cartesian product
    // set up statistics variables
    sim.model.setupStatistics();
    // loop over all combinations of experiment parameter values
    for (let i=0; i < M; i++) {
      const valueCombination = cp[i];  // an array list of values, one for each parameter
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
        if (exp.seeds && exp.seeds.length > 0) {
          sim.initializeScenarioRun({seed: exp.seeds[k], expParSlots: expParSlots});
        } else {
          sim.initializeScenarioRun({expParSlots: expParSlots});
        }
        sim.runScenario();
        // add up replication statistics from sim.stat to sim.experimentType.scenarios[i].stat
        Object.keys( sim.stat).forEach( function (varName) {
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
      await sim.db.add("experiment_runs", expRun);
    } catch( err) {
      console.log("IndexedDB error: ", err.message);
    }
  }
  if (exp.parameterDefs?.length) runParVarExperiment();
  else runSimpleExperiment();
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

