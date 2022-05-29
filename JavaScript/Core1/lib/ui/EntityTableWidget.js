/**
 * Renders an entity table (a map of entity records with entity IDs as keys) as an
 * HTML table and allows editing the values of certain fields in the corresponding
 * table column, such that changes in a cell are propagated back to the corresponding
 * record field within the collection of entity records, keeping the entityRecords
 * property in sync with the table.
 * @class
 * @param {Object} entityRecords - a map of entity records with entity IDs as keys
 * @param {{columnDatatypes: Array,locale: string}} options record
 */
class EntityTableWidget extends HTMLTableElement {
  constructor( entityRecords, {columnDatatypes,locale}={}) {
    super();
    const entityIDs = Object.keys( entityRecords),
          EntityType = entityRecords[entityIDs[0]].constructor,
          idAttribute = entityRecords[entityIDs[0]][0],
          decimalPlaces = 2,
          loc = locale || "en-US",
          numFmt = new Intl.NumberFormat( loc, {maximumFractionDigits: decimalPlaces});
    const tBodyEl = this.createTBody(),
          headerRowEl = this.createTHead().insertRow();
    this.className = "EntityTableWidget";
    this.entityRecords = entityRecords;
    if (EntityType) this.createCaption().textContent = EntityType.name;
    // bind the syncRecordField event handler to this widget object
    this.syncRecordField = this.syncRecordField.bind( this);
    // create table column headings from first entity record
    this.columnNames = Object.keys( entityRecords[entityIDs[0]]);
    this.columnDatatypes = columnDatatypes || {};
    for (const fieldName of this.columnNames) {
      const thEl = document.createElement("th");
      thEl.textContent = fieldName;
      thEl.scope = "col";
      headerRowEl.appendChild( thEl);
    }
    // build and insert table rows
    for (const id of entityIDs) {
      const record = entityRecords[id],
            rowEl = tBodyEl.insertRow();
      for (const fieldName of Object.keys( record)) {
        const value = record[fieldName];
        let datatype="";
        if (columnDatatypes) {
          datatype = this.columnDatatypes[fieldName];
        } else {
          datatype = this.columnDatatypes[fieldName] = util.determineDatatype( value);
        }
        const cellEl = rowEl.insertCell();
        // set UI features
        if (datatype === "integer") {
          cellEl.inputmode = "numeric";
          cellEl.title = numFmt.format( value);
        } else if (datatype === "decimal") {
          cellEl.inputmode = "decimal";
          cellEl.title = numFmt.format( value);
        }
        cellEl.textContent = datatype === "string" ? value : util.stringifyValue( value, datatype);
        if (fieldName !== idAttribute) {  // not for the ID attribute
          if (!EntityType.editableAttributes || EntityType.editableAttributes.includes( fieldName)) {
            cellEl.contentEditable = "true";
            cellEl.addEventListener("input", this.syncRecordField);
          }
        }
      }
    }
  }
  // input event handler
  syncRecordField(e) {
    const cellEl = e.target,
          string = cellEl.textContent,
          fieldName = this.columnNames[cellEl.cellIndex],
          dataType = this.columnDatatypes[fieldName],
          entityId = cellEl.parentElement.firstElementChild.textContent;
    let value = dataType==="string" ? string : util.parseString( string, dataType);
    if (value) {
      this.entityRecords[entityId][fieldName] = value;
      cellEl.classList.remove("invalid");
    } else {
      cellEl.classList.add("invalid");
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
customElements.define('entity-table-widget', EntityTableWidget, {extends:"table"});