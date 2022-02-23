// Assign variables for accessing UI elements
const formEl = document.forms["run"],
    selScenEl = formEl["selScen"],
    logCheckboxEl = formEl["log"],
    storeExpResCheckboxEl = formEl["storeExpRes"],
    selExpEl = formEl["selExp"],
    modelDescriptionEl = document.getElementById("modelDescription"),
    scenarioTitleEl = document.getElementById("scenarioTitle"),
    scenarioDescriptionEl = document.getElementById("scenarioDescription"),
    simLogTableEl = document.getElementById("simLog"),
    simInfoEl = document.getElementById("simInfo"),
    execInfoEl = document.getElementById("execInfo");
function setupUI() {
  var optionTextItems = [];
  // fill scenario choice control
  if (sim.scenarios.length > 0) {
    for (let scen of sim.scenarios) {
      optionTextItems.push( scen.title);
    }
    util.fillSelectWithOptionsFromStringList( selScenEl, optionTextItems);
  }
  // fill run choice control
  optionTextItems = ["Standalone simulation"];
  if (sim.experimentTypes.length > 0) {
    for (let expT of sim.experimentTypes) {
      optionTextItems.push( expT.title);
    }
    util.fillSelectWithOptionsFromStringList( selExpEl, optionTextItems);
  }
}
function onChangeOfScenSelect() {
  sim.scenario = sim.scenarios[parseInt( selScenEl.value)];
  scenarioTitleEl.textContent = sim.scenario.title;
  scenarioDescriptionEl.innerHTML = sim.scenario.description;
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
  var choice = selExpEl.value, data={};
  if (choice) {
    if (choice !== "0") {
      if (!sim.experimentType) sim.experimentType = sim.experimentTypes[parseInt(choice)-1];
      simInfoEl.textContent = sim.experimentType.title;
    }
  } else choice = "0";
  // Hide UI elements
  formEl.style.display = "none";  // hide selection form
  if (modelDescriptionEl) modelDescriptionEl.style.display = "none";
  if (scenarioDescriptionEl) scenarioDescriptionEl.style.display = "none";

  const nmrOfScriptFilesToLoad = 3 + sim.model.objectTypes.length +
      sim.model.eventTypes.length + sim.model.activityTypes.length;
  document.body.appendChild( util.createProgressBarEl(`Loading ${nmrOfScriptFilesToLoad} script files ...`));

  data = {simToRun: choice,
      createLog: logCheckboxEl.checked,
      storeExpRes: storeExpResCheckboxEl.checked};
  if (sim.scenarios.length > 0) {
    data.scenarioNo = parseInt( selScenEl.value)
  }

  // store start time of simulation/experiment run
  const startWorkerTime = (new Date()).getTime();
  // set up the simulation worker
  const worker = new Worker("simulation-worker.js");
  // start the simulation in the worker thread
  worker.postMessage( data);
  // on incoming messages from worker
  worker.onmessage = function (e) {
    if (e.data.step !== undefined) {  // create simulation log entry
      simLogTableEl.parentElement.style.display = "block";
      oes.ui.logSimulationStep( simLogTableEl, e.data.step, e.data.time,
          e.data.currEvtsStr, e.data.objectsStr, e.data.futEvtsStr);
    } else {
      if (document.getElementById("progress-container")) {
        document.getElementById("progress-container").remove();
      }
      if (e.data.expScenNo !== undefined) {  // parameter variation experiment
        oes.ui.showResultsFromParVarExpScenarioRun( e.data, statisticsTableEl);
      } else { // standalone simulation run or simple experiment
        const loadTime = e.data.loadEndTime - startWorkerTime,
              executionTime = (new Date()).getTime() - e.data.loadEndTime;
        // Show loading time and execution time
        execInfoEl.textContent = `Script files loading time: ${loadTime} ms, simulation execution time: ${executionTime} ms`;
        if (e.data.statistics) {  // statistics from standalone simulation run
          let duration = "";
          if (sim.scenario.durationInSimTime) duration = `${sim.scenario.durationInSimTime} ${sim.model.timeUnit}`;
          else duration = `${Math.ceil( e.data.endSimTime)} ${sim.model.timeUnit}`;
          simInfoEl.textContent = `Standalone simulation run with a simulation time/duration of ${duration}.`;
          oes.ui.showStatistics( e.data.statistics);
        } else if (e.data.simpleExperiment) {
          oes.ui.showSimpleExpResults( e.data.simpleExperiment);
        }
      }
    }
  }
}

if (sim.scenarios.length > 0) {
  // Assign scenarioNo = 0 to default scenario
  sim.scenario.scenarioNo ??= 0;
  sim.scenario.title ??= "Default Scenario";
  // Assign sim.scenarios[0] if not defined
  if (!sim.scenarios[0]) sim.scenarios[0] = sim.scenario;
} else {
  selScenEl.parentElement.style.display = "none";
  selExpEl.style.display = "none";
}
if (sim.experimentType) run();  // pre-set experiment (in simulation.js)
else setupUI();  // let the user choose
