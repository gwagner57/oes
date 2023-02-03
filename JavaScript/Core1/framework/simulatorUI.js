/**********************************************************************
 *** Create UI namespace objects **************************************
 **********************************************************************/
oes.ui = Object.create(null);
oes.ui.obs = Object.create(null);
oes.ui.obs.SVG = Object.create(null);
oes.ui.obs.canvas = Object.create(null);

sim.config.ui.animations = {};

/*******************************************************
 UI for modifying model parameter values
 *******************************************************/
oes.ui.createModelParameterPanel = function () {
  const uiPanelEl = util.createExpandablePanel({id:"ModelParameterUI",
    heading: "Model Parameters", borderColor:"aqua",
    hint: "Modify model parameter values"
  });
  return uiPanelEl;
};
/*******************************************************
 UI for creating/modifying/deleting initial state objects
 *******************************************************/
oes.ui.createInitialObjectsPanel = function () {
  const uiPanelEl = util.createExpandablePanel({id:"InitialStateObjectsUI",
    heading: "Initial Objects", borderColor:"aqua",
    hint: "Create, modify or delete objects of the initial state"
  });
  return uiPanelEl;
};
/*******************************************************
 Create a simulation log entry (table row)
 ********************************************************/
oes.ui.logSimulationStep = function (simLogTableEl, step, time, currEvtsStr, objectsStr, futEvtsStr) {
  const decPl = oes.defaults.simLogDecimalPlaces,
        rowEl = simLogTableEl.insertRow();  // create new table row
  rowEl.insertCell().textContent = String( step);
  rowEl.insertCell().textContent = String( math.round( time, decPl));
  rowEl.insertCell().textContent = currEvtsStr.split("|").map( str => str.substring(0, str.indexOf("@"))).join(", ");
  rowEl.insertCell().textContent = objectsStr.split("|").join(", ");
  rowEl.insertCell().textContent = futEvtsStr;
}
/*******************************************************
 Display the standalone scenario statistics
 ********************************************************/
oes.ui.showStatistics = function (stat, tableEl) {
  const decPl = oes.defaults.expostStatDecimalPlaces,
        tbodyEl = tableEl.tBodies[0];
  const showTimeSeries = "timeSeries" in stat;
  for (const varName of Object.keys( stat)) {
    // skip pre-defined and unselected statistics variables
    if (["table","timeSeries"].includes( varName) ||
        sim.config.ui.stat.excludeFromTable?.includes( varName)) continue;
    const rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = varName;
    rowEl.insertCell().textContent = math.round( stat[varName], decPl);
  }
  if (showTimeSeries) {
    const timeSeriesChartContainerEl = document.createElement("div");
    timeSeriesChartContainerEl.id = "time-series-chart";
    document.getElementById("simInfo").insertAdjacentElement(
        "afterend", timeSeriesChartContainerEl);
    const timeSeriesLabels = Object.keys( stat.timeSeries),
        firstTmSerLbl = timeSeriesLabels[0],
        firstTmSer = stat.timeSeries[firstTmSerLbl];
    const legendLabels=[], chartSeries=[];
    let dataT = [];
    if (Array.isArray( firstTmSer[0])) {  // next-event time progression
      dataT = firstTmSer[0];  // time series timepoints
    } else {  // fixed-increment time progression
      for (let i=0; i < firstTmSer.length; i++) {
        dataT.push(i * sim.timeIncrement);
      }
    }
    for (const tmSerLbl of timeSeriesLabels) {
      legendLabels.push( tmSerLbl);
      if (sim.timeIncrement) {  // fixed-increment time progression
        dataY = stat.timeSeries[tmSerLbl];
      } else {  // next-event time progression
        dataY = stat.timeSeries[tmSerLbl][1];
      }
      chartSeries.push({name: tmSerLbl, data: dataY});
    }
    const chart = new Chartist.Line("#time-series-chart", {
          labels: dataT,
          series: chartSeries
        }, {
          showPoint: false,
          lineSmooth: true,
          width: "90%", height: "400px",
          axisX: {
            labelInterpolationFnc: function ( value, index ) {
              const interval = parseInt( dataT.length / 10 );
              return index % interval === 0 ? value : null;
            }
          },
          axisY: {
            //offset: 60,
            /*
            labelInterpolationFnc: function ( value ) {
              return value.toFixed( 2 );
            }
            */
          },
          plugins: [
            // display chart legend
            Chartist.plugins.legend({
              legendNames: legendLabels
            })
          ]}
    );
  }
}
/*********************************************************************
 Create the table head for simple experiment results
 **********************************************************************/
oes.ui.createSimpleExpResultsTableHead = function (stat, tableEl)  {
  var N = Object.keys(stat).length, statVarHeadings="", colHeadingsRow="";
  let theadEl = tableEl.createTHead();
  Object.keys(stat).forEach( function (v) {
    statVarHeadings += "<th>"+ v +"</th>";
  })
  colHeadingsRow = `<tr><th rowspan='2'>Replication</th><th colspan='${N}'>Statistics</th></tr>`;
  theadEl.innerHTML = colHeadingsRow + "<tr>"+ statVarHeadings +"</tr>";
  tableEl.style.overflowX = "auto";  // horizontal scrolling
}
/*********************************************************************
 Show the results of a simple experiment
 **********************************************************************/
oes.ui.showSimpleExpResults = function (exp, tableEl) {
  var nmrOfRepl = exp.nmrOfReplications, rowEl=null;
  var tbodyEl = tableEl.tBodies[0];
  for (let i=0; i < nmrOfRepl; i++) {
    rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = String(i+1);  // replication No
    Object.keys( exp.replicStat).forEach( function (varName) {
      var decPl = oes.defaults.expostStatDecimalPlaces,
          val = exp.replicStat[varName][i];
      rowEl.insertCell().textContent = math.round( val, decPl);
    });
  }
  // create footer with summary statistics
  Object.keys( math.stat.summary).forEach( function (aggr) {
    rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = math.stat.summary[aggr].label;
    Object.keys( exp.summaryStat).forEach( function (varName) {
      var decPl = oes.defaults.expostStatDecimalPlaces,
          val = exp.summaryStat[varName][aggr];
      rowEl.insertCell().textContent = math.round( val, decPl);
    });
  });
}
/*********************************************************************
 Create the table head for parameter variation experiment results
 **********************************************************************/
oes.ui.createParVarExpResultsTableHead = function (stat, tableEl)  {
  var N = Object.keys( stat).length, statVarHeadings="", colHeadingsRow="";
  let theadEl = tableEl.createTHead();
  Object.keys( stat).forEach( function (v) {
    statVarHeadings += "<th>"+ v +"</th>";
  })
  colHeadingsRow = `<tr><th rowspan='2'>Experiment scenario</th><th rowspan='2'>Parameter values</th><th colspan='${N}'>Statistics</th></tr>`;
  theadEl.innerHTML = colHeadingsRow + "<tr>"+ statVarHeadings +"</tr>";
  tableEl.style.overflowX = "auto";  // horizontal scrolling
}
/*********************************************************************
 Show the results of a parameter variation experiment
 **********************************************************************/
oes.ui.showResultsFromParVarExpScenarioRun = function (data, tableEl) {
  const tbodyEl = tableEl.tBodies[0],
        rowEl = tbodyEl.insertRow();  // create new table row
  rowEl.insertCell().textContent = data.expScenNo;
  rowEl.insertCell().textContent = data.expScenParamValues.toString();
  Object.keys( data.expScenStat).forEach( function (v) {
    const statVal = data.expScenStat[v],
          decPl = oes.defaults.expostStatDecimalPlaces;
    rowEl.insertCell().textContent = math.round( statVal, decPl);
  });
}
/*********************************************************************
 Load the simulation model code
 **********************************************************************/
oes.ui.loadSimulationModelCode = async function () {
  if (sim.model.otherCodeFiles) {
    for (const fn of sim.model.otherCodeFiles) {
      await util.loadScript( fn + ".js");
    }
  }
  if (sim.model.objectTypes) {
    for (const fn of sim.model.objectTypes) {
      await util.loadScript( fn + ".js");
    }
  }
  if (sim.model.eventTypes) {
    for (const fn of sim.model.eventTypes) {
      await util.loadScript( fn + ".js");
    }
  }
  if (sim.model.activityTypes) {
    for (const fn of sim.model.activityTypes) {
      await util.loadScript( fn + ".js");
    }
  }
}


/*******************************************************
 Set up the Visualization
 *******************************************************/
oes.ui.setupVisualization = async function () {
  const insertPointEl = document.querySelector("#upfrontUI");
  if (sim.model.space) {
    oes.ui.setupSpaceView();
  } else if (sim.config.ui.obs.type) {  // visualizing a non-spatial model
    const objViews = sim.config.ui.obs.objectViews;
    if (objViews) {
      const visAttribs = sim.config.ui.obs.visualizationAttributes = {};
      for (const objViewId of Object.keys(objViews)) {
        const objView = objViews[objViewId];
        // append the slots of objView.visualizationAttributes to visAttribs
        visAttribs[objViewId] = objView.visualizationAttributes;
      }
    }
    switch (sim.config.ui.obs.type) {
    case "SVG":
      oes.ui.setupCanvas = oes.ui.obs.SVG.setup;
      oes.ui.resetCanvas = oes.ui.obs.SVG.reset;
      oes.ui.visualizeStep = oes.ui.obs.SVG.visualizeStep;
      break;
    /*
    case "Zdog":
      oes.ui.setupCanvas = zdogVis.setup;
      oes.ui.resetCanvas = zdogVis.reset;
      oes.ui.visualizeStep = zdogVis.visualizeStep;
      break;
    */
    default:
      console.log("Invalid visualization type: "+ sim.config.ui.obs.type);
      sim.config.visualize = false;
    }
  } else sim.config.visualize = false;
  // initialize the map of all objects (accessible by ID)
  sim.objects = new Map();
  // initialize the Map of all objects (accessible by name)
  sim.namedObjects = new Map();
  // initialize the className->Class map
  sim.Classes = Object.create(null);
  // define a dummy version
  sim.schedule = function (e) {}
  // load all code files
  await oes.ui.loadSimulationModelCode();
  // Make object classes accessible via their object type name
  for (const objTypeName of sim.model.objectTypes) {
    sim.Classes[objTypeName] = util.getClass( objTypeName);
  }
  oes.setupInitialStateDataStructures();
  // visualize initial state
  oes.ui.setupCanvas( insertPointEl);
};
/*******************************************************
 Set up the Space Visualization
 *******************************************************/
oes.ui.setupSpaceView = function () {
  if (sim.model.space.type === undefined) throw "No space type defined in *setupSpaceView*";
  switch (sim.model.space.type) {
      // TODO: use (detect?) correct references methods, when other than the DOM
      // visualization "modules" are implemented for IntegerGrid case.
    case "IntegerGrid":
      switch (sim.config.ui.obs.spaceView.type) {
        case "threeDim":
          oes.ui.setupCanvas = oes.ui.space.threeDim.Babylon.setup;
          oes.ui.resetCanvas = oes.ui.space.threeDim.Babylon.reset;
          oes.ui.visualizeStep = oes.ui.space.threeDim.Babylon.render;
          break;
        default:
          oes.ui.setupCanvas = oes.ui.space.grid.setup;
          oes.ui.resetCanvas = oes.ui.space.grid.reset;
          oes.ui.visualizeStep = oes.ui.space.grid.i.dom.renderIntegerGrid;
      }
      break;
      // TODO: use (detect?) correct references methods, when other than the DOM
      // visualization "modules" are implemented for ObjectGrid case.
    case "ObjectGrid":
      oes.ui.setupCanvas = oes.ui.space.grid.o.dom.setupObjectGrid;
      oes.ui.resetCanvas = oes.ui.space.grid.reset;
      oes.ui.visualizeStep = oes.ui.space.grid.o.dom.renderObjectGrid;
      break;
    case "1D":
      switch (sim.config.ui.obs.spaceView.type) {
        case "oneDimSVG":
          oes.ui.setupCanvas = oes.ui.space.oneDim.SVG.setup;
          oes.ui.resetCanvas = oes.ui.space.oneDim.SVG.reset;
          oes.ui.visualizeStep = oes.ui.space.oneDim.SVG.renderSimState;
          break;
        case "threeDim":
          oes.ui.setupCanvas = oes.ui.space.threeDim.Babylon.setup;
          oes.ui.resetCanvas = oes.ui.space.threeDim.Babylon.reset;
          oes.ui.visualizeStep = oes.ui.space.threeDim.Babylon.render;
          break;
          // defaults to oneDimSVG visualization
        default:
          oes.ui.setupCanvas = oes.ui.space.oneDim.SVG.setup;
          oes.ui.resetCanvas = oes.ui.space.oneDim.SVG.reset;
          oes.ui.visualizeStep = oes.ui.space.oneDim.SVG.renderSimState;
      }
      break;
    case "2D":
      oes.ui.setupCanvas = oes.ui.space.twoDim.Phaser.setup;
      oes.ui.resetCanvas = oes.ui.space.twoDim.Phaser.reset;
      oes.ui.visualizeStep = oes.ui.space.twoDim.Phaser.render;
      break;
    case "3D":
      // TODO: complete when a 3D space is supported.
      break;
  }
};
/*====================================================================================
    S V G
 ==================================================================================== */
oes.ui.obs.SVG.setup = function ( insertPointEl) {
  const obsUI = sim.config.ui.obs,
        fixedElems = obsUI.fixedElements,
        objViews = obsUI.objectViews,
        canvasWidth = obsUI.canvas.width || 600,
        canvasHeight = obsUI.canvas.height || 400,
        canvasSvgEl = svg.createSVG({id:"canvasSVG",
            width: canvasWidth, height: canvasHeight}),
        defsEl = svg.createDefs();

  function renderInitialObjView( viewId, obj) {
    const objView = objViews[viewId],
          shapeGroupEl = svg.createGroup();
    for (const attrViewItemsRec of objView.attributesViewItemsRecords) {
      if ("enumAttribute" in attrViewItemsRec) {
        // the array viewItemsDef.viewItems maps an enum index to a view item
        const enumAttr = attrViewItemsRec.enumAttribute,
              enumIndex = obj[enumAttr],
              currentEnumViewDefRec = attrViewItemsRec.viewItems[enumIndex-1];
        obsUI.enumAttributes.push( enumAttr);
        for (const shDefRec of attrViewItemsRec.viewItems) {
          const el = oes.ui.obs.SVG.createShapeFromDefRec( shDefRec, obj);
          el.style.display = "none";
          shDefRec.element = el;
          canvasSvgEl.appendChild( el);
          if (shDefRec.canvasBackgroundColor) {
            el.canvasBackgroundColor = shDefRec.canvasBackgroundColor;
          }
        }
        currentEnumViewDefRec.element.style.display = "block";
        if (currentEnumViewDefRec.canvasBackgroundColor) {
          sim.config.ui.canvasContainerEl.style.backgroundColor = currentEnumViewDefRec.canvasBackgroundColor;
        }
      } else {
        // process an additive list of view item definition records for the given object and attribute
        for (const itemDefRec of attrViewItemsRec.viewItems) {
          let el=null, fp=null;
          // initialize the view item's object ID to SVG elements map
          itemDefRec.elements ??= {};
          if (itemDefRec.shapeName) {
            if (itemDefRec.fillPatternImage) {
              fp = itemDefRec.fillPatternImage;
              if (!fp.file.includes("/")) {
                fp.file = oes.defaults.imgFolder + fp.file;
              }
              el = svg.createImageFillPattern( fp.id, fp.file);
              defsEl.appendChild( el);
              itemDefRec.style = "fill: url(#" + fp.id + ");" + itemDefRec.style;
            }
            el = oes.ui.obs.SVG.createShapeFromDefRec( itemDefRec, obj);
            //canvasSvgEl.appendChild( el);
          }
          if (el) {
            itemDefRec.elements[obj.id] = el;
            shapeGroupEl.appendChild( el);
          }
        }
      }
    }
    canvasSvgEl.appendChild( shapeGroupEl);
  }

  // define SVG canvas container element
  sim.config.ui.canvasContainerEl = dom.createElement("div",{id:"visCanvas", classValues:"uiBlock"});
  // making the element the containing block of the animation element with position=absolute
  sim.config.ui.canvasContainerEl.style.position = "relative";
  if (obsUI.canvas.style) canvasSvgEl.style = obsUI.canvas.style;
  sim.config.ui.canvasContainerEl.appendChild( canvasSvgEl);
  canvasSvgEl.appendChild( defsEl);
  insertPointEl.after( sim.config.ui.canvasContainerEl);
  if (fixedElems) {  // render fixed elements
    for (const id of Object.keys( fixedElems)) {
      const el = oes.ui.obs.SVG.createShapeFromDefRec( fixedElems[id]);
      canvasSvgEl.appendChild( el);
    }
  }
  // construct attribute to viewItems map
  obsUI.attribute2ViewItems = {};
  for (const viewId of Object.keys( objViews)) {
    const objView = objViews[viewId];
    obsUI.attribute2ViewItems[viewId] = {};
    for (const attrViewItemsRec of objView.attributesViewItemsRecords) {
      if ("enumAttribute" in attrViewItemsRec) {
        // the array viewItemsDef.viewItems maps an enum index to a view item
        const enumAttr = attrViewItemsRec.enumAttribute;
        obsUI.attribute2ViewItems[viewId][enumAttr] = attrViewItemsRec.viewItems;
      } else {
        // the array viewItemsDef.viewItems is an additive list of view item definition records for the given object and attribute
        for (const attrName of attrViewItemsRec.attributes) {
          obsUI.attribute2ViewItems[viewId][attrName] = attrViewItemsRec.viewItems;
        }
      }
    }
  }
  // render initial object views
  if (objViews) {
    for (const viewId of Object.keys( objViews)) {
      if (sim.model.objectTypes.includes( viewId)) {
        // an object view for all instances of an object type
        const ObjectTypePopulation = sim.Classes[viewId].instances;
        for (const objIdStr of Object.keys( ObjectTypePopulation)) {
          const obj = ObjectTypePopulation[objIdStr];
          renderInitialObjView( viewId, obj);
        }
      } else if (sim.namedObjects.has( viewId)) {
        const obj = sim.namedObjects.get( viewId);
        renderInitialObjView( viewId, obj);
      } else {
        console.error("Object view ID "+ viewId +
            " does neither correspond to an object type nor an object name.")
      }
    }
  }
};
oes.ui.obs.SVG.reset = function () {
  oes.ui.obs.SVG.visualizeStep();  //TODO: replace with real reset code
};
oes.ui.obs.SVG.visualizeStep = function (visSlots) {
  const obsUI = sim.config.ui.obs,
      objViews = obsUI.objectViews;
  /*************************************************************************/
  function updateObjView( viewId, obj) {
    const objView = objViews[viewId],
        changeSlots = visSlots[viewId],
        viewItemsPerAttr = obsUI.attribute2ViewItems[viewId];
    for (const attr of Object.keys( changeSlots)) {
      // update objects
      const attrPathParts = attr.split(".");
      switch (attrPathParts.length) {
        case 1:
          obj[attr+"_pre"] = obj[attr];
          obj[attr] = changeSlots[attr];
          break;
        case 2: {
          const a1 = attrPathParts[0], a2 = attrPathParts[1];
          obj[a1][a2+"_pre"] = obj[a1][a2];
          obj[a1][a2] = changeSlots[attr];
          break;}
        case 3:
          const a1 = attrPathParts[0], a2 = attrPathParts[1], a3 = attrPathParts[2];
          obj[a1][a2][a3+"_pre"] = obj[a1][a2][a3];
          obj[a1][a2][a3] = changeSlots[attr];
          break;
      }
      // update object views
      if (obsUI.enumAttributes.includes( attr)) {  // an enum-attribute-based view item
        // viewItemsPerAttr maps the value of an enum attribute to a vis item def rec
        const prevEnumIndex = obj[attr+"_pre"],  //TODO: support multi-part attr
            prevItemDefRec = viewItemsPerAttr[attr][prevEnumIndex-1],
            newEnumIndex = changeSlots[attr],
            newItemDefRec = viewItemsPerAttr[attr][newEnumIndex-1];
        // hide previous enum view
        prevItemDefRec.element.style.display = "none";
        // display new enum view
        newItemDefRec.element.style.display = "block";
        if (newItemDefRec.canvasBackgroundColor) {
          sim.config.ui.canvasContainerEl.style.backgroundColor = newItemDefRec.canvasBackgroundColor;
        }
      } else {  // ordinary view items
        for (const itemDefRec of viewItemsPerAttr[attr]) {
          const el = itemDefRec.elements[obj.id],
              shAttribs = itemDefRec.shapeAttributes;
          for (const attrName of Object.keys( shAttribs)) {
            if (typeof shAttribs[attrName] === "function") {
              let val = shAttribs[attrName]( obj);
              switch (attrName) {
                case "textContent":
                  el.textContent = val;
                  break;
                case "file":
                  if (!val.includes("/")) val = oes.defaults.imgFolder + val;
                  el.setAttributeNS( svg.XLINK_NS, "href", val);
                  break;
                default:
                  el.setAttribute( attrName, val);
                  break;
              }
            }
          }
        }
      }
    }
  }
  /*************************************************************************/
  for (const viewId of Object.keys( visSlots)) {
    if (sim.model.objectTypes.includes( viewId)) {
      // an object view for all instances of an object type
      const ObjectTypePopulation = sim.Classes[viewId].instances;
      for (const objIdStr of Object.keys( ObjectTypePopulation)) {
        const obj = ObjectTypePopulation[objIdStr];
        updateObjView( viewId, obj);
      }
    } else if (sim.namedObjects.has( viewId)) {
      const obj = sim.namedObjects.get( viewId);
      updateObjView( viewId, obj);
    } else {
      console.log(`The objViewId "${viewId}" does neither denote an object nor an object type!`);
    }
  }
};

oes.ui.obs.SVG.createShapeFromDefRec = function (shapeDefRec, obj) {
  const fileName = shapeDefRec.shapeAttributes.file,
        el = document.createElementNS( svg.NS, shapeDefRec.shapeName),
        shAttribs = shapeDefRec.shapeAttributes;
  if (fileName && !fileName.includes("/")) {
    shAttribs.file = oes.defaults.imgFolder + fileName;
  }
  for (const attrName of Object.keys( shAttribs)) {
    let val;
    if (typeof shAttribs[attrName] === "function") {
      val = shAttribs[attrName]( obj);
    } else val = shAttribs[attrName];
    switch (attrName) {
      case "textContent":
        el.textContent = val;
        break;
      case "file":
        el.setAttributeNS( "http://www.w3.org/1999/xlink", "href", val);
        break;
      default:
        el.setAttribute( attrName, val);
        break;
    }
  }
  if (shapeDefRec.style) el.setAttribute("style", shapeDefRec.style);
  return el;
};
/*******************************************************
 Set up the Event Appearances (Sound + Animations)
 TODO: support audio/sound
 *******************************************************/
oes.ui.setupEventAppearances = function () {
  const eventAppearances = sim.config.ui.obs.eventAppearances;
  for (const trigEvtTypeName of Object.keys( eventAppearances)) {
    const evtAppearDefRec = eventAppearances[trigEvtTypeName],
          evtView = evtAppearDefRec.view,
          timingDefRec={};
    var domElem=null;
    if (evtView?.imageFile) {
      domElem = document.createElement("img");
      if (!evtView.imageFile.includes("/")) {
        domElem.src = oes.defaults.imgFolder + evtView.imageFile;
      } else {
        domElem.src = evtView.imageFile;
      }
      if (evtView.style) domElem.style = evtView.style;
      sim.config.ui.canvasContainerEl.appendChild( domElem);
      /*
      } else if (evtView.shapeName === "text") {
        domElem = svg.createText( );
        canvasSvgEl.appendChild( el);
      */
    } else {
      domElem = evtView.domElem();  // e.g., the visualization container element
    }
    timingDefRec.duration = evtView.duration || 1000;
    if (evtView.iterations) timingDefRec.iterations = evtView.iterations;
    if (evtView.fill) timingDefRec.fill = evtView.fill;
    const animation = domElem.animate( evtView.keyframes, timingDefRec);
    animation.pause();  // do not yet start the animation
    sim.config.ui.animations[trigEvtTypeName] = animation;  // store the animation handle
  }
};
/*******************************************************
 Set up the Event Appearances (Sound + Animations)
 TODO: support audio/sound
 *******************************************************/
oes.ui.playEventAnimation = function (eventsToAppear) {
  for (const evtTypeName of Object.keys( eventsToAppear)) {
    sim.config.ui.animations[evtTypeName].play();
  }
};
/*
 When the user confirms their choice(s) by activating the "continue" button, this triggers an event handler
 that restarts the simulator by calling sim.runScenarioStep( followupEvents) where the followupEvents
 have been obtained from invoking the onEvent method on the UIA triggering event with the
 UIA input field values as parameters.
 */