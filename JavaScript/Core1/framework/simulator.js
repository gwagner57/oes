/* Changes from OESjs
- sim.objects is a JS Map
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
  // make sure these lists are defined (using ES 2020 syntax)
  sim.model.objectTypes ??= [];
  sim.model.eventTypes ??= [];
  // initialize the map of all objects (accessible by ID)
  sim.objects = new Map();
  // initialize the Map of all objects (accessible by name)
  sim.namedObjects = new Map();
  // initialize the Future Events List
  sim.FEL = new EventList();
  // initialize the map for statistics variables
  sim.stat = Object.create(null);
  // initialize the className->Class map
  sim.Classes = Object.create(null);
  // Make object classes accessible via their object type name
  for (const objTypeName of sim.model.objectTypes) {
    sim.Classes[objTypeName] = util.getClass( objTypeName);
  }
  // Make event classes accessible via their event type name
  for (const evtTypeName of sim.model.eventTypes) {
    sim.Classes[evtTypeName] = util.getClass( evtTypeName);
  }
  // Assign scenarioNo = 0 to default scenario
  sim.scenario.scenarioNo ??= 0;
  sim.scenario.title ??= "Default scenario";}
/*******************************************************************
 * Schedule an event or a list of events ***************************
 *******************************************************************/
sim.schedule = function (e) {
  if (!Array.isArray(e)) sim.FEL.add( e);
  else for (const evt of e) {sim.FEL.add( evt);}
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
  sim.objects.clear();
  sim.namedObjects.clear();
  sim.FEL.clear();
  //sim.ongoingActivities = Object.create( null);  // a map of all ongoing activities accessible by ID
  sim.step = 0;  // simulation loop step counter
  sim.time = 0;  // simulation time
  // Set default values for end time parameters
  sim.scenario.durationInSimTime ??= Infinity;
  sim.scenario.durationInSimSteps ??= Infinity;
  sim.scenario.durationInCpuTime ??= Infinity;
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
  // reset model-specific statistics
  if (sim.model.setupStatistics) sim.model.setupStatistics();
  // (re)set the timeSeries statistics variable
  if ("timeSeries" in sim.model &&
      Object.keys( sim.model.timeSeries).length > 0) {
    sim.stat.timeSeries = Object.create( null);
    for (const tmSerLbl of Object.keys( sim.model.timeSeries)) {
      sim.stat.timeSeries[tmSerLbl] = [];
      if (!sim.timeIncrement) {
        sim.stat.timeSeries[tmSerLbl][0] = [];
        sim.stat.timeSeries[tmSerLbl][1] = [];
      }
    }
  }
  // Add initial objects (possibly changed in UI)
  for (const objTypeName of Object.keys( sim.scenario.initialObjects || {})) {
    const C = sim.Classes[objTypeName];
    const objRecords = sim.scenario.initialObjects[objTypeName];
    C.instances ??= Object.create(null);
    for (const objId of Object.keys( objRecords)) {
      //TODO: should the records be converted to class instances?
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
  // schedule initial events if no initial event has been scheduled
  if (sim.FEL.isEmpty()) {
    for (const evtTypeName of sim.model.eventTypes) {
      const ET = sim.Classes[evtTypeName];
      if (ET.recurrence) {
        sim.FEL.add( new ET({occTime: ET.recurrence()}));
      }
    }
  }
};
/*******************************************************
 Advance Simulation Time
 ********************************************************/
sim.advanceSimulationTime = function () {
  const nextEvtTime = sim.FEL.getNextOccurrenceTime();  // 0 if there is no next event
  // increment the step counter
  sim.step += 1;
  // advance simulation time
  if (sim.timeIncrement) {  // fixed-increment time progression
    // fixed-increment time progression simulations may also have events
    if (nextEvtTime > sim.time && nextEvtTime < sim.time + sim.timeIncrement) {
      sim.time = nextEvtTime;  // an event occurring before the next incremented time
    } else {
      sim.time += sim.timeIncrement;
    }
  } else if (nextEvtTime > 0) {  // next-event time progression
    sim.time = nextEvtTime;
  }
}
/*******************************************************
 Run a simulation scenario
 ********************************************************/
sim.runScenario = function (createLog) {
  function sendLogMsg( currEvts) {
    self.postMessage({ step: sim.step, time: sim.time,
      // convert values() iterator to array and map its elements to strings
      objectsStr: [...sim.objects.values()].map( el => el.toString()).join("|"),
      currEvtsStr: currEvts.map( el => el.toString()).join("|"),
      futEvtsStr: sim.FEL.toString()
    });
  }
  const startTime = (new Date()).getTime();
  if (createLog) sendLogMsg([]);  // log initial state
  // Simulation Loop
  while (sim.time < sim.scenario.durationInSimTime &&
      sim.step < sim.scenario.durationInSimSteps &&
      (new Date()).getTime() - startTime < sim.scenario.durationInCpuTime) {
    sim.advanceSimulationTime();
    // extract and process next events
    const nextEvents = sim.FEL.removeNextEvents();
    // sort simultaneous events according to priority order
    if (nextEvents.length > 1) nextEvents.sort( eVENT.rank);
    // process next (=current) events
    for (const e of nextEvents) {
      // apply event rule
      const followUpEvents = e.onEvent();
      // schedule follow-up events
      for (const f of followUpEvents) {
        sim.FEL.add( f);
      }
      const EventClass = e.constructor;
      // test if e is an exogenous event
      if (EventClass.recurrence || e.recurrence || EventClass.eventRate) {
        // schedule next exogenous event
        if ("createNextEvent" in e) {
          const nextEvt = e.createNextEvent();
          if (nextEvt) sim.FEL.add( nextEvt);
        } else {
          sim.schedule( new EventClass());
        }
      }
    }
    // check if any time series has to be stored/returned
    if ("timeSeries" in sim.stat) {
      /*
      if (!statVar.timeSeriesScalingFactor) v = sim.stat[varName];
      else v = sim.stat[varName] * statVar.timeSeriesScalingFactor;
      */
      for (const tmSerLbl of Object.keys( sim.stat.timeSeries)) {
        const tmSerVarDef = sim.model.timeSeries[tmSerLbl];
        let val=0;
        // TODO: how to interpolate for implementing time series compression
        if ("objectId" in tmSerVarDef) {
          const obj = sim.objects.get( tmSerVarDef.objectId);
          val = obj[tmSerVarDef.attribute];
        } else if ("statisticsVariable" in tmSerVarDef) {
          val = sim.stat[tmSerVarDef.statisticsVariable];
        }
        if (sim.timeIncrement) {  // fixed increment time progression
          sim.stat.timeSeries[tmSerLbl].push( val);
        } else {  // next-event time progression
          sim.stat.timeSeries[tmSerLbl][0].push( sim.time);
          sim.stat.timeSeries[tmSerLbl][1].push( val);
        }
        /*
        if (oes.stat.timeSeriesCompressionSteps > 1
            && sim.step % oes.stat.timeSeriesCompressionSteps === 0) {
          oes.stat.compressTimeSeries( sim.stat.timeSeries[varName]);
        }
        */
      }
    }
    if (createLog) sendLogMsg( nextEvents);  // log initial state
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
  // send statistics to main thread
  self.postMessage({statistics: sim.stat, endSimTime: sim.time, loadEndTime: sim.loadEndTime});
}
/*******************************************************
 Run an Experiment (in a JS worker)
 ********************************************************/
sim.runExperiment = async function () {
  var exp = sim.experimentType, expRun={};
  async function runSimpleExperiment() { 
    if (sim.model.setupStatistics) sim.model.setupStatistics();
    // initialize replication statistics record
    exp.replicStat = Object.create(null);  // empty map
    for (const varName of Object.keys( sim.stat)) {
      exp.replicStat[varName] = [];  // an array per statistics variable
    }
    // run experiment scenario replications
    for (let k=0; k < exp.nmrOfReplications; k++) {
      if (exp.seeds) sim.initializeScenarioRun({seed: exp.seeds[k]});
      else sim.initializeScenarioRun();
      sim.runScenario();
      // store replication statistics
      for (const key of Object.keys( exp.replicStat)) {
        if (key !== "nodes") exp.replicStat[key][k] = sim.stat[key];
      }
      if (exp.storeExpResults) {
        try {
          await sim.db.add( "experiment_scenario_runs", {
            id: expRun.id + k + 1,
            experimentRun: expRun.id,
            outputStatistics: {...sim.stat}  // clone
          });
        } catch( err) {
          console.log('error', err.message);
        }
      }
    }
    // define exp.summaryStat to be a map for the summary statistics
    exp.summaryStat = Object.create(null);
    // aggregate replication statistics in exp.summaryStat
    for (const varName of Object.keys( exp.replicStat)) {
      exp.summaryStat[varName] = Object.create(null);  // empty map
      for (const aggr of Object.keys( math.stat.summary)) {
        const aggrF = math.stat.summary[aggr].f;
        exp.summaryStat[varName][aggr] = aggrF( exp.replicStat[varName]);
      }
    }
    // send experiment statistics to main thread
    self.postMessage({simpleExperiment: exp});
  }
  async function runParVarExperiment() {
    const valueSets = [],
          expParSlots = Object.create(null),
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
      dateTime: (new Date()).toISOString()};
    try {
      await sim.db.add("experiment_runs", expRun);
    } catch( err) {
      console.log("IndexedDB error: ", err.message);
    }
  }
  if (exp.parameterDefs?.length) runParVarExperiment();
  else runSimpleExperiment();
}

