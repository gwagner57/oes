/**
 * Predefined class for creating enumerations as special JS objects.
 * @copyright Copyright 2014-20 Gerd Wagner, Chair of Internet Technology,
 *   Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 * @class
 * @param {string} name  The name of the new enumeration data type.
 * @param {array} enumArg  The labels array or code list map of the enumeration
 *
 * An eNUMERATION has the following properties:
 * name          the name of the enumeration
 * labels        a list of label strings such that enumLabel = labels[enumIndex-1]
 * enumLitNames  a list of normalized names of enumeration literals
 * codeList      a map of code/name pairs
 * MAX           the size of the enumeration
 */
/* globals eNUMERATION */
class eNUMERATION {
  constructor(name, enumArg) {
    var lbl="", LBL="";
    if (typeof name !== "string") {
      throw new Error("The first constructor argument of an enumeration must be a string!");
    }
    this.name = name;
    if (Array.isArray(enumArg)) {
      // a simple enum defined by a list of labels
      if (!enumArg.every( n => (typeof n === "string"))) {
        throw new Error("A list of enumeration labels as the second " +
            "constructor argument must be an array of strings!");
      }
      this.labels = enumArg;
      this.enumLitNames = this.labels;
    } else if (typeof enumArg === "object" && Object.keys(enumArg).length > 0) {
      // a code list defined by a map
      if (!Object.keys(enumArg).every( code => (typeof enumArg[code] === "string"))) {
        throw new Error("All values of a code list map must be strings!");
      }
      this.codeList = enumArg;
      // use codes as the names of enumeration literals
      this.enumLitNames = Object.keys( this.codeList);
      this.labels = this.enumLitNames.map( c => `${enumArg[c]} (${c})`);
    } else {
      throw new Error(
          "Invalid Enumeration constructor argument: " + enumArg);
    }
    this.MAX = this.enumLitNames.length;
    // generate the enumeration literals by capitalizing/normalizing the names
    for (let i=1; i <= this.enumLitNames.length; i++) {
      // replace " " and "-" with "_"
      lbl = this.enumLitNames[i-1].replace(/( |-)/g, "_");
      // convert to array of words, capitalize them, and re-convert
      LBL = lbl.split("_").map(function (lblPart) {
        return lblPart.toUpperCase();
      }).join("_");
      // assign enumeration index
      this[LBL] = i;
    }
    // protect the enumeration from change attempts
    Object.freeze(this);
    // add new enumeration to the population of all enumerations
    eNUMERATION[this.name] = this;
  }
  /*****************************************************************************
   Check if a value represents an enumeration literal or a valid index
   *****************************************************************************/
  isValidEnumLitOrIndex( v) {
    return Number.isInteger(v) && v > 0 && v < this.MAX;
  }
  /*****************************************************************************
   * Serialize a list of enum. literals/indexes as a list of enum. literal names
   *****************************************************************************/
  enumIndexesToNames( a) {
    if (!Array.isArray(a)) throw new Error("The argument must be an Array!");
    return a.map( enumInt => this.enumLitNames[enumInt-1], this).join(", ");
  }
}
