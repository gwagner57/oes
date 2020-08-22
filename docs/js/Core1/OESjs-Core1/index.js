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
    dom.fillSelectWithOptionsFromStringList( selScenEl, optionTextItems);
  }
  // fill run choice control
  optionTextItems = ["Standalone scenario"];
  if (sim.experimentTypes.length > 0) {
    for (let expT of sim.experimentTypes) {
      optionTextItems.push( expT.title);
    }
    dom.fillSelectWithOptionsFromStringList( selExpEl, optionTextItems);
  }
}
function onChangeOfExpSelect() {
  if (selExpEl.value === "0") {
    logCheckboxEl.parentElement.style.display = "block";
    storeExpResCheckboxEl.parentElement.style.display = "none";
  } else {
    logCheckboxEl.parentElement.style.display = "none";
    // allow choosing "store results" only if browser supports IndexedDB
    if ('indexedDB' in self) {
      storeExpResCheckboxEl.parentElement.style.display = "block";
    }
  }
}
function run() {
  var choice = selExpEl.value, data={};
  if (choice) {
    if (choice !== "0") {
      if (!sim.experimentType) sim.experimentType = sim.experimentTypes[parseInt(choice)-1];
      simInfoEl.textContent = sim.experimentType.title;
      statisticsTableEl.querySelector("caption").textContent = "Experiment Results";
    } else {
      simInfoEl.textContent = "Standalone scenario run";
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
