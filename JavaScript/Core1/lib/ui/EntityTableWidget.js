/**
 * Renders an entity table (a map of entity records with entity IDs as keys) as an
 * HTML table and allows editing the values of certain fields in the corresponding
 * table column, such that changes in a cell are propagated back to the corresponding
 * record field within the collection of entity records, keeping the entityRecords
 * property in sync with the table.
 * @class
 * @param {Object} entityRecordsOrClass - a map of entity records with entity IDs as keys
 *                                        or a class with properties and instances
 * @param {{columnDeclarations: Object, editableColumns: Object,
 *     locale: string}} options record
 */

class EntityTableWidget extends HTMLTableElement {
  constructor( entityRecordsOrClass, {columnDeclarations,editableColumns,locale}={}) {
    super();
    let entityIDs=[], entityRecords=null, firstEntityRecord=null, EntityType=null;
    if (dt.isClass( entityRecordsOrClass)) {  // a class
      EntityType = entityRecordsOrClass;
      if (!("instances" in EntityType) || Object.keys( EntityType.instances).length===0) {
        throw new Error(`No instances defined for class ${EntityType.name}`);
      }
      if ("properties" in EntityType) {
        columnDeclarations = EntityType.properties;
      }
      if ("displayAttributes" in EntityType) {
        this.displayAttributes = EntityType.displayAttributes;
        if ("editableAttributes" in EntityType) {
          if (!EntityType.editableAttributes.every( a => EntityType.displayAttributes.includes(a))) {
            throw new Error(`Display attributes do not include editable attributes for ${EntityType.name}`);
          }
        }
      }
      entityRecords = EntityType.instances;
      entityIDs = Object.keys( entityRecords);
      firstEntityRecord = entityRecords[entityIDs[0]];
    } else {  // a map of entity records
      if (typeof entityRecordsOrClass !== "object" || Object.keys( entityRecordsOrClass).length===0) {
        throw new Error("EntityTableWidget argument is not a map of entity records!");
      }
      entityRecords = entityRecordsOrClass;
      entityIDs = Object.keys( entityRecords);
      firstEntityRecord = entityRecords[entityIDs[0]];
      EntityType = firstEntityRecord.constructor;
    }
    if (!editableColumns && EntityType.editableAttributes) {
      editableColumns = EntityType.editableAttributes;
    }
    const constrViolations = dt.checkEntityTable( entityRecords, columnDeclarations);
    if (constrViolations.length > 0) {
      console.log(`Errors in entity table ${EntityType.name}:`);
      for (const constrVio of constrViolations) {
        console.log(`${constrVio.constructor.name}: ${constrVio.message}`);
      }
      return;
    }
    const idAttribute = Object.keys( firstEntityRecord)[0],
          decimalPlaces = 2,
          loc = locale || "en-US",
          numFmt = new Intl.NumberFormat( loc, {maximumFractionDigits: decimalPlaces});
    const tBodyEl = this.createTBody(),
          headerRowEl = this.createTHead().insertRow();
    // bind the "this" variable of UI event handlers to this widget object
    // and store a reference to the resulting function in a corresponding attribute
    this.syncRecordField = this.syncRecordField.bind( this);
    this.addEntityTableRow = this.addEntityTableRow.bind( this);
    this.addEntityRecord = this.addEntityRecord.bind( this);
    this.deleteEntityRecord = this.deleteEntityRecord.bind( this);
    // define event listeners at the table level
    this.addEventListener("input", this.syncRecordField);
    if (EntityType.name !== "Object") {
      this.entityType = EntityType;
      this.createCaption().textContent = EntityType.name;
    }
    this.className = "EntityTableWidget";
    this.entityRecords = entityRecords;
    // create list of attribute names
    if (columnDeclarations) {
      this.columnDeclarations = columnDeclarations;
      this.attributeNames = Object.keys( columnDeclarations);
    } else {  // create list of attribute names from first entity record
      this.attributeNames = Object.keys( firstEntityRecord);
    }
    if (!this.displayAttributes) this.displayAttributes = this.attributeNames;
    // create list of attribute ranges
    this.attributeRanges = {};
    for (const attr of this.attributeNames) {
      this.attributeRanges[attr] = columnDeclarations ?
          columnDeclarations[attr].range : dt.determineDatatype( firstEntityRecord[attr]);
    }
    // create column headings
    for (const attr of this.displayAttributes) {
      const thEl = document.createElement("th");
      thEl.textContent = columnDeclarations ? this.columnDeclarations[attr].label : attr;
      thEl.scope = "col";
      headerRowEl.appendChild( thEl);
    }
    // create an additional column/cell for the AddRow button
    const addRowButtonCellEl = headerRowEl.insertCell();
    addRowButtonCellEl.innerHTML = "<button class='AddRow' type='button' title='Add row'>+</button>";
    addRowButtonCellEl.firstElementChild.addEventListener("click", this.addEntityTableRow);
    // create and insert table rows
    for (const id of entityIDs) {
      const record = entityRecords[id],
            rowEl = tBodyEl.insertRow();
      for (const attrName of this.displayAttributes) {
        const value = record[attrName],
              datatype = this.attributeRanges[attrName],
              cellEl = rowEl.insertCell();
        // set UI features
        if (dt.isIntegerType( datatype)) {
          cellEl.inputmode = "numeric";
          cellEl.title = numFmt.format( value);
        } else if (dt.isDecimalType( datatype)) {
          cellEl.inputmode = "decimal";
          cellEl.title = numFmt.format( value);
        }
        cellEl.textContent = dt.stringifyValue( value, datatype);
        if (attrName !== idAttribute) {  // not for the ID attribute
          if (!editableColumns || editableColumns.includes( attrName)) {
            cellEl.contentEditable = "true";
            //cellEl.addEventListener("input", this.syncRecordField);
          }
        }
      }
      // create an additional cell for the Delete button
      const deleteBtnCellEl = rowEl.insertCell();
      deleteBtnCellEl.innerHTML = "<button class='Delete' type='button' title='Delete row'>x</button>";
      deleteBtnCellEl.firstElementChild.addEventListener("click", this.deleteEntityRecord);
    }
  }
  /*************************************************
   **** UI event handlers *****************************
   *************************************************/
  // input event handler for propagating changes in a table cell to the underlying record field
  syncRecordField(e) {
    if (e.target.tagName !== "TD") return;
    const cellEl = e.target,
          valueString = cellEl.textContent,
          fieldName = this.displayAttributes[cellEl.cellIndex],
          dataType = this.attributeRanges[fieldName],
          entityId = cellEl.parentElement.firstElementChild.textContent;
    // check range constraint and convert string to value
    let value = dt.parseValueString( valueString, dataType);
    if (value === undefined) {
      const phrase = dt.dataTypes[dataType]?.phrase || `of type ${dataType}`;
      cellEl.classList.add("invalid");
      // create error message only, if value string is nonempty and last character is not a comma
      if (valueString !== "" && valueString.substr( valueString.length-1) !== ",") {
        console.log(`RangeConstraintViolation: the value ${valueString} is not ${phrase}!`);
      }
    } else if (this.columnDeclarations && fieldName in this.columnDeclarations) {
      // check other constraints
      const constrVio = dt.check( fieldName, this.columnDeclarations[fieldName], value);
      if (constrVio.length === 1 && constrVio[0] instanceof NoConstraintViolation) {
        // do not sync table cell if not yet added
        if (cellEl.parentElement.className !== "toBeAdded") {
          this.entityRecords[entityId][fieldName] = value;
        }
        cellEl.classList.remove("invalid");
      } else {
        for (const cV of constrVio) {
          console.log(`${cV.constructor.name}: ${cV.message}`);
        }
      }
    } else {
      // do not sync table cell if not yet added
      if (cellEl.parentElement.className !== "toBeAdded") {
        this.entityRecords[entityId][fieldName] = value;
      }
      cellEl.classList.remove("invalid");
    }
  }
  // click event handler for adding a table row
  addEntityTableRow(e) {
    //if (e.target.tagName !== "BUTTON" || e.target.className !== "AddRow") return;
    const rowEl = this.insertRow();
    rowEl.className = "toBeAdded";
    for (const attr of this.attributeNames) {
      const datatype = this.attributeRanges[attr],
            cellEl = rowEl.insertCell();
      // set UI features
      if (dt.isIntegerType( datatype)) {
        cellEl.inputmode = "numeric";
      } else if (dt.isDecimalType( datatype)) {
        cellEl.inputmode = "decimal";
      }
      cellEl.contentEditable = "true";
    }
    // create an additional cell for the AddRecord button
    const addRecordBtnCellEl = rowEl.insertCell();
    addRecordBtnCellEl.innerHTML = "<button class='AddRecord' type='button' title='Save record'>+</button>";
    addRecordBtnCellEl.firstElementChild.addEventListener("click", this.addEntityRecord);
  }
  // click event handler for adding a record
  addEntityRecord(e) {
    if (e.target.tagName !== "BUTTON" || e.target.className !== "AddRecord") return;
    const btnEl = e.target,
          rowEl = btnEl.parentElement.parentElement,
          entityId = rowEl.cells[0].textContent,
          record = {};
    let recordIsValid = true;
    for (let i=0; i < this.attributeNames.length; i++) {
      const attr = this.attributeNames[i],
            valStr = rowEl.cells[i].textContent,
            val = dt.parseValueString( valStr, this.attributeRanges[attr]);
      if (val === undefined) {
        recordIsValid = false;
        rowEl.cells[i].classList.add("invalid");
      } else {
        // check other constraints
        const constrVio = dt.check( attr, this.columnDeclarations[attr], val);
        if (constrVio.length === 1 && constrVio[0] instanceof NoConstraintViolation) {
          record[this.attributeNames[i]] = val;
          rowEl.cells[i].classList.remove("invalid");
        } else {
          recordIsValid = false;
          rowEl.cells[i].classList.add("invalid");
          for (const cV of constrVio) {
            console.log(`${cV.constructor.name}: ${cV.message}`);
          }
        }
      }
    }
    if (recordIsValid) {
      // add record to entityRecords
      this.entityRecords[entityId] = this.entityType ? new this.entityType( record) : record;
      console.log(`Record with ID = ${entityId} added.`);
      rowEl.cells[0].contentEditable = "false";  // protect entity ID cell
      rowEl.className = "";
      // convert AddRecord button to Delete button
      btnEl.removeEventListener("click", this.addEntityRecord);
      btnEl.className = "Delete";
      btnEl.title = "Delete record";
      btnEl.textContent = "x";
      btnEl.addEventListener("click", this.deleteEntityRecord);
    }
  }
  // click event handler for deleting a row
  deleteEntityRecord(e) {
    if (e.target.tagName !== "BUTTON" || e.target.className !== "Delete") return;
    const btnEl = e.target,
        rowIndex = btnEl.parentElement.parentElement.rowIndex,
        entityId = Object.keys( this.entityRecords)[rowIndex-1];
    console.log(`Record with ID = ${entityId} deleted.`);
    delete this.entityRecords[entityId];
    this.deleteRow( rowIndex);  // DOM method
  }
  /*************************************************
   **** Life cycle event handlers ******************
   *************************************************/
  // use for initializing element (e.g., for setting up event listeners)
  connectedCallback() {
  }
  disconnectedCallback() {
    // remove event listeners for cleaning up
    // (1) remove event listeners at the table level
    this.removeEventListener("input", this.syncRecordField);
    // (2) remove event listener for AddRow button
    const firstRow = this.rows[0],
          lastCellOfFirstRowCells = firstRow.cells[firstRow.cells.length-1];
    lastCellOfFirstRowCells.removeEventListener("click", this.addEntityTableRow);
    // (3) remove event listeners for Delete buttons
    for (let i=1; i < this.rows.length; i++) {
      const row = this.rows[i],
            lastCell = row.cells[row.cells.length-1];
      lastCell.removeEventListener("click", this.deleteEntityRecord);
    }
  }
}
customElements.define('entity-table-widget', EntityTableWidget, {extends:"table"});

