// Define the namespace variable "oes" if not yet defined
if (typeof oes !== "object") {
  oes = Object.create(null);
  oes.ui = Object.create(null);
  oes.defaults = {
    expostStatDecimalPlaces: 2,
    simLogDecimalPlaces: 2
  };
}
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
  var decPl = oes.defaults.expostStatDecimalPlaces,
      tbodyEl = tableEl.tBodies[0];
  for (let varName of Object.keys( stat)) {
    let rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = varName;
    rowEl.insertCell().textContent = math.round( stat[varName], decPl);
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
