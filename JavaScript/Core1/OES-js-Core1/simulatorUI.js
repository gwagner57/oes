// Define the namespace variable "oes" if not yet defined
if (typeof oes !== "object") oes = Object.create(null);
oes.ui = {
  expostStatDecimalPlaces: 3,
  simLogDecimalPlaces: 2
};
const dom = {
  /**
   * Create option elements from an array list of option text strings
   * and insert them into a selection list element
   *
   * @param {object} selEl  A select(ion list) element
   * @param {Array<string>} strings  An array list of strings
   * @param {object} optPar  A record of optional parameters
   */
  fillSelectWithOptionsFromStringList: function (selEl, strings) {
    for (let i=0; i < strings.length; i++) {
      let el = document.createElement("option");
      el.textContent = `(${i}) ${strings[i]}`;
      el.value = i;
      selEl.add( el, null);
    }
  }
}
/*******************************************************
 Create a simulation log entry (table row)
 ********************************************************/
function logSimulationStep( simLogTableEl) {
  var rowEl = simLogTableEl.insertRow();  // create new table row
  rowEl.insertCell().textContent = String( sim.step);
  rowEl.insertCell().textContent = String( math.round( sim.time, oes.ui.simLogDecimalPlaces));
  rowEl.insertCell().textContent = [...sim.objects.values()].toString();
  rowEl.insertCell().textContent = sim.FEL.toString();
}
/*******************************************************
 Display the standalone scenario statistics
 ********************************************************/
function showStatistics( stat, tableEl) {
  var decPl = oes.ui.expostStatDecimalPlaces, tbodyEl = tableEl.tBodies[0];
  for (let varName of Object.keys( stat)) {
    let rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = varName;
    rowEl.insertCell().textContent = math.round( stat[varName], decPl);
  }
}
/*********************************************************************
 Create the experiment results table head
 **********************************************************************/
function createSimpleExpResultsTableHead( stat, tableEl)  {
  var N=0, statVarHeadings="", colHeadingsRow="", M=0;
  let theadEl = tableEl.createTHead();
  Object.keys( stat).forEach( function (v) {
    var label = v;
    N = N+1;
    statVarHeadings += "<th>"+ label +"</th>";
  })
  /*
  if (sim.experimentType.parameterDefs.length > 0) {
    colHeadingsRow = "<tr><th rowspan='2'>"+ i18n.t("Experiment scenario") +
        "</th><th rowspan='2'>"+ i18n.t("Parameter values") +"</th>" +
        "<th colspan='"+ N +"'>"+ i18n.t("Statistics") +"</th></tr>";
    M = 2;
  } else {
    colHeadingsRow = "<tr><th rowspan='2'>"+ i18n.t("Replication") +"</th>" +
        "<th colspan='"+ N +"'>"+ i18n.t("Statistics") +"</th></tr>";
    M = 1;
  }
  */
  colHeadingsRow = `<tr><th rowspan='2'>Replication</th><th colspan='${N}'>Statistics</th></tr>`;
  M = 1;
  theadEl.innerHTML = `<tr><th colspan='${M+N}'>Experiment Results</th></tr>` +
      colHeadingsRow + "<tr>"+ statVarHeadings +"</tr>";
  tableEl.style.overflowX = "auto";  // horizontal scrolling
}
/*********************************************************************
 Show the results of a simple experiment
 **********************************************************************/
function showSimpleExpResults( exp, tableEl) {
  var nmrOfRepl = exp.nmrOfReplications, rowEl=null;
  var tbodyEl = tableEl.tBodies[0];
  for (let i=0; i < nmrOfRepl; i++) {
    rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = String(i+1);  // replication No
    Object.keys( exp.replicStat).forEach( function (varName) {
      var decPl = oes.ui.expostStatDecimalPlaces,
          val = exp.replicStat[varName][i];
      rowEl.insertCell().textContent = math.round( val, decPl);
    });
  }
  // create footer with summary statistics
  Object.keys( math.stat.summary).forEach( function (aggr) {
    rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = math.stat.summary[aggr].label;
    Object.keys( exp.summaryStat).forEach( function (varName) {
      var decPl = oes.ui.expostStatDecimalPlaces,
          val = exp.summaryStat[varName][aggr];
      rowEl.insertCell().textContent = math.round( val, decPl);
    });
  });
}
/*********************************************************************
 Show the results of a parameter variation experiment
 **********************************************************************/
function showResultsFromParVarExpScenarioRun( data, tableEl) {
  var tbodyEl = tableEl.tBodies[0];
  var rowEl = tbodyEl.insertRow();  // create new table row
  rowEl.insertCell().textContent = data.expScenNo;
  rowEl.insertCell().textContent = data.expScenParamValues.toString();
  Object.keys( data.expScenStat).forEach( function (v) {
    var statVal = data.expScenStat[v], displayStr="",
        decPl = oes.ui.expostStatDecimalPlaces;
    displayStr = math.round( statVal, decPl);
    rowEl.insertCell().textContent = displayStr;
  });
}
