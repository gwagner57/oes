class SingleRecordTableWidget extends HTMLTableElement {
  constructor( record, locale) {
    super();
    const decimalPlaces = 2,
          loc = locale || "en-US",
          numFmt = new Intl.NumberFormat( loc, {maximumFractionDigits: decimalPlaces});
    this.className = "SingleRecordTableWidget";
    this.record = record;
    // bind the syncRecordField event handler to this widget object
    this.syncRecordField = this.syncRecordField.bind( this);
    // build and insert table rows
    for (const fieldName of Object.keys( record)) {
      const value = record[fieldName],
            rowEl = this.insertRow();
      let displayString="";
      rowEl.insertCell().textContent = fieldName;
      const secondColCell = rowEl.insertCell();
      secondColCell.contentEditable = true;
      if (Number.isInteger(value)) {
        secondColCell.inputmode = "numeric";
        secondColCell.setAttribute("data-type","integer");
        displayString = String( value);
        secondColCell.title = numFmt.format( value);
      } else if (typeof value === "number") {
        secondColCell.inputmode = "decimal";
        secondColCell.setAttribute("data-type","decimal");
        displayString = String( value);
        secondColCell.title = numFmt.format( value);
      } else if (Array.isArray( value)) {
        secondColCell.inputmode = "decimal";
        secondColCell.setAttribute("data-type","list");
        displayString = JSON.stringify( value);
      } else if (typeof value === "object" && Object.keys( value).length > 0) {
        secondColCell.setAttribute("data-type","record");
        displayString = JSON.stringify( value);
      }
      secondColCell.textContent = displayString;
      secondColCell.addEventListener("input", this.syncRecordField);
    }
  }
  // input event handler
  syncRecordField(e) {
    const secondColCell = e.target,
          string = secondColCell.textContent,
          dataType = secondColCell.getAttribute("data-type"),
          fieldName = secondColCell.parentElement.firstElementChild.textContent;
    let value = util.parseString( string, dataType);
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
  /*****************************************
   * Observing changes of HTML attribute values for the "observedAttributes"
   * (also allows propagating attribute value changes to corresponding properties)
   * ***************************************
   static get observedAttributes() {
     return ["attrName"];
   }
   attributeChangedCallback( attrName, oldValue, newValue) {
     if (newValue !== oldValue) {
       this[attrName] = this.getAttribute( attrName);  // always a string
     }
   }
   /*****************************************
   * Syncing DOM object properties with corresponding HTML element attributes
   * in the live DOM
   * ***************************************
   get attrName() {
     return this.hasAttribute('open');
   }
   set attrName( val) {
     if (val !== undefined) {
       this.setAttribute("attrName", val);
     } else {
       this.removeAttribute("attrName");
     }
   }

   get boolAttr() {
     return this.hasAttribute("boolAttr");
   }
   set boolAttr( val) {
     if (val) {
       this.setAttribute("boolAttr", "");
     } else {
       this.removeAttribute("boolAttr");
     }
   }
   *******************************************/
}
customElements.define('single-record-table-widget', SingleRecordTableWidget, {extends:"table"});