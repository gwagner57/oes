// Assign variables for accessing UI elements
const formEl = document.forms["run"],
    selectEl = formEl["selExp"],
    statisticsTableEl = document.getElementById("statisticsTbl"),
    simInfoEl = document.getElementById("simInfo"),
    execInfoEl = document.getElementById("execInfo");
function setupUI() {
  var optionTextItems = ["Standalone scenario"];
  if (Array.isArray( sim.experimentTypes)) {
    for (let expT of sim.experimentTypes) {
      optionTextItems.push( expT.title);
    }
  }
  dom.fillSelectWithOptionsFromStringList( selectEl, optionTextItems);
}
function run() {
  var choice = selectEl.value, expKind="";
  if (choice) {
    if (choice !== "0") {
      if (!sim.experimentType) sim.experimentType = sim.experimentTypes[parseInt(choice)-1];
    }
  }
  sim.model.setupStatistics();
  if (sim.experimentType) {
    if (!sim.experimentType.parameterDefs) createSimpleExpResultsTableHead( sim.stat, statisticsTableEl);
    else createParVarExpResultsTableHead( sim.stat, statisticsTableEl);
  }
  // store start time of simulation/experiment run
  const simStartTime = (new Date()).getTime();
  // set up the simulation worker
  const worker = new Worker("simulation-worker.js");
  // start the simulation in the worker thread
  worker.postMessage({simToRun: selectEl.value});
  // on incoming messages from worker
  worker.onmessage = function (e) {
    if (e.data.simpleExperiment) {
      let simEndTime = (new Date()).getTime() - simStartTime;
      // Log experiment execution time
      execInfoEl.textContent = `Experiment execution time: ${simEndTime} ms`;
      // Create subheading
      simInfoEl.textContent = e.data.simpleExperiment.title;
      showSimpleExpResults( e.data.simpleExperiment, statisticsTableEl);
    } else if (e.data.expScenNo !== undefined) {  // parameter variation experiment
      showResultsFromParVarExpScenarioRun( e.data, statisticsTableEl);
    } else if (e.data.statistics) {  // statistics from standalone scenario run
      showStatistics( e.data.statistics, statisticsTableEl);
    }
  }
}
if (sim.experimentType) {
  document.getElementById("run").style.display = "none";  // hide selection form
  run();
} else setupUI();  // let the user choose
