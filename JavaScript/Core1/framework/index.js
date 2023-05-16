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
    exPostStatTableEl = document.getElementById("exPostStatTbl"),
    simInfoEl = document.getElementById("simInfo"),
    execInfoEl = document.getElementById("execInfo");
// initialize the className->Class map
sim.Classes = Object.create(null);
// clone model parameters for default scenario (0)
sim.scenario.parameters = {...sim.model.p};

async function setupUI() {
  var optionTextItems = [];
  function renderInitialObjectsUI() {
    const containerEl = oes.ui.createInitialObjectsPanel(),
        objTypeTableElems = containerEl.querySelectorAll("table.EntityTableWidget");
    upfrontUiEl.appendChild( containerEl);
    for (const objTypeTableEl of objTypeTableElems) {
      objTypeTableEl.remove();
    }
    for (const objTypeName of sim.config.ui.objectTypes) {
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
  // only create model parameter UI and initial state UI, if upfrontUi container element has been defined
  if (upfrontUiEl) {
    if (sim.config.ui.modelParameters && Object.keys( sim.model.p).length > 0) {
      // create model parameter panel
      upfrontUiEl.appendChild( oes.ui.createModelParameterPanel());
      fillModelParameterPanel( sim.scenario.parameters);
    }
    // create initial state UI
    if (Array.isArray( sim.config.ui.objectTypes) && sim.config.ui.objectTypes.length > 0) {
      try {
        // initialize the map of all objects (accessible by ID)
        sim.objects = new Map();
        // initialize the Map of all objects (accessible by name)
        sim.namedObjects = new Map();
        if (sim.model.otherCodeFiles) {
          for (const ocf of sim.model.otherCodeFiles) {
            await util.loadScript( ocf + ".js");
          }
        }
        for (const objTypeName of sim.config.ui.objectTypes) {
          await util.loadScript( objTypeName + ".js");
        }
        for (const objTypeName of sim.config.ui.objectTypes)  {
          const OT = sim.Classes[objTypeName] = util.getClass( objTypeName);
          OT.instances = {};
        }
        if ("setupInitialStateForUi" in sim.scenario) sim.scenario.setupInitialStateForUi();
        renderInitialObjectsUI();
      }
      catch( error) {
        console.log( error);
      }
    }
  }
  /*********************************************************************
   Set up UIs for Visualization, Event Appearances and User Interaction
   **********************************************************************/
  if (sim.config.visualize) {
    const logLabelEl = document.forms["run"].elements["log"].parentElement,
          visLabelEl = document.createElement("label"),
          stepDurLabelEl = document.createElement("label");
    visLabelEl.innerHTML = "Visualize <input name='vis' type='checkbox' checked='checked'/>";
    logLabelEl.before( visLabelEl);
    stepDurLabelEl.innerHTML = `Step duration (ms): <input name='stepDur' type='number' value='${sim.config.stepDuration}' min="100" step="100"/>`;
    stepDurLabelEl.lastElementChild.style.width = "4em";  // size of input field
    logLabelEl.before( stepDurLabelEl);
    await oes.ui.setupVisualization();
    if (sim.config.ui.obs.eventAppearances &&
        Object.keys( sim.config.ui.obs.eventAppearances).length > 0) {
      oes.ui.setupEventAppearances();
    }
    if (sim.scenario.userInteractions &&
        Object.keys( sim.scenario.userInteractions).length > 0 &&
        sim.config.userInteractive) {
      oes.ui.setupUserInteraction();
    }
  } else sim.config.userInteractive = false;  // no visualization implies no usr interaction
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
    logCheckboxEl.parentElement.parentElement.style.display = "block";
    storeExpResCheckboxEl.parentElement.parentElement.style.display = "none";
  } else {
    logCheckboxEl.parentElement.parentElement.style.display = "none";
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
  const choice = parseInt( selExpEl.value),
        visualizeCheckbox = document.forms["run"].elements["vis"],
        visualize = visualizeCheckbox?.checked,
        visCanvasEl = document.getElementById("visCanvas"),
        initialObjects={};
  if (!isNaN( choice)) {
    if (choice > 0) {
      if (!sim.experimentType) sim.experimentType = sim.experimentTypes[choice-1];
      simInfoEl.textContent = sim.experimentType.title;
      exPostStatTableEl.querySelector("caption").textContent = "Experiment Results";
    } else {
      simInfoEl.textContent = `Standalone scenario run with a simulation time/duration of ${sim.scenario.durationInSimTime} ${sim.model.timeUnit}.`;
      if (Object.keys( sim.stat).length > 0 && exPostStatTableEl) {
        exPostStatTableEl.querySelector("caption").textContent = "Statistics";
      }
    }
  }
  // Hide UI elements
  if (modelDescriptionEl) modelDescriptionEl.style.display = "none";
  if (scenarioDescriptionEl) scenarioDescriptionEl.style.display = "none";
  if (upfrontUiEl) upfrontUiEl.style.display = "none";
  else formEl.style.display = "none";  // hide select&run form
  if (!visualize && visCanvasEl) visCanvasEl.style.display = "none";  // hide visualization canvas

  sim.model.setupStatistics();
  if (sim.experimentType) {
    if (!sim.experimentType.parameterDefs) {
      oes.ui.createSimpleExpResultsTableHead( sim.stat, exPostStatTableEl);
    } else {
      oes.ui.createParVarExpResultsTableHead( sim.stat, exPostStatTableEl);
    }
  }
  for (const objTypeName of Object.keys( sim.Classes)) {
    const C = sim.Classes[objTypeName];
    if (!("instances" in C)) continue;  // skip abstract classes
    initialObjects[objTypeName] = C.instances;
    // convert object references to ID references
    for (const objId of Object.keys( C.instances)) {
      const obj = C.instances[objId];
      for (const p of Object.keys( obj)) {
        const v = obj[p];
        // is v an instance of an object class?
        if (typeof v === "object" && v.constructor.name in Object.keys( sim.Classes)) {
          obj[p] = v.id;  // assign ID reference
        }
      }
    }
  }
  const nmrOfScriptFilesToLoad = 4 + sim.model.objectTypes.length + sim.model.eventTypes.length;
  document.body.appendChild( dom.createProgressBarEl(`Loading ${nmrOfScriptFilesToLoad} script files ...`));

  // set up the simulation worker
  const worker = new Worker("simulation-worker.js");
  const data = {simToRun: choice,  // either standalone sim or experiment
    scenParams: sim.scenario.parameters,
    visualize: choice === 0 ? visualize : false,
    createLog: logCheckboxEl.checked,
    storeExpRes: storeExpResCheckboxEl.checked
  };
  if (Object.keys( initialObjects).length > 0) data.initialObjects = initialObjects;
  if (sim.scenarios.length > 0) data.scenarioNo = parseInt( selScenEl.value);
  if (sim.config.ui.obs.visualizationAttributes) {
    data.visualizationAttributes = sim.config.ui.obs.visualizationAttributes;
  }
  // store start time of simulation/experiment run
  const startWorkerTime = (new Date()).getTime();
  // start the simulation in the worker thread
  worker.postMessage( data);

  // on incoming messages from worker
  worker.onmessage = function (e) {
    if (e.data.step !== undefined && !e.data.viewSlotsPerObject
        && !e.data.eventsToAppear) {  // create log entry
      simLogTableEl.parentElement.style.display = "block";
      oes.ui.logSimulationStep( simLogTableEl, e.data.step, e.data.time,
          e.data.currEvtsStr, e.data.objectsStr, e.data.futEvtsStr);
    } else if (e.data.dropProgressContainer) { //setProgressBarText( txt)
      if (document.getElementById("progress-container")) {
        document.getElementById("progress-container").remove();
      }
    } else if (e.data.progressBarText) {
      dom.setProgressBarText( e.data.progressBarText);
    } else if ("eventsToAppear" in e.data || "viewSlotsPerObject" in e.data) {
      sim.time = e.data.time;
      if ("viewSlotsPerObject" in e.data) oes.ui.visualizeStep( e.data.viewSlotsPerObject);
      if ("eventsToAppear" in e.data) oes.ui.playEventAnimation( e.data.eventsToAppear);
    } else if ("userInteractionEvent" in e.data) {
      const uiViewModel = sim.scenario.userInteractions[e.data.userInteractionEventType];
      for (const outFldName of Object.keys( uiViewModel.outputFields)) {
        const fldEl = uiViewModel.dataBinding[outFldName],
              val = uiViewModel.fieldValues[outFldName];
        if (typeof val === "function") fldEl.value = val();
        else fldEl.value = val || "";
      }
      uiViewModel.domElem.style.display = "block";
    } else {  // end of simulation/experiment
      if (document.getElementById("progress-container")) {
        document.getElementById("progress-container").remove();
      }
      if (e.data.expScenNo !== undefined) {  // parameter variation experiment
        oes.ui.showResultsFromParVarExpScenarioRun( e.data, exPostStatTableEl);
      } else {
        const loadTime = e.data.loadEndTime - startWorkerTime,
              executionTime = (new Date()).getTime() - e.data.loadEndTime;
        // Show loading time and execution time
        execInfoEl.textContent = `Script files loading time: ${loadTime} ms, simulation execution time: ${executionTime} ms. Reload the page [Ctrl-R] to start over.`;
        if (e.data.statistics) {  // statistics from standalone scenario run
          oes.ui.showStatistics( e.data.statistics, exPostStatTableEl);
        } else if (e.data.simpleExperiment) {
          oes.ui.showSimpleExpResults( e.data.simpleExperiment, exPostStatTableEl);
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
else setupUI();
