const util = {
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
  createExpandablePanel({id, heading, hint, borderColor}) {
    const uiPanelEl = document.createElement("details"),
          headEl = document.createElement("summary");
    uiPanelEl.id = id;
    uiPanelEl.className = "expandablePanel";
    if (borderColor) uiPanelEl.style.borderColor = borderColor;
    headEl.innerHTML = heading;
    if (hint) headEl.title = hint;
    uiPanelEl.appendChild( headEl);
    uiPanelEl.style.overflowX = "auto";  // horizontal scrolling
    return uiPanelEl;
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
  getSuperClassOf( C) {
    return Object.getPrototypeOf( C);
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
      console.log(`${fileURL} loaded.`);
    });
  },
  loadCSS( fileURL) {
    return new Promise( function (resolve, reject) {
      const linkEl = document.createElement("link");
      linkEl.href = fileURL;
      linkEl.rel = "stylesheet";
      linkEl.type = "text/css";
      linkEl.onload = resolve;
      linkEl.onerror = function () {
        reject( new Error(`CSS load error for ${fileURL}`));
      };
      document.head.append( linkEl);
      console.log(`${fileURL} loaded.`);
    });
  }
}