// Define the namespace variable "oes" if not yet defined
if (typeof oes !== "object") {
  oes = Object.create(null);
  oes.ui = Object.create(null);
  oes.defaults = {
    expostStatDecimalPlaces: 2,
    simLogDecimalPlaces: 2
  };
}
oes.ui.nodeStat = {
  enqu: {title:"enqueued tasks"},
  tmout: {title:"number of waiting timeouts (reneging)"},
  start: {title:"started activities"},
  compl: {title:"completed/preempted activities"},
  qLen: {title:"maximum queue length"},
  wTime: {title:"average/maximum waiting time"},
  cTime: {title:"average/maximum cycle time"}
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
 Display the standalone scenario run statistics
 ********************************************************/
oes.ui.showStatistics = function (stat) {
  const decPl = oes.defaults.expostStatDecimalPlaces;
  const showTimeSeries = "timeSeries" in stat;
  var isAN=false, isPN=false, nmrOfPredefStatSlots=0;

  function createActyNodeStatTableHead()  {
    const nodeStat = oes.ui.nodeStat;
    var perNodeStatHeading="";
    if (!stat.includeTimeouts) delete nodeStat.tmout;
    for (const nodeStatShortLabel of Object.keys( nodeStat)) {
      perNodeStatHeading +=
          `<th title="${nodeStat[nodeStatShortLabel].title}">${nodeStatShortLabel}</th>`;
    }
    return perNodeStatHeading;
  }
  const perNodeStatTblHeadElemsString = createActyNodeStatTableHead();

  function isEntryNodeStat( nodeStat) {
    return "nmrOfArrivedObjects" in nodeStat;
  }
  function isExitNodeStat( nodeStat) {
    return "nmrOfDepartedObjects" in nodeStat;
  }

  if (typeof stat.networkNodes === "object" && Object.keys( stat.networkNodes).length > 0) {
    if (Object.keys(stat.networkNodes).some(
        nodeName => isEntryNodeStat( stat.networkNodes[nodeName]))) {
      isPN = true;
    } else {
      isAN = true;
    }
    nmrOfPredefStatSlots = "includeTimeouts" in stat ? 2 : 1;
  }
  if ("table" in stat) nmrOfPredefStatSlots++;
  if ("timeSeries" in stat) nmrOfPredefStatSlots++;
  // create two column table for user-defined statistics
  if (Object.keys( stat).length > nmrOfPredefStatSlots) {
    const usrStatTblElem = document.createElement("table"),
          tbodyEl = usrStatTblElem.createTBody(),
          captionEl = usrStatTblElem.createCaption();
    usrStatTblElem.id = "userDefinedStatisticsTbl";
    captionEl.textContent = "User-defined statistics";
    for (const varName of Object.keys( stat)) {
      // skip pre-defined statistics (collection) variables
      if (["table","networkNodes","resUtil","includeTimeouts","timeSeries"].includes( varName)) continue;
      const rowEl = tbodyEl.insertRow();  // create new table row
      rowEl.insertCell().textContent = varName;
      rowEl.insertCell().textContent = math.round( stat[varName], decPl);
    }
    document.getElementById("simInfo").insertAdjacentElement(
        "afterend", usrStatTblElem);
  }
  // create table filled with object attribute values
  if ("table" in stat) {
    const objTblElem = document.createElement("table"),
          tbodyEl = objTblElem.createTBody(),
          captionEl = objTblElem.createCaption();
    objTblElem.id = "objectsStatisticsTbl";
    captionEl.textContent = stat.table.name || "Object statistics";
    for (const row of stat.table.rows) {
      const rowEl = tbodyEl.insertRow();  // create new table row
      for (const cell of row) {
        if (cell === row[0]) {  // row heading
          rowEl.insertCell().textContent = cell;
        } else {
          if (row === stat.table.rows[0]) {  // column headings
            rowEl.insertCell().textContent = cell;
          } else {
            rowEl.insertCell().textContent = math.round( cell, decPl);
          }
        }
      }
    }
    document.getElementById("simInfo").insertAdjacentElement(
        "afterend", objTblElem);
  }
  if (isAN || isPN) {
    if (isPN) {
      // create table for PN statistics per entry node
      const entryNodeStatTblElem = document.createElement("table"),
            tbodyEl = entryNodeStatTblElem.createTBody(),
            rowEl = tbodyEl.insertRow();
      entryNodeStatTblElem.id = "entryNodeStatisticsTbl";
      rowEl.innerHTML = "<tr><th>Entry node</th><th>arrived</th></tr>";
      for (const nodeName of Object.keys( stat.networkNodes)) {
        const nodeStat = stat.networkNodes[nodeName];
        if (isEntryNodeStat( nodeStat)) {
          const rowEl = tbodyEl.insertRow();
          rowEl.insertCell().textContent = nodeName;
          rowEl.insertCell().textContent = nodeStat.nmrOfArrivedObjects;
        }
      }
      document.getElementById("execInfo").insertAdjacentElement("beforebegin", entryNodeStatTblElem);
    }
    // create table for AN/PN statistics per activity/processing node
    const actyNodeStatTblElem = document.createElement("table");
    const tbodyEl = actyNodeStatTblElem.createTBody();
    actyNodeStatTblElem.id = "activityNodeStatisticsTbl";
    tbodyEl.insertRow().innerHTML = `<tr><th>${isPN ? "Processing":"Activity"} node</th>`+
        perNodeStatTblHeadElemsString + "<th>resource utilization</th></tr>";
    for (const nodeName of Object.keys( stat.networkNodes)) {
      const nodeStat = stat.networkNodes[nodeName];
      if ("resUtil" in nodeStat) {
        const rowEl = tbodyEl.insertRow();
        rowEl.insertCell().textContent = nodeName;
        rowEl.insertCell().textContent = nodeStat.enqueuedActivities;
        if (stat.includeTimeouts) {
          rowEl.insertCell().textContent = nodeStat.waitingTimeouts;
        }
        rowEl.insertCell().textContent = nodeStat.startedActivities;
        rowEl.insertCell().textContent = nodeStat.preemptedActivities ?
            nodeStat.completedActivities +"/"+ nodeStat.preemptedActivities : nodeStat.completedActivities;
        rowEl.insertCell().textContent = nodeStat.queueLength.max;
        rowEl.insertCell().textContent = math.round( nodeStat.waitingTime.avg, decPl) +"/"+
            math.round( nodeStat.waitingTime.max, decPl);
        rowEl.insertCell().textContent = math.round( nodeStat.cycleTime.avg, decPl) +"/"+
            math.round( nodeStat.cycleTime.max, decPl);
        rowEl.insertCell().textContent = JSON.stringify( nodeStat.resUtil);
      }
    }
    document.getElementById("execInfo").insertAdjacentElement("beforebegin", actyNodeStatTblElem);
    if (isPN) {
      // create table for PN statistics per exit node
      const exitNodeStatTblElem = document.createElement("table");
      const tbodyEl = exitNodeStatTblElem.createTBody();
      exitNodeStatTblElem.id = "exitNodeStatisticsTbl";
      const rowEl = tbodyEl.insertRow();
      rowEl.innerHTML = "<tr><th>Exit node</th><th>departed</th><th>avg. throughput time</th></tr>";
      for (const nodeName of Object.keys( stat.networkNodes)) {
        const nodeStat = stat.networkNodes[nodeName];
        if (isExitNodeStat( nodeStat)) {
          const rowEl = tbodyEl.insertRow();
          rowEl.insertCell().textContent = nodeName;
          rowEl.insertCell().textContent = nodeStat.nmrOfDepartedObjects;
          rowEl.insertCell().textContent = nodeStat.throughputTime;
        }
      }
      document.getElementById("execInfo").insertAdjacentElement("beforebegin", exitNodeStatTblElem);
    }
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
 Show the results of a simple experiment
 **********************************************************************/
oes.ui.showSimpleExpResults = function (exp) {
  const nmrOfRepl = exp.nmrOfReplications,
        decPl = oes.defaults.expostStatDecimalPlaces;
  const tableEl = document.createElement("table"),
        tbodyEl = document.createElement("tbody");
  tableEl.id = "statisticsTbl";
  tableEl.innerHTML = '<caption>Experiment results</caption>';
  tableEl.appendChild( tbodyEl);

  function createSimpleExpResultsTableHead()  {
    // number of user-defined statistics
    const M = Object.keys( exp.replicStat).length - 1,  // deduct "networkNodes"
          // number of activity types
          N = Object.keys( exp.replicStat.networkNodes).length,
          nodeStat = oes.ui.nodeStat,
          actStatWithoutTmout = {...nodeStat};
    var colHeadingsRow="", usrDefStatVarHeads="", actTypeHeads="", nmrOfTmoutStat=0,
        perActyStatHeading="", perActyStatHeadingWithoutTmout="", perActyStatHeads = "",
        NAS = Object.keys( nodeStat).length - 1;  // number of activity statistics without tmout
    // drop tmout entry
    delete actStatWithoutTmout.tmout;
    // create heading for activity type with tmout
    for (let actStatShortLabel of Object.keys( nodeStat)) {
      perActyStatHeading +=
          `<th title="${nodeStat[actStatShortLabel].title}">${actStatShortLabel}</th>`;
    }
    // create heading for activity type without tmout
    for (let actStatShortLabel of Object.keys( actStatWithoutTmout)) {
      perActyStatHeadingWithoutTmout +=
          `<th title="${nodeStat[actStatShortLabel].title}">${actStatShortLabel}</th>`;
    }
    for (const nodeName of Object.keys( exp.replicStat.networkNodes)) {
      const replActStat = exp.replicStat.networkNodes[nodeName];
      perActyStatHeads += replActStat.waitingTimeouts ?
          perActyStatHeading : perActyStatHeadingWithoutTmout;
      if (replActStat.waitingTimeouts) nmrOfTmoutStat++;
    }
    for (const key of Object.keys( exp.replicStat)) {
      const thStartTag = N>0 ? "<th rowspan='2'>" : "<th>";
      usrDefStatVarHeads += key !== "networkNodes" ? thStartTag + key +"</th>" : "";
    }
    actTypeHeads = Object.keys( exp.replicStat.networkNodes).reduce( function (prev, nodeName) {
      const n = exp.replicStat.networkNodes[nodeName].waitingTimeouts ? NAS+1 : NAS;
      return prev + `<th colspan='${n}'>${nodeName}</th>`;
    },"");
    colHeadingsRow = `<tr><th rowspan='${2 + (N>0?1:0)}'>Replication</th>`;
    colHeadingsRow += M > 0 ? `<th colspan='${M}'>User-Def. Statistics</th>`:"";
    colHeadingsRow += N > 0 ? `<th colspan='${N*NAS+nmrOfTmoutStat}'>Statistics per activity type</th>`:"";
    colHeadingsRow += "</tr>";
    let theadEl = tableEl.createTHead();
    theadEl.innerHTML = colHeadingsRow +
        "<tr>"+ usrDefStatVarHeads + actTypeHeads +"</tr>" +
        "<tr>"+ perActyStatHeads +"</tr>";
    tableEl.style.overflowX = "auto";  // horizontal scrolling
  }
  createSimpleExpResultsTableHead();
  for (let i=0; i < nmrOfRepl; i++) {
    const rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = String(i+1);  // replication No
    for (const varName of Object.keys( exp.replicStat)) {
      if (varName !== "networkNodes") {  // key is a user-defined statistics variable name
        const val = exp.replicStat[varName][i];
        rowEl.insertCell().textContent = math.round( val, decPl);
      }
    }
    for (const nodeName of Object.keys( exp.replicStat.networkNodes)) {
      const replActStat = exp.replicStat.networkNodes[nodeName];
      rowEl.insertCell().textContent = replActStat["enqueuedActivities"][i];
      if (replActStat["waitingTimeouts"]) {
        rowEl.insertCell().textContent = replActStat["waitingTimeouts"][i];
      }
      rowEl.insertCell().textContent = replActStat["startedActivities"][i];
      rowEl.insertCell().textContent = replActStat["completedActivities"][i];
      for (const statVarName of ["queueLength","waitingTime","cycleTime"]) {
        const val = replActStat[statVarName].max[i];
        rowEl.insertCell().textContent = Number.isInteger(val) ? val : math.round( val, decPl);
      }
      /*****TODO: support also the following statistics *****/
      //nodeStat.resUtil = {};
    }
  }
  // create footer with summary statistics
  for (const aggr of Object.keys( math.stat.summary)) {
    rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = math.stat.summary[aggr].label;
    for (const varName of Object.keys( exp.summaryStat)) {
      if (varName !== "networkNodes") {  // varName is a user-defined statistics variable name
        const val = exp.summaryStat[varName][aggr];
        rowEl.insertCell().textContent = math.round( val, decPl);
      }
    }
    for (const nodeName of Object.keys( exp.summaryStat.networkNodes)) {
      const sumActStat = exp.summaryStat.networkNodes[nodeName];
      for (const statVarName of Object.keys( sumActStat)) {
        const val = sumActStat[statVarName][aggr];
        rowEl.insertCell().textContent = math.round( val, decPl);
      }
      /*****TODO: support also the following statistics *****/
      //nodeStat.resUtil = {};
    }
  }
  document.getElementById("simInfo").insertAdjacentElement( "afterend", tableEl);
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
