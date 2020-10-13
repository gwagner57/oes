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
oes.ui.logSimulationStep = function (simLogTableEl, step, time, objectsStr, eventsStr) {
  var decPl = oes.defaults.simLogDecimalPlaces,
      rowEl = simLogTableEl.insertRow();  // create new table row
  rowEl.insertCell().textContent = String( step);
  rowEl.insertCell().textContent = String( math.round( time, decPl));
  rowEl.insertCell().textContent = objectsStr;
  rowEl.insertCell().textContent = eventsStr;
}
/*******************************************************
 Display the standalone scenario statistics
 ********************************************************/
oes.ui.showStatistics = function (stat, tableEl) {
  var decPl = oes.defaults.expostStatDecimalPlaces,
      tbodyEl = tableEl.tBodies[0];
  for (let varName of Object.keys( stat)) {
    // skip pre-defined statistics (collection) variables
    if (["actTypes","resUtil"].includes( varName)) continue;
    let rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = varName;
    rowEl.insertCell().textContent = math.round( stat[varName], decPl);
  }
  // show statistics per activity type
  if (Object.keys( stat.actTypes).length > 0) {
    let rowEl = tbodyEl.insertRow();
    let cellEl = rowEl.insertCell();
    cellEl.colSpan = 2;
    cellEl.textContent = "Per activity type";
    Object.keys( stat.actTypes).forEach( function (actTypeName) {
      var qLenStat = stat.actTypes[actTypeName];
      let rowEl = tbodyEl.insertRow();
      rowEl.insertCell().textContent = actTypeName;
      rowEl.insertCell().textContent = JSON.stringify( qLenStat);
    });
  }
  /* show resource utilization statistics
  if (Object.keys( stat.resUtil).length > 0) {
    let rowEl = tbodyEl.insertRow();
    let cellEl = rowEl.insertCell();
    cellEl.colSpan = 2;
    cellEl.textContent = "Resource Utilization";
    Object.keys( stat.resUtil).forEach( function (actTypeName) {
      var resUtilMap = stat.resUtil[actTypeName];
      var activityTypeLabel = cLASS[actTypeName].label || actTypeName,
          columnLabel = oes.isProcNetModel() ? " (% busy | % blocked)" : " (% busy)";
      let rowEl = tbodyEl.insertRow();
      rowEl.insertCell().textContent = actTypeName;
      rowEl.insertCell().textContent = JSON.stringify( resUtilMap);
      /*
      document.forms["expost-statistics"].appendChild(
          dom.createElement("h3", {content: i18n.t(activityTypeLabel) + columnLabel})
      );
      Object.keys( sim.stat.resUtil[actTypeName]).forEach( function (objIdStr) {
        //console.log(objIdStr +": "+ sim.stat.resUtil[actT][objIdStr]/sim.time);
        var objName = sim.objects[objIdStr].name || objIdStr,
            contEl = dom.createElement("div", {classValues:"I-O-field"}),
            resUtilInfo = sim.stat.resUtil[actTypeName][objIdStr],
            cumResUtil = typeof resUtilInfo === "object" ? resUtilInfo.busy : resUtilInfo,
            resUtil = Math.round( cumResUtil / sim.scenario.simulationEndTime * 10000) / 100,
            resInfoText = numFmt.format( resUtil) +" %", resBlockTime=0;
        if (typeof resUtilInfo === "object" && resUtilInfo.blocked !== undefined) {
          resBlockTime = Math.round( resUtilInfo.blocked / sim.scenario.simulationEndTime * 10000) / 100;
          resInfoText += " | "+ numFmt.format( resBlockTime) +" %";
        }
        contEl.appendChild( dom.createLabeledOutputField({ name: objIdStr,
          labelText: objName, value: resInfoText}));
        document.forms["expost-statistics"].appendChild( contEl);
      });
    });
  }
  */
}
/*********************************************************************
 Show the results of a simple experiment
 **********************************************************************/
oes.ui.showSimpleExpResults = function (exp, tableEl) {
  const nmrOfRepl = exp.nmrOfReplications,
        tbodyEl = tableEl.tBodies[0],
        decPl = oes.defaults.expostStatDecimalPlaces,
        NS = 6;  // number of summary statistics

  function createSimpleExpResultsTableHead()  {
    // number of user-defined statistics
    const M = Object.keys( exp.replicStat).length - 1;  // deduct "actTypes"
    // number of activity types
    const N = Object.keys( exp.replicStat.actTypes).length;
    var colHeadingsRow="", usrDefStatVarHeads="", actTypeHeads="",
        perActyStatHeads = "<th>enqu</th><th>start</th><th>compl</th><th>qLen</th><th>wTime</th><th>cTime</th>";
    for (let i=1; i < N; i++) {
      perActyStatHeads += "<th>enqu</th><th>start</th><th>compl</th><th>qLen</th><th>wTime</th><th>cTime</th>";
    }
    for (const key of Object.keys( exp.replicStat)) {
      const thStartTag = N>0 ? "<th rowspan='2'>" : "<th>";
      usrDefStatVarHeads += key !== "actTypes" ? thStartTag + key +"</th>" : "";
    }
    actTypeHeads = Object.keys( exp.replicStat.actTypes).reduce( function (prev, curr) {
      return prev + `<th colspan='${NS}'>${curr}</th>`;
    },"");
    colHeadingsRow = `<tr><th rowspan='${2 + (N>0?1:0)}'>Replication</th>`;
    colHeadingsRow += M > 0 ? `<th colspan='${M}'>User-Def. Statistics</th>`:"";
    colHeadingsRow += N > 0 ? `<th colspan='${N*NS}'>Statistics per activity type</th>`:"";
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
      if (varName !== "actTypes") {  // key is a user-defined statistics variable name
        const val = exp.replicStat[varName][i];
        rowEl.insertCell().textContent = math.round( val, decPl);
      }
    }
    for (const actTypeName of Object.keys( exp.replicStat.actTypes)) {
      const replActStat = exp.replicStat.actTypes[actTypeName];
      for (const statVarName of ["enqueuedActivities","startedActivities","completedActivities"]) {
        rowEl.insertCell().textContent = replActStat[statVarName][i];
      }
      for (const statVarName of ["queueLength","waitingTime","cycleTime"]) {
          const val = replActStat[statVarName].max[i];
        rowEl.insertCell().textContent = Number.isInteger(val) ? val : math.round( val, decPl);
      }
      /*****TODO: support also the following statistics *****/
      //actStat.resUtil = {};
    }
  }
  // create footer with summary statistics
  for (const aggr of Object.keys( math.stat.summary)) {
    rowEl = tbodyEl.insertRow();  // create new table row
    rowEl.insertCell().textContent = math.stat.summary[aggr].label;
    for (const varName of Object.keys( exp.summaryStat)) {
      if (varName !== "actTypes") {  // key is a user-defined statistics variable name
        const val = exp.summaryStat[varName][aggr];
        rowEl.insertCell().textContent = math.round( val, decPl);
      }
    }
    for (const actTypeName of Object.keys( exp.summaryStat.actTypes)) {
      const sumActStat = exp.summaryStat.actTypes[actTypeName];
      for (const statVarName of ["enqueuedActivities","startedActivities","completedActivities"]) {
        const val = sumActStat[statVarName][aggr];
        rowEl.insertCell().textContent = math.round( val, decPl);
      }
      for (const statVarName of ["queueLength","waitingTime","cycleTime"]) {
        const val = sumActStat[statVarName][aggr];
        rowEl.insertCell().textContent = math.round( val, decPl);
      }
      /*****TODO: support also the following statistics *****/
      //actStat.resUtil = {};
    }
  }
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
