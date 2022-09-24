// Assign variables for accessing UI elements
const formEl = document.forms["run"],
    selScenEl = formEl["selScen"],
    logCheckboxEl = formEl["log"],
    storeExpResCheckboxEl = formEl["storeExpRes"],
    selExpEl = formEl["selExp"],
    modelDescriptionEl = document.getElementById("modelDescription"),
    scenarioTitleEl = document.getElementById("scenarioTitle"),
    scenarioDescriptionEl = document.getElementById("scenarioDescription"),
    upfrontUiEl = document.getElementById("upfrontUI"),
    simLogTableEl = document.getElementById("simLog"),
    statisticsTableEl = document.getElementById("statisticsTbl"),
    simInfoEl = document.getElementById("simInfo"),
    execInfoEl = document.getElementById("execInfo");
// initialize the className->Class map
sim.Classes = Object.create(null);
// clone model parameters for default scenario (0)
sim.scenario.parameters = {...sim.model.p};

function setupUI() {
  var optionTextItems = [];
  function renderInitialObjectsUI() {
    const containerEl = oes.ui.createInitialObjectsPanel(),
        objTypeTableElems = containerEl.querySelectorAll("table.EntityTableWidget");
    upfrontUiEl.appendChild( containerEl);
    for (const objTypeTableEl of objTypeTableElems) {
      objTypeTableEl.remove();
    }
    for (const objTypeName of sim.ui.objectTypes) {
      const OT = sim.Classes[objTypeName];
      let entityTblWidget=null;
      if (!OT || OT.isAbstract) continue;
      try {
        entityTblWidget = new EntityTableWidget( OT);
      } catch (e) {
        console.error( e);
      }
      if (entityTblWidget) containerEl.appendChild( entityTblWidget);
    }
  }
  // fill scenario choice control
  if (sim.scenarios.length > 0) {
    for (let scen of sim.scenarios) {
      optionTextItems.push( scen.title);
    }
    util.fillSelectWithOptionsFromStringList( selScenEl, optionTextItems);
  }
  // fill run choice control
  optionTextItems = ["Standalone scenario"];
  if (sim.experimentTypes.length > 0) {
    for (let expT of sim.experimentTypes) {
      optionTextItems.push( expT.title);
    }
    util.fillSelectWithOptionsFromStringList( selExpEl, optionTextItems);
  }
  // only create model parameter UI and initial state UI, if upfrontUi container element has been defined
  if (upfrontUiEl) {
    if (sim.config.ui.modelParameters && Object.keys( sim.model.p).length > 0) {
      // create model parameter panel
      upfrontUiEl.appendChild( oes.ui.createModelParameterPanel());
      fillModelParameterPanel( sim.scenario.parameters);
    }
    // create initial state UI
    if (Array.isArray( sim.ui.objectTypes) && sim.ui.objectTypes.length > 0) {
      if ("setupInitialStateForUi" in sim.scenario) sim.scenario.setupInitialStateForUi();
      renderInitialObjectsUI();
    }
  }
}
function fillModelParameterPanel( record) {
  const containerEl = document.getElementById("ModelParameterUI"),
      modParTableEl = containerEl?.querySelector("table.SingleRecordTableWidget");
  // drop the <table> child element
  if (modParTableEl) modParTableEl.remove();
  if (containerEl) containerEl.appendChild( new SingleRecordTableWidget( record));
}
function onChangeOfScenSelect() {
  const scenarioNo = parseInt( selScenEl.value);
  sim.scenario = sim.scenarios[scenarioNo];
  scenarioTitleEl.textContent = sim.scenario.title;
  scenarioDescriptionEl.innerHTML = sim.scenario.description;
  if (scenarioNo > 0) {
    const changedParams = Object.keys( sim.scenario.parameters || {});
    // fill up scenario parameters
    for (const paramName of Object.keys( sim.model.p)) {
      if (!changedParams.includes( paramName)) {
        sim.scenario.parameters[paramName] = sim.model.p[paramName];
      }
    }
  } else {  // default scenario
    sim.scenario.parameters = {...sim.model.p};  // clone model parameters
  }
  if (upfrontUiEl) fillModelParameterPanel( sim.scenario.parameters);
}
function onChangeOfExpSelect() {
  if (selExpEl.value === "0") {
    logCheckboxEl.parentElement.style.display = "block";
    storeExpResCheckboxEl.parentElement.parentElement.style.display = "none";
  } else {
    logCheckboxEl.parentElement.style.display = "none";
    // allow choosing "store results" only if browser supports IndexedDB
    if ('indexedDB' in self) {
      storeExpResCheckboxEl.parentElement.parentElement.style.display = "block";
    }
  }
}
async function exportExperResults() {
  var text=""
  // set default export separator
  const exportSep = sim.config?.exportSep || ";";
  // establish DB connection
  if (!sim.db) {
    try {
      sim.db = await idb.openDB( sim.model.name, 1, {
        upgrade(db) {
          db.createObjectStore( "experiment_runs", {keyPath: "id", autoIncrement: true});
          db.createObjectStore( "experiment_scenarios", {keyPath: "id", autoIncrement: true});
          db.createObjectStore( "experiment_scenario_runs", {keyPath: "id", autoIncrement: true});
        }
      });
    } catch( err) {
      console.log("IndexedDB error: ", err.message);
    }
  }
  if (!sim.db.objectStoreNames.contains("experiment_runs")) {
    execInfoEl.textContent = "There are no experiment records!";
    return;
  }
  const experRunRecords = await sim.db.getAll("experiment_runs");
  if (experRunRecords.length === 0) {
    execInfoEl.textContent = "There are no experiment records!";
    return;
  }
  // Export data about experiment_runs
  text = ["id","experimentType","baseScenarioNo","dateTime","parameters"].join( exportSep) + "\n";
  for (const rec of experRunRecords) {
    let row=[];  // Definitions
    let simExper = sim.experimentTypes[rec.experimentType];
    row.push( rec.id);
    row.push( rec.experimentType);
    row.push( rec.baseScenarioNo);
    row.push( rec.dateTime);
    if (simExper.parameterDefs) {
      let parNames = simExper.parameterDefs.map( defRec => defRec.name);
      row.push( parNames.join("/"));
    }
    text += row.join( exportSep) + "\n";
  }
  util.generateTextFile( "experiment_runs", text);
  // Export data about experiment_scenarios
  const experScenRecords = await sim.db.getAll("experiment_scenarios");
  if (experScenRecords.length === 0) {
    console.log("There are no 'experiment_scenarios' records!");
  } else {
    text = ["id","experimentRun","experimentScenarioNo","parameterValueCombination"].join( exportSep) + "\n";
    for (const rec of experScenRecords) {
      let row=[];  // Definitions
      let parValues = rec.parameterValueCombination;
      row.push( rec.id);
      row.push( rec.experimentRun);
      row.push( rec.experimentScenarioNo);
      row.push( parValues.join("/"));
      text += row.join( exportSep) + "\n";
    }
    util.generateTextFile( "experiment_scenarios", text);
  }
  // Export data about experiment_scenario_runs
  const experScenRunRecords = await sim.db.getAll("experiment_scenario_runs");
  if (experScenRunRecords.length === 0) {
    console.log("There are no 'experiment_scenario_runs' records!");
  } else {
    text = ["id","experimentRun","experimentScenarioNo"].
        concat( Object.keys(experScenRunRecords[0].outputStatistics)).join( exportSep) + "\n";
    for (const rec of experScenRunRecords) {
      let row=[];  // Definitions
      row.push( rec.id);
      row.push( rec.experimentRun);
      row.push( rec.experimentScenarioNo);
      row.push( ...Object.values(rec.outputStatistics));
      text += row.join( exportSep) + "\n";
    }
    util.generateTextFile( "experiment_scenario_runs", text);
  }
}
async function clearDatabase() {
  await idb.deleteDB( sim.model.name);
}
function run() {
  var choice = parseInt( selExpEl.value), data={}, initialObjects={};
  if (!isNaN( choice)) {
    if (choice > 0) {
      if (!sim.experimentType) sim.experimentType = sim.experimentTypes[parseInt(choice)-1];
      simInfoEl.textContent = sim.experimentType.title;
      statisticsTableEl.querySelector("caption").textContent = "Experiment Results";
    } else {
      simInfoEl.textContent = `Standalone scenario run with a simulation time/duration of ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`;
      if (Object.keys( sim.stat).length > 0 && statisticsTableEl) {
        statisticsTableEl.querySelector("caption").textContent = "Statistics";
      }
    }
  }
  // Hide UI elements
  if (modelDescriptionEl) modelDescriptionEl.style.display = "none";
  if (scenarioDescriptionEl) scenarioDescriptionEl.style.display = "none";
  if (upfrontUiEl) upfrontUiEl.style.display = "none";
  else formEl.style.display = "none";  // hide select&run form

  sim.model.setupStatistics();
  if (sim.experimentType) {
    if (!sim.experimentType.parameterDefs) {
      oes.ui.createSimpleExpResultsTableHead( sim.stat, statisticsTableEl);
    } else {
      oes.ui.createParVarExpResultsTableHead( sim.stat, statisticsTableEl);
    }
  }
  data = {simToRun: choice,  // either standalone sim or experiment
      scenParams: sim.scenario.parameters,
      createLog: logCheckboxEl.checked,
      storeExpRes: storeExpResCheckboxEl.checked};
  for (const objTypeName of Object.keys( sim.Classes)) {
    initialObjects[objTypeName] = sim.Classes[objTypeName].instances;
  }
  if (Object.keys( initialObjects).length > 0) data.initialObjects = initialObjects;
  if (sim.scenarios.length > 0) {
    data.scenarioNo = parseInt( selScenEl.value)
  }
  const nmrOfScriptFilesToLoad = 4 + sim.model.objectTypes.length + sim.model.eventTypes.length;
  document.body.appendChild( util.createProgressBarEl(`Loading ${nmrOfScriptFilesToLoad} script files ...`));

  // store start time of simulation/experiment run
  const startWorkerTime = (new Date()).getTime();
  // set up the simulation worker
  const worker = new Worker("simulation-worker.js");
  // start the simulation in the worker thread
  worker.postMessage( data);

  // on incoming messages from worker
  worker.onmessage = function (e) {
    if (e.data.step !== undefined) {  // create log entry
      simLogTableEl.parentElement.style.display = "block";
      oes.ui.logSimulationStep( simLogTableEl, e.data.step, e.data.time,
          e.data.currEvtsStr, e.data.objectsStr, e.data.futEvtsStr);
    } else {
      if (document.getElementById("progress-container")) {
        document.getElementById("progress-container").remove();
      }
      if (e.data.expScenNo !== undefined) {  // parameter variation experiment
        oes.ui.showResultsFromParVarExpScenarioRun( e.data, statisticsTableEl);
      } else {
        const loadTime = e.data.loadEndTime - startWorkerTime,
            executionTime = (new Date()).getTime() - e.data.loadEndTime;
        // Show loading time and execution time
        execInfoEl.textContent = `Script files loading time: ${loadTime} ms, simulation execution time: ${executionTime} ms. Reload the page [Ctrl-R] to start over.`;
        if (e.data.statistics) {  // statistics from standalone scenario run
          oes.ui.showStatistics( e.data.statistics, statisticsTableEl);
        } else if (e.data.simpleExperiment) {
          oes.ui.showSimpleExpResults( e.data.simpleExperiment, statisticsTableEl);
        }
      }
    }
  }
}
/**************************************************************/
if ("timeSeries" in sim.model &&
    Object.keys( sim.model.timeSeries).length > 0 &&
    typeof Chartist === "undefined") {
  util.loadScript( "../lib/ui/chartist.js");
  util.loadCSS( "../css/chartist.css");
}
if (sim.scenarios.length > 0) {
  // Assign scenarioNo = 0 to default scenario
  sim.scenario.scenarioNo ??= 0;
  sim.scenario.title ??= "Default scenario";
  // Assign sim.scenarios[0] if not defined
  if (!sim.scenarios[0]) sim.scenarios[0] = sim.scenario;
} else {
  selScenEl.parentElement.style.display = "none";
}
if (sim.experimentType) run();  // pre-set experiment (in simulation.js)
else if (sim.ui?.objectTypes) {
  /*************************************************
   Set up the initial objects UI
   *************************************************/
  let loadExpressions=[];
  for (const objTypeName of sim.ui.objectTypes) {
    loadExpressions.push( util.loadScript( objTypeName + ".js"));
  }
  Promise.all( loadExpressions).then( function () {
    for (const objTypeName of sim.ui.objectTypes)  {
      const OT = sim.Classes[objTypeName] = util.getClass( objTypeName);
      OT.instances = {};
    }
    setupUI();
  }).catch( function (error) {console.log( error);});
} else {
  setupUI();
}