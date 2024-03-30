class SingleRecordTableWidget extends HTMLTableElement {
  constructor( record, locale) {
    super();
    const decimalPlaces = 2,
          loc = locale || "en-US",
          numFmt = new Intl.NumberFormat( loc, {maximumFractionDigits: decimalPlaces});
    this.record = record;
    // bind the syncRecordField event handler to this widget object
    this.syncRecordField = this.syncRecordField.bind( this);
    // build and insert table rows
    for (const fieldName of Object.keys( record)) {
      const value = record[fieldName],
            rowEl = this.insertRow();
      let displayString="";
      rowEl.insertCell().textContent = fieldName;
      const secColCellEl = rowEl.insertCell();
      secColCellEl.contentEditable = "true";
      if (typeof value === "string") {
        secColCellEl.setAttribute("data-type","String");
        displayString = value;
      } else if (Number.isInteger(value)) {
        secColCellEl.inputmode = "numeric";
        secColCellEl.setAttribute("data-type","Integer");
        displayString = String( value);
        secColCellEl.title = numFmt.format( value);
      } else if (typeof value === "number") {
        secColCellEl.inputmode = "decimal";
        secColCellEl.setAttribute("data-type","Decimal");
        displayString = String( value);
        secColCellEl.title = numFmt.format( value);
      } else if (Array.isArray( value)) {
        secColCellEl.setAttribute("data-type","List");
        displayString = JSON.stringify( value);
      } else if (typeof value === "object" && Object.keys( value).length > 0) {
        secColCellEl.setAttribute("data-type","Record");
        displayString = JSON.stringify( value);
      }
      secColCellEl.textContent = displayString;
      secColCellEl.addEventListener("input", this.syncRecordField);
    }
  }
  // input event handler
  syncRecordField(e) {
    const secondColCell = e.target,
          string = secondColCell.textContent,
          dataType = secondColCell.getAttribute("data-type"),
          fieldName = secondColCell.parentElement.firstElementChild.textContent;
    function parseValueString( valStr, type) {
      if (type === "String") return valStr;
      else switch (type) {
        case "Integer":
          if (String(parseInt(valStr)) === valStr) return parseInt(valStr);
          else return undefined;
        case "Decimal":
          if (String(parseFloat(valStr)) === valStr) return parseFloat(valStr);
          else return undefined;
        case "List":
        case "Record":
          let val;
          try {
            val = JSON.parse(valStr);
          } catch (error) {
            val = undefined;
          }
          return val;
      }
    }

    let value = parseValueString( string, dataType);
    if (value) {
      this.record[fieldName] = value;
      secondColCell.classList.remove("invalid");
    } else {
      secondColCell.classList.add("invalid");
    }
  }
  // use for initializing element (e.g., for setting up event listeners)
  connectedCallback() {
  }
  disconnectedCallback() {
    // remove event listeners for cleaning up
    for (const row of this.rows) {
      const secondColCell = row.children[1];
      secondColCell.removeEventListener("input", this.syncRecordField);
    }
  }
}
customElements.define('single-record-table-widget', SingleRecordTableWidget, {extends:"table"});