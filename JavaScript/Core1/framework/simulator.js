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
  sim.scenario.title ??= "Default scenario";
  // compute derived property EventClass.participantRoles
  for (const evtTypeName of sim.model.eventTypes) {
    const EventClass = sim.Classes[evtTypeName];
    if (typeof EventClass.properties === "object") {
      EventClass.participantRoles = Object.keys( EventClass.properties).filter( function (prop) {
        // the range of a participant role must be an object type
        return sim.model.objectTypes.includes( EventClass.properties[prop].range);
      });
    }
  }
}
/*******************************************************************
 * Schedule an event or a list of events ***************************
 *******************************************************************/
sim.schedule = function (e) {
  if (!Array.isArray(e)) sim.FEL.add( e);
  else for (const evt of e) {sim.FEL.add( evt);}
}
/*******************************************************************
 * Initialize a (standalone or experiment scenario) simulation run *
 *******************************************************************/
sim.initializeScenarioRun = function ({seed, expParSlots}={}) {
  function assignModelParameters( expParSlots) {
    for (const parName of Object.keys( expParSlots)) {
      sim.model.p[parName] = expParSlots[parName];
    }
  }
  function setupInitialStateDataStructures () {
    // Add initial objects (possibly changed in UI)
    for (const objTypeName of Object.keys( sim.scenario.initialObjects || {})) {
      const C = sim.Classes[objTypeName];
      const initialObjRecords = sim.scenario.initialObjects[objTypeName];
      C.instances ??= Object.create(null);
      for (const objId of Object.keys( initialObjRecords)) {
        C.instances[objId] = new C( initialObjRecords[objId]);
      }
    }
    // Set up initial state
    if (sim.scenario.setupInitialState) sim.scenario.setupInitialState();
    // create populations per class
    for (const o of sim.objects.values()) {
      const className = o.constructor.name;
      if (className in sim.Classes) {
        const C = sim.Classes[className];
        // test if class has any reference property
        if ("properties" in C) {
          for (const propName of Object.keys(C.properties)) {
            const propDecl = C.properties[propName];
            if (propDecl.range in sim.Classes) {  // reference property
              const idRef = o[propName];
              if (!Number.isInteger( idRef)) {
                console.error(`The ${propName} value of object ${o.id} is not an integer (but ${o[propName]})`)
              } else {  // replace ID reference with object reference
                o[propName] = sim.objects.get( idRef);
              }
            }
          }
        }
        sim.Classes[className].instances ??= Object.create(null);
        sim.Classes[className].instances[o.id] = o;
      }
    }
  }
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
  if (expParSlots) assignModelParameters( expParSlots);
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
  setupInitialStateDataStructures();
  // schedule initial events if no initial event has been scheduled
  if (sim.FEL.isEmpty()) {
    for (const evtTypeName of sim.model.eventTypes) {
      const ET = sim.Classes[evtTypeName];
      if (ET.recurrence) {
        sim.FEL.add( new ET({occTime: ET.recurrence()}));
      }
    }
  }
  // get stepDuration from simulation config, or set to default value
  sim.stepDuration = sim.config.stepDuration || 0;
};
/*******************************************************
 Run a simulation scenario step
 ********************************************************/
sim.sendLogMsg = function (currEvts) {
  self.postMessage({ step: sim.step, time: sim.time,
    // convert values() iterator to array and map its elements to strings
    objectsStr: [...sim.objects.values()].map( el => el.toString()).join("|"),
    currEvtsStr: currEvts.map( el => el.toString()).join("|"),
    futEvtsStr: sim.FEL.toString()
  });
}
/*******************************************************
 Run a simulation scenario step
 ********************************************************/
sim.runScenarioStep = function ( createLog) {
  function advanceSimulationTime() {
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
  function sendVisualizationData( currentEvents) {
    const eventAppearances = sim.config.ui.obs.eventAppearances,
        objViewAttributes = sim.config.ui.obs.visualizationAttributes,
        viewSlotsPerObject = {},
        eventsToAppear = {};
    // send object view data
    for (const objViewId of Object.keys( objViewAttributes)) {
      const visAttributes = objViewAttributes[objViewId],
          obj = sim.namedObjects.get( objViewId),
          objVisSlots = {};
      if (obj) {  // a specific object to be visualized
        for (const visAttr of visAttributes) {
          const attrPathParts = visAttr.split("."),
              p1 = attrPathParts[0];
          switch (attrPathParts.length) {
            case 1:
              // create slot only if the value has changed
              if (obj[p1] !== obj[p1+"_pre"]) objVisSlots[p1] = obj[p1];
              obj[p1+"_pre"] = obj[p1];
              break;
            case 2: {
              const p2 = attrPathParts[1];
              // create slot only if the value has changed
              if (obj[p1][p2] !== obj[p1][p2+"_pre"]) objVisSlots[visAttr] = obj[p1][p2];
              obj[p1][p2+"_pre"] = obj[p1][p2];
              break;}
            case 3:
              const p2 = attrPathParts[1], p3 = attrPathParts[2];
              // create slot only if the value has changed
              if (obj[p1][p2][p3] !== obj[p1][p2][p3+"_pre"]) objVisSlots[visAttr] = obj[p1][p2][p3];
              obj[p1][p2][p3+"_pre"] = obj[p1][p2][p3];
              break;
          }
        }
        if (Object.keys( objVisSlots).length > 0) viewSlotsPerObject[objViewId] = objVisSlots;
      } else if (sim.model.objectTypes.includes( objViewId)) {
        // an object view for all instances of an object type
        for (const objIdStr of Object.keys( sim.Classes[objViewId].instances)) {
          // ...
        }
      }
    }
    // send event appearance data
    for (const e of currentEvents) {
      const ET = e.constructor;
      if (ET.name in eventAppearances) {
        eventsToAppear[ET.name] = JSON.stringify(e);
      }
    }
    if (Object.keys( viewSlotsPerObject).length > 0 && Object.keys( eventsToAppear).length > 0) {
      self.postMessage({ step: sim.step, time: sim.time, viewSlotsPerObject, eventsToAppear});
    } else if (Object.keys( viewSlotsPerObject).length > 0) {
      self.postMessage({ step: sim.step, time: sim.time, viewSlotsPerObject});
    } else if (Object.keys( eventsToAppear).length > 0) {
      self.postMessage({ step: sim.step, time: sim.time, eventsToAppear});
    }
  }
  const stepStartTime = (new Date()).getTime(),
        uia = sim.scenario.userInteractions;  // shortcut
  advanceSimulationTime();
  // extract and process next events
  const nextEvents = sim.FEL.removeNextEvents();
  // sort simultaneous events according to priority order
  if (nextEvents.length > 1) nextEvents.sort( eVENT.rank);
  // process next (=current) events
  for (let i=0; i < nextEvents.length; i++) {
    const e = nextEvents[i];
    const EventClass = e.constructor,
          eventTypeName = EventClass.name;
    // check if a user interaction has been triggered
    if (sim.config.userInteractive && uia && uia[eventTypeName]) {
      // check also the triggering event condition, if defined
      if (!uia[eventTypeName].trigEvtCondition || uia[eventTypeName].trigEvtCondition(e)) {
        // make sure that the user interaction triggering event is last in nextEvents list
        if (i === nextEvents.length - 1) {
          self.postMessage({
            userInteractionEvent: e,
            userInteractionEventType: eventTypeName
          });
          return;  // interrupt simulator & transfer control to UI
        } else {
          // swap nextEvents elements
          //util.swapArrayElements( nextEvents, i, nextEvents.length-1);
          const j = nextEvents.length - 1;
          [nextEvents[i], nextEvents[j]] = [nextEvents[j], nextEvents[i]];
        }
      }
    }
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
    // process event by applying its event rule
    const followUpEvents = e.onEvent();
    // schedule follow-up events
    sim.FEL.addEvents( followUpEvents);
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
  if (createLog) sim.sendLogMsg( nextEvents);  // log current state
  if (sim.visualize) sendVisualizationData( nextEvents);  // send visualization data
  if (sim.stepDuration) {  // loop with "setTimeout"
    if (sim.time < sim.scenario.durationInSimTime &&
        sim.step < sim.scenario.durationInSimSteps &&
        (sim.timeIncrement || !sim.FEL.isEmpty())) {  // end simulation if no more events
      // compute the time that was needed for executing this step
      const stepTime = (new Date()).getTime() - stepStartTime;
      // check if we need some delay, because of the stepDuration parameter
      const stepDelay = sim.stepDuration > stepTime ? sim.stepDuration - stepTime : 0;
      setTimeout( runScenarioStep, stepDelay);
    } else {  // end simulation
      if (sim.model.computeFinalStatistics) sim.model.computeFinalStatistics();
      // send statistics to main thread at end of simulation
      self.postMessage({statistics: sim.stat, endSimTime: sim.time, loadEndTime: sim.loadEndTime});
    }
  }
}
/*******************************************************
 Run a simulation scenario
 ********************************************************/
sim.runScenario = function (createLog) {
  const scenStartTime = (new Date()).getTime();
  if (createLog) sim.sendLogMsg([]);  // log initial state
  if (sim.stepDuration) {  // slowing down the execution with "setTimeout"
    sim.runScenarioStep( createLog);  // asynchronous simulation Loop
  } else {  // normal (synchronous) simulation Loop
    while (sim.time < sim.scenario.durationInSimTime &&
           sim.step < sim.scenario.durationInSimSteps &&
           (new Date()).getTime() - scenStartTime < sim.scenario.durationInCpuTime) {
      sim.runScenarioStep( createLog);
      // end simulation if no time increment and no more events
      if (!sim.timeIncrement && sim.FEL.isEmpty()) break;
    }
    if (sim.model.computeFinalStatistics) sim.model.computeFinalStatistics();
    // send statistics to main thread ate end of simulation
    self.postMessage({statistics: sim.stat, endSimTime: sim.time, loadEndTime: sim.loadEndTime});
  }
}
/*******************************************************
 Run a Standalone Simulation Scenario (in a JS worker)
 ********************************************************/
sim.runStandaloneScenario = function (createLog) {
  sim.initializeSimulator();
  if (!sim.scenario.randomSeed) sim.initializeScenarioRun();
  else sim.initializeScenarioRun({seed: sim.scenario.randomSeed});
  if (!sim.visualize) sim.stepDuration = 0;
  sim.runScenario( createLog);
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

