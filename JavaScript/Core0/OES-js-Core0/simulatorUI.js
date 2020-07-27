// Define the namespace variable "oes" if not yet defined
if (typeof oes !== "object") oes = Object.create(null);
oes.ui = {
  expostStatDecimalPlaces: 3,
  simLogDecimalPlaces: 2
};

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
  if (sim.experiment.parameterDefs.length > 0) {
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
function showSimpleExpResults( data, tableEl) {
  var nmrOfReplications=0, rowEl=null;
  var locale = "en-US";
  var tbodyEl = tableEl.tBodies[0];
  if (Object.keys( data.expReplicStat).length === 0) return;
  else nmrOfReplications = data.expReplicStat[Object.keys( data.expReplicStat)[0]].length;
  for (let i=0; i < nmrOfReplications; i++) {
    rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = i+1;  // replication No
    Object.keys( data.expReplicStat).forEach( function (varName) {
      var //range = sim.model.statistics[varName].range,
          //decPl = sim.model.statistics[varName].decimalPlaces || oes.defaults.expostStatDecimalPlaces,
          decPl = oes.ui.expostStatDecimalPlaces,
          val = data.expReplicStat[varName][i];
      /*
      if (cLASS.isIntegerType(range)) val = parseInt(val);
      else val = math.round( val, decPl);
      */
      rowEl.insertCell().textContent = math.round( val, decPl);
    });
  }
  // create footer with summary statistics
  Object.keys( math.stat.summary).forEach( function (aggr) {
    rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = math.stat.summary[aggr].label;
    Object.keys( data.expScenStat).forEach( function (varName) {
      var //statVar = sim.model.statistics[varName],
          //range = statVar.range,
          //decPl = statVar.decimalPlaces || oes.defaults.expostStatDecimalPlaces,
          decPl = oes.ui.expostStatDecimalPlaces,
          val = data.expScenStat[varName][aggr];
      /*
      if (cLASS.isIntegerType( range)) val = parseInt(val);
      else val = math.round( val, decPl);
      */
      rowEl.insertCell().textContent = math.round( val, decPl);
    });
  });
  /*
  rowEl = tbodyEl.insertRow();  // create new table row
  rowEl.insertCell().textContent = "Average";
  Object.keys( data.expScenStat).forEach( function (varName) {
    var range = sim.model.statistics[varName].range,
        val = data.expScenStat[varName].average;
    if (cLASS.isIntegerType(range)) val = parseInt( val);
    else val = val.toFixed( oes.defaults.expostStatDecimalPlaces);
    rowEl.insertCell().textContent = val;
  });
  */
}

