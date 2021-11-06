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
  // make sure these lists are defined
  sim.model.objectTypes ??= [];  // ES 2020
  sim.model.eventTypes ??= [];
  // initialize the Map of all objects (accessible by ID)
  sim.objects = new Map();
  // initialize the Future Events List
  sim.FEL = new EventList();
  // initialize the map of statistics variables
  sim.stat = Object.create(null);
  // initialize the className->Class map
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
  /***********************************************************
  * Activity extensions **************************************
  ************************************************************/
  // make sure these collections are defined
  sim.model.activityTypes ??= [];
  sim.model.networkNodes ??= Object.create(null);
  sim.scenario.networkNodes ??= Object.create(null);
  if (sim.model.activityTypes.length > 0 || Object.keys( sim.model.networkNodes).length > 0) {
    // make activity classes accessible via their activity type name
    for (const actTypeName of sim.model.activityTypes) {
      sim.Classes[actTypeName] = util.getClass( actTypeName);
    }
    // create a map for resource pools (assuming there are no explicit process owners)
    sim.resourcePools = Object.create(null);
    // construct the implicitly defined AN model
    if (Object.keys( sim.model.networkNodes).length === 0) {
      // construct the event nodes of the implicitly defined AN model
      for (const evtTypeName of sim.model.eventTypes) {
        const ET = sim.Classes[evtTypeName];
        // the AN node name is the lower-cased type name suffixed by "{Evt|Act}Node"
        const nodeName = oes.getNodeNameFromEvtTypeName( evtTypeName);
        sim.model.networkNodes[nodeName] = {name: nodeName, typeName:"eVENTnODE", eventTypeName: evtTypeName};
        if (ET.successorNode) {
          sim.model.networkNodes[nodeName].successorNodeName =
              oes.getNodeNameFromActTypeName( ET.successorNode);
        }
      }
      // construct the activity nodes of the implicitly defined AN model
      for (const actTypeName of sim.model.activityTypes) {
        const AT = sim.Classes[actTypeName];
        AT.resourceRoles ??= Object.create(null);  // make sure AT.resourceRoles is defined
        // the AN node name is the lower-cased type name suffixed by "{E|A}Node"
        const nodeName = oes.getNodeNameFromActTypeName( actTypeName);
        const node = sim.model.networkNodes[nodeName] =
            {name: nodeName, typeName:"aCTIVITYnODE", activityTypeName: actTypeName};
        if (AT.waitingTimeout) node.waitingTimeout = AT.waitingTimeout;
        if (AT.successorNode) {
          if (typeof AT.successorNode === "string") {
            node.successorNodeName = oes.getNodeNameFromActTypeName( AT.successorNode);
          } else if (typeof AT.successorNode === "function") {
            node.successorNodeExpr = AT.successorNode;
          }
        }
      }
      sim.model.isAN = true;
    } else {  // networkNodes have been defined in simulation.js
      const nodeNames = Object.keys( sim.model.networkNodes);
      if ("typeName" in sim.model.networkNodes[nodeNames[0]]) {  // a PN model
        sim.model.isPN = true;
        sim.Classes["pROCESSINGoBJECT"] = pROCESSINGoBJECT;
        sim.Classes["ArrivalEventNode"] = sim.Classes["aRRIVALeVENTnODE"] = aRRIVALeVENTnODE;
        sim.Classes["EntryNode"] = sim.Classes["eNTRYnODE"] = eNTRYnODE;
        sim.Classes["ProcessingActivityNode"] = sim.Classes["pROCESSINGaCTIVITYnODE"] = pROCESSINGaCTIVITYnODE;
        sim.Classes["ProcessingNode"] = sim.Classes["pROCESSINGnODE"] = pROCESSINGnODE;
        sim.Classes["ExitNode"] = sim.Classes["eXITnODE"] = eXITnODE;
        sim.Classes["ExitNode"] = sim.Classes["eXITnODE"] = eXITnODE;
      } else {  // AN
        sim.model.isAN = true;
      }
    }
    if (sim.model.isAN) {
      sim.Classes["EventNode"] = sim.Classes["eVENTnODE"] = eVENTnODE;
      sim.Classes["ActivityNode"] = sim.Classes["aCTIVITYnODE"] = aCTIVITYnODE;
    }
    oes.createResourcePools();
    oes.setupActNetStatistics();
    if (sim.model.isPN) oes.setupProcNetStatistics();
  }
}
/*******************************************************************
 * Initialize a (standalone or experiment) scenario simulation run *
 *******************************************************************/
sim.initializeScenarioRun = function ({seed, expParSlots}={}) {
  // clear initial state data structures
  sim.objects.clear();
  sim.FEL.clear();
  sim.ongoingActivities = Object.create( null);  // a map of all ongoing activities accessible by ID
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

  /***START AN/PN extensions BEFORE-setupInitialState ********************/
  if (sim.model.isAN || sim.model.isPN) {
    oes.initializeResourcePools();
    oes.setupActNetScenario();
  }
  /***END AN/PN extensions BEFORE-setupInitialState *********************/

  // set up initial state
  if (sim.scenario.setupInitialState) sim.scenario.setupInitialState();

  /***START AN/PN extensions AFTER-setupInitialState ********************/
  if (sim.model.isAN || sim.model.isPN) {
    //oes.initializeActNetScenario();
    // complete count pool settings
    for (const poolName of Object.keys( sim.resourcePools)) {
      const resPool = sim.resourcePools[poolName];
      if (resPool.available) {  // a count pool
        // the size of a count pool is the number of initially available resources
        if (!resPool.size) resPool.size = resPool.available;
      } else {
        resPool.available = resPool.size;
      }
    }
    oes.initializeActNetStatistics();
    if (sim.model.isPN) {
      oes.initializeProcNetStatistics();
      oes.scheduleInitialArrivalEvents();  // in sim.scenario.networkNodes
    }
  }
  /***END AN/PN extensions AFTER-setupInitialState *********************/

  // schedule initial events if no initial event has been scheduled
  if (sim.FEL.isEmpty()) {
    for (const evtTypeName of sim.model.eventTypes) {
      const ET = sim.Classes[evtTypeName];
      if (ET.recurrence || ET.eventRate) {
        sim.FEL.add( new ET());
      }
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
  function sendLogMsg( currEvts) {
    let objStr = [...sim.objects.values()].map( el => el.toString()).join("|");
    if (oes.defaults.showResPoolsInLog) {
      objStr += " // "+ Object.values( sim.resourcePools).toString();
    }
    postMessage({ step: sim.step, time: sim.time,
      // convert values() iterator to array
      objectsStr: objStr,
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
    // process next (="current") events
    for (const e of nextEvents) {
      // apply event rule
      const followUpEvents = typeof e.onEvent === "function" ? e.onEvent() : [];
      // schedule follow-up events
      for (const f of followUpEvents) {
        sim.FEL.add( f);
      }
      const EventClass = e.constructor;

      /**** AN/PN extension START ****/
      // handle AN event nodes with a successor node
      if (EventClass.name !== "aRRIVAL" && e.node?.successorNode) {  //TODO: refactor such that a PN item does not occur in AN code
        const successorNode = e.node.successorNode,
              SuccAT = sim.Classes[successorNode.activityTypeName],
              succActy = new SuccAT({node: successorNode});
        // schedule successor activity
        succActy.startOrEnqueue();
      }
      /**** AN/PN extension END ****/

      // test if e is an exogenous event
      if (EventClass.recurrence || e.recurrence || EventClass.eventRate) {
        if ("createNextEvent" in e) {
          /* test if this generic approach for maxNmrOfEvents is computationally cheap enough
          let nextEvt=null;
          const maxNmrOfEvents = EventClass.maxNmrOfEvents || e.node?.maxNmrOfEvents;
          if (maxNmrOfEvents) {
            const nmrOfEvents = e.node?.nmrOfEvents;
            if (nmrOfEvents && nmrOfEvents < maxNmrOfEvents) nextEvt = e.createNextEvent();
          } else {
            nextEvt = e.createNextEvent();
          }
          */
          const nextEvt = e.createNextEvent();
          if (nextEvt) sim.FEL.add( nextEvt);
        } else {
          sim.FEL.add( new EventClass());
        }
      }
    }
    if (createLog) sendLogMsg( nextEvents);  // log initial state
    // end simulation if no time increment and no more events
    if (!sim.timeIncrement && sim.FEL.isEmpty()) break;
  }
  // compute generic statistics (incl. resource utilization)
  if (sim.model.isAN || sim.model.isPN) {
    oes.computeFinalActNetStatistics();
    if (sim.model.isPN) oes.computeFinalProcNetStatistics();
  }
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
  var exp = sim.experimentType, expRun = Object.create(null),
      compositeStatVarNames = ["nodes"],
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
    exp.replicStat.nodes = Object.create(null);  // empty map
    let throughputStatVarList = ["enqueuedActivities","waitingTimeouts","startedActivities","completedActivities"];
    let throughputStatVarListWithoutTmout = ["enqueuedActivities","startedActivities","completedActivities"];
    for (const nodeName of Object.keys( sim.stat.networkNodes)) {
      const AT = sim.Classes[sim.model.networkNodes[nodeName].activityTypeName];
      exp.replicStat.nodes[nodeName] = {
        enqueuedActivities:[], startedActivities:[], completedActivities:[],
        queueLength:{max:[]}, waitingTime:{max:[]}, cycleTime:{max:[]}
      };
      if (typeof AT.waitingTimeout === "function") {
        exp.replicStat.nodes[nodeName].waitingTimeouts = [];
      }
      //exp.replicStat.nodes[nodeName].resUtil = Object.create(null);
    }
    /***END Activity extensions BEFORE-runSimpleExperiment ********************/
    // run experiment scenario replications
    for (let k=0; k < exp.nmrOfReplications; k++) {
      if (exp.seeds) sim.initializeScenarioRun({seed: exp.seeds[k]});
      else sim.initializeScenarioRun();
      sim.runScenario();
      // store replication statistics
      for (const key of Object.keys( exp.replicStat)) {
        if (key !== "nodes") exp.replicStat[key][k] = sim.stat[key];
      }
      /***START Activity extensions AFTER-runSimpleExperimentScenario ********************/
      for (const nodeName of Object.keys( exp.replicStat.nodes)) {
        const replStatPerNode = exp.replicStat.nodes[nodeName],
              statPerNode = sim.stat.networkNodes[nodeName];
        const AT = sim.Classes[sim.model.networkNodes[nodeName].activityTypeName];
        replStatPerNode.enqueuedActivities[k] = statPerNode.enqueuedActivities;
        if (typeof AT.waitingTimeout === "function") {
          replStatPerNode.waitingTimeouts[k] = statPerNode.waitingTimeouts;
        }
        replStatPerNode.startedActivities[k] = statPerNode.startedActivities;
        replStatPerNode.completedActivities[k] = statPerNode.completedActivities;
        replStatPerNode.queueLength.max[k] = statPerNode.queueLength.max;
        replStatPerNode.waitingTime.max[k] = statPerNode.waitingTime.max;
        replStatPerNode.cycleTime.max[k] = statPerNode.cycleTime.max;
        //actStat.resUtil = Object.create(null);
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
          console.log("DB Error: ", err.message);
        }
      }
    }
    // define exp.summaryStat to be a map for the summary statistics
    exp.summaryStat = Object.create(null);
    // aggregate replication statistics in exp.summaryStat
    for (const key of Object.keys( exp.replicStat)) {
      if (key !== "nodes") {  // key is a user-defined statistics variable name
        exp.summaryStat[key] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;
          exp.summaryStat[key][aggr] = aggrF( exp.replicStat[key]);
        }
      }
    }
    /***START Activity extensions AFTER-runSimpleExperimentScenario ********************/
    exp.summaryStat.nodes = Object.create(null);  // empty map
    for (const nodeName of Object.keys( exp.replicStat.nodes)) {
      const replStatPerNode = exp.replicStat.nodes[nodeName];
      const AT = sim.Classes[sim.model.networkNodes[nodeName].activityTypeName];
      exp.summaryStat.nodes[nodeName] = Object.create(null);  // empty map
      if (typeof AT.waitingTimeout === "function") {
        statVarList = throughputStatVarList
      } else {
        statVarList = throughputStatVarListWithoutTmout
      }
      for (const statVarName of statVarList) {
        exp.summaryStat.nodes[nodeName][statVarName] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;  // an aggregation function
          // compute/store the result of aggregation over the replication value list
          exp.summaryStat.nodes[nodeName][statVarName][aggr] = aggrF( replStatPerNode[statVarName]);
        }
      }
      //Possibly TODO: also support averages
      for (const statVarName of ["queueLength","waitingTime","cycleTime"]) {
        exp.summaryStat.nodes[nodeName][statVarName] = Object.create(null);  // empty map
        for (const aggr of Object.keys( math.stat.summary)) {
          const aggrF = math.stat.summary[aggr].f;
          // compute/store the result of aggregation over the replication value list
          exp.summaryStat.nodes[nodeName][statVarName][aggr] = aggrF( replStatPerNode[statVarName].max);
        }
      }
      /*****TODO: support also the following statistics *****/
      //actStat.resUtil = Object.create(null);
    }
    /***END Activity extensions AFTER-runSimpleExperimentScenario ********************/
    // send experiment statistics to main thread
    postMessage({simpleExperiment: exp});
  }
  async function runParVarExperiment() {  // parameter variation experiment
    const valueSets = [], expParSlots = Object.create(null),
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

