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
  }
}