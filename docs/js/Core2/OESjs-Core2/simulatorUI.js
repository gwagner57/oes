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
  enqu: {title:"enqueued activities"},
  tmout: {title:"number of waiting timeouts (reneging)"},
  start: {title:"started activities"},
  compl: {title:"completed activities"},
  qLen: {title:"maximum queue length"},
  wTime: {title:"maximum waiting time"},
  cTime: {title:"maximum cycle time"}
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
oes.ui.showStatistics = function (stat) {
  const decPl = oes.defaults.expostStatDecimalPlaces,
        nmrOfPredefStatSlots = "includeTimeouts" in stat ? 2 : 1;

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

  // create table for user-defined statistics
  if (Object.keys( stat).length > nmrOfPredefStatSlots) {
    const usrStatTblElem = document.createElement("table"),
          tbodyEl = usrStatTblElem.createTBody();
    usrStatTblElem.id = "userDefinedStatisticsTbl";
    usrStatTblElem.innerHTML = '<caption>User-defined statistics</caption>';
    for (const varName of Object.keys( stat)) {
      // skip pre-defined statistics (collection) variables
      if (["networkNodes","resUtil","includeTimeouts"].includes( varName)) continue;
      const rowEl = tbodyEl.insertRow();  // create new table row
      rowEl.insertCell().textContent = varName;
      rowEl.insertCell().textContent = math.round( stat[varName], decPl);
    }
    document.getElementById("simInfo").insertAdjacentElement(
        "afterend", usrStatTblElem);
  }
  if (Object.keys( stat.networkNodes).length > 0) {
    const isPN = Object.keys( stat.networkNodes).some(
        nodeName => isEntryNodeStat( stat.networkNodes[nodeName]));
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
    rowEl = tbodyEl.insertRow();
    rowEl.innerHTML = `<tr><th>${isPN ? "Processing":"Activity"} node</th>`+ perNodeStatTblHeadElemsString +
        "<th>resource utilization</th></tr>";
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
        rowEl.insertCell().textContent = nodeStat.completedActivities;
        rowEl.insertCell().textContent = nodeStat.queueLength.max;
        rowEl.insertCell().textContent = math.round( nodeStat.waitingTime.max, decPl);
        rowEl.insertCell().textContent = math.round( nodeStat.cycleTime.max, decPl);
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
