const util = {
  /*******************************************************************************
   * Create option elements from an array list of option text strings
   * and insert them into a selection list element
   * @param {object} selEl  A select(ion list) element
   * @param {Array<string>} strings  An array list of strings
   ******************************************************************************/
  fillSelectWithOptionsFromStringList( selEl, strings) {
    for (let i=0; i < strings.length; i++) {
      let el = document.createElement("option");
      el.textContent = `(${i}) ${strings[i]}`;
      el.value = i;
      selEl.add( el, null);
    }
  },
  // the progress indication is indeterminate if there is no value
  createProgressBarEl( title, value) {
    const progressContainerEl = document.createElement("div"),
        progressEl = document.createElement("progress"),
        progressLabelEl = document.createElement("label"),
        progressInfoEl = document.createElement("p");
    progressEl.id = "progress";
    // values between 0 and 1
    if (value !== undefined) progressEl.value = value;  // initial value
    progressLabelEl.for = "progress";
    progressLabelEl.textContent = title;
    progressContainerEl.id = "progress-container";
    progressContainerEl.appendChild( progressLabelEl);
    progressContainerEl.appendChild( progressEl);
    progressContainerEl.appendChild( progressInfoEl);
    return progressContainerEl
  },
  /*******************************************************************************
   * Generate a file from text
   * @param {string} filename - Name of the file
   * @param {string} text - Content of the file
   ******************************************************************************/
  generateTextFile( filename, text) {
    var data, aElem, url;
    data = new Blob( [text], {type: "text/plain"});
    url = window.URL.createObjectURL(data);
    aElem = document.createElement("a");
    aElem.setAttribute( "style", "display: none");
    aElem.setAttribute( "href", url);
    aElem.setAttribute( "download", filename);
    document.body.appendChild( aElem);
    aElem.click();
    window.URL.revokeObjectURL( url);
    aElem.remove();
  },
  // from https://stackoverflow.com/questions/5646279/get-object-class-from-string-name-in-javascript/53199720
  getClass( name){
    var Class=null;
    if (name.match(/^[a-zA-Z0-9_]+$/)) {
      // proceed only if the name is a single word string
      Class = eval( name);
    } else {  // not a name
      throw new Error("getClass requires a single word string as argument!");
    }
    return Class;
    // Alternative solution: Class = this[name];
  },
  /**
   * Determines the implicit datatype of a value.
   * @param {*} value
   * @return {string}
   */
  determineDatatype( value) {
    var dataType="";
    if (typeof value === "string") {
      dataType = "string";
    } else if (Number.isInteger(value)) {
      if (1800<=value && value<2100) dataType = "year";
      else dataType = "integer";
    } else if (typeof value === "number") {
      dataType = "decimal";
    } else if (Array.isArray( value)) {
      dataType = "list";
    } else if (typeof value === "object" && Object.keys( value).length > 0) {
      dataType = "record";
    }
    return dataType;
  },
  /**
   * Converts a string to a value according to a prescribed datatype.
   * The return value is undefined, if the string does not comply with the datatype.
   * @param {string} string - the string to be converted
   * @param {string} dataType - one of: integer, year, decimal, list, record
   * @return {*}
   */
  parseString( string, dataType) {
    let value;
    switch (dataType) {
      case "integer":
        value = parseInt( string);
        break;
      case "decimal":
        value = parseFloat( string);
        break;
      case "list":
      case "record":
        try {
          value = JSON.parse( string);
        } catch (error) {
          value = undefined;
        }
        break;
    }
    return value;
  },
  /**
   * Converts a value to a string according to an explicitly provided (or implicit) datatype.
   * The return value is undefined, if the string does not comply with the datatype.
   * @param {string} value - the value to be stringified
   * @param {string} dataType - one of: integer, year, decimal, list, record
   * @return {string}
   */
  stringifyValue( value, dataType) {
    let string="";
    if (!dataType) dataType = util.determineDatatype( value);
    switch (dataType) {
      case "integer":
      case "decimal":
        string = String( value);
        break;
      case "list":
      case "record":
        string = JSON.stringify( value);
        break;
    }
    return string;
  },
  loadScript( fileURL) {
    return new Promise( function (resolve, reject) {
      const scriptEl = document.createElement("script");
      scriptEl.src = fileURL;
      scriptEl.onload = resolve;
      scriptEl.onerror = function () {
        reject( new Error(`Script load error for ${fileURL}`));
      };
      document.head.append( scriptEl);
    });
  }
}