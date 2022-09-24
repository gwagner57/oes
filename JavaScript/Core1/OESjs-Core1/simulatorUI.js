/**********************************************************************
 *** Create UI namespace objects **************************************
 **********************************************************************/
sim.ui = Object.create(null);
oes.ui = Object.create(null);
oes.ui.obs = Object.create(null);
oes.ui.obs.SVG = Object.create(null);

// for being able to run setupInitialStateForUi
class oBJECT {
  constructor( id, name) {
    this.id = id || sim.idCounter++;
    // add each new object to the Map of simulation objects by ID
    if (name) {  // name is optional
      this.name = name;
    }
  }
}
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
    // skip pre-defined statistics (collection) variables
    if (["table","timeSeries"].includes( varName)) continue;
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
  var tbodyEl = tableEl.tBodies[0];
  var rowEl = tbodyEl.insertRow();  // create new table row
  rowEl.insertCell().textContent = data.expScenNo;
  rowEl.insertCell().textContent = data.expScenParamValues.toString();
  Object.keys( data.expScenStat).forEach( function (v) {
    var statVal = data.expScenStat[v], displayStr="",
        decPl = oes.defaults.expostStatDecimalPlaces;
    displayStr = math.round( statVal, decPl);
    rowEl.insertCell().textContent = displayStr;
  });
}
/*====================================================================================
    S V G
 ==================================================================================== */
oes.ui.obs.SVG.setup = function () {
  var obsUI = sim.config.observationUI,
      fixedElems = obsUI.fixedElements,
      objViews = obsUI.objectViews,
      canvasWidth = obsUI.canvas.width || 600,
      canvasHeight = obsUI.canvas.height || 400,
      canvasSvgEl = svg.createSVG({id:"canvasSVG",
        width: canvasWidth, height: canvasHeight});
  var defsEl = svg.createDefs(),
      mainEl = document.querySelector("body > main");

  function renderInitialObjView( objViewId, objIdStr) {
    var el=null, shapeGroupEl=null, fp=null,
        obj = objIdStr ? sim.objects[objIdStr] : sim.namedObjects[objViewId],
        objView = objViews[objViewId],   // objViews[obj.constructor.Name]
        objViewItems = Array.isArray( objView) ? objView : [objView];
    shapeGroupEl = svg.createGroup();
    objViewItems.forEach( function (itemDefRec) {
      var txt="";
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
        el = svg.createShapeFromDefRec( itemDefRec, obj);
        itemDefRec.elements[obj.id] = el;
        canvasSvgEl.appendChild( el);
      } else if (itemDefRec.text) {  // objViewItem defines a text element
        if (typeof itemDefRec.text === "function") txt = itemDefRec.text( obj);
        else txt = itemDefRec.text;
        el = svg.createText( itemDefRec.x, itemDefRec.y, txt, itemDefRec.style)
      } else {  // itemDefRec maps enum attribs to lists of visualization items
        Object.keys( itemDefRec).forEach( function (key) {
          var enumIndex = 0, currentEnumViewDefRec = [];
          // ommit special fields
          if (key !== "object" && key !== "element" && key !== "elements") {
            enumIndex = obj[key];  // key is enum attr name
            currentEnumViewDefRec = itemDefRec[key][enumIndex-1];
            itemDefRec[key].forEach( function (shDefRec) {
              var el = oes.ui.obs.SVG.createShapeFromDefRec( shDefRec, obj);
              el.style.display = "none";
              shDefRec.element = el;
              canvasSvgEl.appendChild( el);
              if (shDefRec.canvasBackgroundColor) {
                sim.visualEl.style.backgroundColor = shDefRec.canvasBackgroundColor;
              }
            });
            itemDefRec[key].element = currentEnumViewDefRec.element;
            currentEnumViewDefRec.element.style.display = "block";
          }
        });
      }
      if (el) shapeGroupEl.appendChild( el);
    });
    canvasSvgEl.appendChild( shapeGroupEl);
  }

  // define SVG canvas
  sim.visualEl = dom.createElement("div",{id:"visCanvas", classValues:"uiBlock"});
  if (obsUI.canvas.style) canvasSvgEl.style = obsUI.canvas.style;
  sim.visualEl.appendChild( canvasSvgEl);
  canvasSvgEl.appendChild( defsEl);
  mainEl.appendChild( sim.visualEl);
  if (fixedElems) {  // render fixed elements
    Object.keys( fixedElems).forEach( function (id) {
      var el = oes.ui.obs.SVG.createShapeFromDefRec( fixedElems[id]);
      canvasSvgEl.appendChild( el);
    });
  }
  if (objViews) {  // render initial object views
    Object.keys( objViews).forEach( function (objViewId) {
      var objView = objViews[objViewId];
      if (Array.isArray( objView)) {
        objView.forEach( function (itemDefRec) {
          itemDefRec.elements = {};
        })
      } else {
        objView.elements = {};
      }
      if (sim.model.objectTypes.includes( objViewId)) {
        // an object view for all instances of an object type
        Object.keys( cLASS[objViewId].instances).forEach( function (objIdStr) {
          renderInitialObjView( objViewId, objIdStr);
        })
      } else if (sim.namedObjects[objViewId]) {
        renderInitialObjView( objViewId);
      } else {
        console.error("Object view ID "+ objViewId +
            " does neither correspond to an object type nor an object name.")
      }
    });
  }
};
oes.ui.obs.SVG.reset = function () {
  oes.ui.obs.SVG.visualizeStep();  //TODO: replace with real reset code
};
oes.ui.obs.SVG.visualizeStep = function () {
  var obsUI = sim.config.observationUI,
      objViews = obsUI.objectViews;
  /*************************************************************************/
  function updateObjView( viewId, objIdStr) {
    var itemDefRec={}, shAttribs=[], el=null, i=0, val,
        obj = objIdStr ? sim.objects[objIdStr] : sim.namedObjects[viewId],
        objView = objViews[viewId],
        objViewItems = Array.isArray( objView) ? objView : [objView];
    // objViewItems is a list of view item definition records
    for (i=0; i < objViewItems.length; i++) {
      itemDefRec = objViewItems[i];
      el = itemDefRec.elements[obj.id];
      if (itemDefRec.shapeName) {
        shAttribs = itemDefRec.shapeAttributes;
        Object.keys( shAttribs).forEach( function (attrName) {
          if (typeof shAttribs[attrName] === "function") {
            val = shAttribs[attrName]( obj);
            switch (attrName) {
              case "textContent":
                el.textContent = val;
                break;
              case "file":
                if (!val.includes("/")) {
                  val = oes.defaults.imgFolder + val;
                }
                el.setAttributeNS( svg.XLINK_NS, "href", val);
                break;
              default:
                el.setAttribute( attrName, val);
                break;
            }
          }
        });
      } else {  // objView maps enum attribs to lists of vis item def rec
        Object.keys( itemDefRec).forEach( function (key) {
          var enumIndex=0, currentEnumViewDefRec = {};
          // exclude properties that itemDefRec may also contain
          if (key !== "object" && key !== "element") {
            enumIndex = obj[key];
            if (Number.isInteger( enumIndex) && Array.isArray( itemDefRec[key]) &&
                enumIndex >= 1 && enumIndex <= itemDefRec[key].length) {
              currentEnumViewDefRec = itemDefRec[key][enumIndex-1];
              // hide previous enum view
              itemDefRec[key].element.style.display = "none";
              // display current enum view
              currentEnumViewDefRec.element.style.display = "block";
              // store current enum view element
              itemDefRec[key].element = currentEnumViewDefRec.element;
              if (currentEnumViewDefRec.canvasBackgroundColor) {
                sim.visualEl.style.backgroundColor = currentEnumViewDefRec.canvasBackgroundColor;
              }
            }
          }
        });
      }
    }
  }
  /*************************************************************************/
  Object.keys( objViews).forEach( function (objViewId) {
    if (sim.model.objectTypes.includes( objViewId)) {
      // an object view for all instances of an object type
      Object.keys( cLASS[objViewId].instances).forEach( function (objIdStr) {
        updateObjView( objViewId, objIdStr);
      })
    } else if (sim.namedObjects[objViewId]) {
      updateObjView( objViewId);
    }
  });
};
oes.ui.obs.SVG.createShapeFromDefRec = function (shapeDefRec, obj) {
  const fileName = shapeDefRec.shapeAttributes.file,
      el = document.createElementNS( svg.NS, shapeDefRec.shapeName),
      shAttr = shapeDefRec.shapeAttributes;
  if (fileName && !fileName.includes("/")) {
    shAttr.file = oes.defaults.imgFolder + fileName;
  }
  for (const attrName of Object.keys( shAttr)) {
    let val;
    if (typeof shAttr[attrName] === "function") {
      val = shAttr[attrName]( obj);
    } else val = shAttr[attrName];
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
