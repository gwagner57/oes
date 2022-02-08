// Define the namespace variable "oes" if not yet defined
if (typeof oes !== "object") {
  oes = Object.create(null);
  oes.defaults = {
    expostStatDecimalPlaces: 2,
    simLogDecimalPlaces: 2
  };
}
/*******************************************************
 Create a simulation log entry (table row)
 ********************************************************/
function logSimulationStep( simLogTableEl) {
  var rowEl = simLogTableEl.insertRow();  // create new table row
  var modelVarInfo = Object.keys( sim.model.v).reduce( function (serialization, varName, i) {
    var slotSerialization = varName +": "+ sim.model.v[varName];
    return i>0 ? serialization +", "+ slotSerialization : slotSerialization;
  }, "");
  rowEl.insertCell().textContent = String( sim.step);
  rowEl.insertCell().textContent = String( math.round( sim.time, oes.defaults.simLogDecimalPlaces));
  // convert values() iterator to array
  rowEl.insertCell().textContent = [...sim.objects.values()].toString() +" "+ modelVarInfo;
  rowEl.insertCell().textContent = sim.FEL.toString();
}
/*******************************************************
 Display the standalone scenario statistics
 ********************************************************/
function showStatistics( stat, tableEl) {
  var decPl = oes.defaults.expostStatDecimalPlaces, tbodyEl = tableEl.tBodies[0];
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

