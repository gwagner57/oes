 /**
 * @fileOverview  A library of DOM element creation methods and 
 * other DOM manipulation methods.
 * 
 * @author Gerd Wagner
 */
var dom = {
   /**
    * Create an element
    *
    * @param {string} id
    * @param {string} classValues
    * @return {object}
    */
   createElement: function (elemType, slots) {
     var el = document.createElement( elemType);
     if (slots) {
       if (slots.id) el.id = slots.id;
       if (slots.classValues) el.className = slots.classValues;
       if (slots.content) el.innerHTML = slots.content;
     }
     return el;
   },
   /**
    * Create a time element from a Date object
    *
    * @param {object} d
    * @return {object}
    */
   createTime: function (d) {
     var tEl = document.createElement("time");
     tEl.textContent = d.toLocaleDateString();
     tEl.setAttribute("datetime", d.toISOString());
     return tEl;
   },
   /**
    * Create an img element
    * 
    * @param {string} id
    * @param {string} classValues
    * @param {object} content
    * @return {object}
    */
    createImg: function (slots) {
      var el = document.createElement("img");
      el.src = slots.src;
      if (slots.id) el.id = slots.id;
      if (slots.classValues) el.className = slots.classValues;
      return el;
    },
  /**
   * Create a single-line string input element
   * 
   * @param {string} id
   * @param {string} classValues
   * @param {string} name
   * @return {object}
   */
   createStringInput: function (slots) {
     var el = document.createElement("input");
     if (slots.id) el.id = slots.id;
     if (slots.classValues) el.className = slots.classValues;
     if (slots.name) el.name = slots.name;
     return el;
   },
  /**
   * Create a numeric input element
   * 
   * @param {string} id
   * @param {string} classValues
   * @param {string} name
   * @return {object}
   */
   createNumInput: function (slots) {
     var el = dom.createStringInput( slots);
     el.type = "number";
     return el;
   },
  /**
   * Create an option element
   * 
   * @param {object} content
   * @return {object}
   */
  createOption: function (slots) {
    var el = document.createElement("option");
    el.textContent = slots.text;
    el.value = slots.value ?? slots.text;
    return el;
  },
  /**
   * Create a button element
   * 
   * @param {string} id
   * @param {string} classValues
   * @param {object} content
   * @return {object}
   */
  createButton: function (slots) {
    var el = document.createElement("button");
    el.type = "button";
    if (slots.id) el.id = slots.id;
    if (slots.classValues) el.className = slots.classValues;
    if (slots.content) el.innerHTML = slots.content;
    return el;
  },
  /**
   * Create a menu item (button) element
   * 
   * @param {string} id
   * @param {string} classValues
   * @param {object} content
   * @return {object}
   */
  createMenuItem: function (slots) {
    var liEl = document.createElement("li"),
        buttonEl = document.createElement("button");
    buttonEl.type = "button";
    if (slots.id) liEl.id = slots.id;
    if (slots.classValues) liEl.className = slots.classValues;
    if (slots.content) buttonEl.innerHTML = slots.content;
    liEl.appendChild( buttonEl);
    return liEl;
  },
  /**
   * Create a labeled input field
   * 
   * @param {{labelText: string, name: string?, type: string?, 
   *          value: string?, disabled: string?}}   
   *        slots  The view definition slots.
   * @return {object}
   */
   createLabeledInputField: function (slots) {
     var inpEl = document.createElement("input"),
         lblEl = document.createElement("label");
     if (slots.name) inpEl.name = slots.name;
     if (slots.type) inpEl.type = slots.type;
     if (slots.value !== undefined) inpEl.value = slots.value;
     if (slots.disabled) inpEl.disabled = "disabled";
     lblEl.textContent = slots.labelText;
     lblEl.appendChild( inpEl);
     return lblEl;
   },
   /**
    * Create a radio button or checkbox element
    * 
    * @param {{labelText: string, name: string?, type: string?, 
    *          value: string?, disabled: string?}}   
    *        slots  The view definition slots.
    * @return {object}
    */
    createLabeledChoiceControl: function (t,n,v,lbl) {
      var ccEl = document.createElement("input"),
          lblEl = document.createElement("label");
      ccEl.type = t;
      ccEl.name = n;
      ccEl.value = v;
      lblEl.appendChild( ccEl);
      lblEl.appendChild( document.createTextNode( lbl));
      return lblEl;
    },
   /**
    * Create a labeled select element
    * 
    * @param {{labelText: string, name: string?, index: integer?}}   
    *     slots  The view definition slots.
    * @return {object}
    */
    createLabeledSelectField: function (slots) {
      var selEl = document.createElement("select"),
          lblEl = document.createElement("label"),
          containerEl = document.createElement("div");
      if (slots.name) selEl.name = slots.name;
      if (slots.index !== undefined) selEl.index = slots.index;
      lblEl.textContent = slots.labelText;
      if (slots.classValues) containerEl.className = slots.classValues;
      lblEl.appendChild( selEl);
      containerEl.appendChild( lblEl);
      return containerEl;
    },
    /**
     * Create option elements from a list of strings and insert them 
     * into a selection list element
     *
     * @param {object} selEl  A select(ion list) element
     * @param {object} strings  An array of option text items
     */
    fillSelectWithOptionsFromStringList: function (selEl, strings, noSelectionOption) {
      // delete old content
      selEl.innerHTML = "";
      // create "no selection yet" entry
      if (noSelectionOption && !selEl.multiple) {
        selEl.add( dom.createOption({text:" --- ", value:""}));
      }
      for (let i=0; i < strings.length; i++) {
        selEl.add( dom.createOption({text:`(${i}) ${strings[i]}`, value: i}));
      }
    },
    /**
     * Create option elements from a map of objects
     * and insert them into a selection list element
     *
     * @param {object} selEl  A select(ion list) element
     * @param {object} entityTable  A map of objects
     * @param {string} keyProp  The standard identifier property
     * @param {string} displayProp [optional]  A property supplying the text 
     *                 to be displayed for each object
     */
    fillSelectWithOptionsFromEntityTable: function (selEl, entityTable,
                                                    keyProp, displayAttribs) {
      var keys=[], obj=null, i=0, j=0, txt="";
      selEl.innerHTML = "";
      selEl.appendChild( dom.createOption({text:" --- ", value:""}));
      keys = Object.keys( entityTable);
      for (i=0; i < keys.length; i++) {
        obj = entityTable[keys[i]];
        if (displayAttribs) {
          txt = obj[displayAttribs[0]];
          for (j=1; j < displayAttribs.length; j++) {
            txt += " / "+ obj[displayAttribs[j]];
          }
        } else txt = obj[keyProp];
        selEl.add( dom.createOption({text: txt, value: obj[keyProp]}), null);
      }
    },
   /**
    * Create back button
    * 
    * @param {{label: string}}   
    *     slots  The view definition slots.
    * @return {object}  container element object with button child element
    */
    createBackButton: function (slots) {
      var backButtonEl = document.createElement("button"),
          containerEl = document.createElement("div");
      backButtonEl.type = "button";
      backButtonEl.name = "backButton";
      if (slots && slots.label) backButtonEl.textContent = slots.label;
      else backButtonEl.textContent = "Back to menu";
      if (slots) {
        if (slots.classValues) containerEl.className = slots.classValues;
        if (slots.handler) backButtonEl.addEventListener( 'click', slots.handler);
      }
      containerEl.appendChild( backButtonEl);
      return containerEl;
    },
    /**
     * Create submit button and back/cancel button
     * 
     * @param {{label: string, classValues: string?}}   
     *     slots  The view definition slots.
     * @return {object}  container element object with button child elements
     */
     createCommitAndBackButtons: function (slots) {
       var submitButtonEl = document.createElement("button"),
           backButtonEl = document.createElement("button"),
           containerEl = document.createElement("div");
       if (slots && slots.label) submitButtonEl.textContent = slots.label;
       else submitButtonEl.textContent = "Submit";
       submitButtonEl.type = "submit";
       submitButtonEl.name = "submitButton";
       backButtonEl.textContent = "Back to menu";
       backButtonEl.type = "button";
       backButtonEl.name = "backButton";
       if (slots && slots.classValues) containerEl.className = slots.classValues;
       containerEl.appendChild( submitButtonEl);
       containerEl.appendChild( backButtonEl);
       return containerEl;
     },
    /**
     * Create table element with thead and tbody
     * 
     * @param {string} classValues
     * @return {object}  tbody element object
     */
    createTable: function (slots) {
       var tableEl = document.createElement("table"),
           el=null;
       if (slots && slots.classValues) tableEl.className = slots.classValues;
       el = document.createElement("thead");
       tableEl.appendChild( el);
       el = document.createElement("tbody");
       tableEl.appendChild( el);
       return tableEl;
     }
};
