// Assign variables for accessing UI elements
const formEl = document.forms["run"],
    selScenEl = formEl["selScen"],
    logCheckboxEl = formEl["log"],
    storeExpResCheckboxEl = formEl["storeExpRes"],
    selExpEl = formEl["selExp"],
    simLogTableEl = document.getElementById("simLog"),
    statisticsTableEl = document.getElementById("statisticsTbl"),
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
  optionTextItems = ["Standalone scenario"];
  if (sim.experimentTypes.length > 0) {
    for (let expT of sim.experimentTypes) {
      optionTextItems.push( expT.title);
    }
    util.fillSelectWithOptionsFromStringList( selExpEl, optionTextItems);
  }
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
      statisticsTableEl.querySelector("caption").textContent = "Experiment Results";
    } else {
      simInfoEl.textContent = `Standalone scenario run with a simulation time/duration of ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`;
      statisticsTableEl.querySelector("caption").textContent = "Statistics";
    }
  }
  // Hide UI elements
  formEl.style.display = "none";  // hide selection form
  sim.model.setupStatistics();
  if (sim.experimentType) {
    if (!sim.experimentType.parameterDefs) {
      oes.ui.createSimpleExpResultsTableHead( sim.stat, statisticsTableEl);
    } else {
      oes.ui.createParVarExpResultsTableHead( sim.stat, statisticsTableEl);
    }
  }
  data = {simToRun: selExpEl.value,
      createLog: logCheckboxEl.checked,
      storeExpRes: storeExpResCheckboxEl.checked};
  if (sim.scenarios.length > 0) {
    data.scenarioNo = parseInt( selScenEl.value)
  }
  // store start time of simulation/experiment run
  const simStartTime = (new Date()).getTime();
  // set up the simulation worker
  const worker = new Worker("simulation-worker.js");
  // start the simulation in the worker thread
  worker.postMessage( data);
  // on incoming messages from worker
  worker.onmessage = function (e) {
    if (e.data.step) {  // create log entry
      simLogTableEl.parentElement.style.display = "block";
      oes.ui.logSimulationStep( simLogTableEl, e.data.step, e.data.time,
          e.data.objectsStr, e.data.eventsStr);
    } else if (e.data.expScenNo !== undefined) {  // parameter variation experiment
      oes.ui.showResultsFromParVarExpScenarioRun( e.data, statisticsTableEl);
    } else {
      let simEndTime = (new Date()).getTime() - simStartTime;
      // Show execution time
      execInfoEl.textContent = `Execution time: ${simEndTime} ms`;
      if (e.data.statistics) {  // statistics from standalone scenario run
        oes.ui.showStatistics( e.data.statistics, statisticsTableEl);
      } else if (e.data.simpleExperiment) {
        oes.ui.showSimpleExpResults( e.data.simpleExperiment, statisticsTableEl);
      }
    }
  }
}

if (sim.scenarios.length > 0) {
  // Assign sim.scenarios[0] if not defined
  if (!sim.scenarios[0]) sim.scenarios[0] = sim.scenario;
} else {
  selScenEl.parentElement.style.display = "none";
}
if (sim.experimentType) run();  // pre-set experiment (in simulation.js)
else setupUI();  // let the user choose
