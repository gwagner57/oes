const dt = {
  classes: {},
  // define lists of datatype names
  stringTypes: ["String","NonEmptyString","Identifier","Email","URL","PhoneNumber"],
  integerTypes: ["Integer","PositiveInteger","NonNegativeInteger","AutoIdNumber","Year"],
  decimalTypes: ["Number","Decimal","Percent","ClosedUnitInterval","OpenUnitInterval"],
  otherPrimitiveTypes: ["Boolean","Date","DateTime"],
  structuredDataTypes: ["List","Record"],
  isStringType(T) {return dt.stringTypes.includes(T);},
  isIntegerType(T) {return dt.integerTypes.includes(T) ||
      typeof eNUMERATION === "object" && T instanceof eNUMERATION;},
  isDecimalType(T) {return dt.decimalTypes.includes(T);},
  isNumberType(T) {return dt.numericTypes.includes(T);},
  patterns: {
    ID: /^([a-zA-Z0-9][a-zA-Z0-9_\-]+[a-zA-Z0-9])$/,
    // defined in WHATWG HTML5 specification
    EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    // proposed by Diego Perini (https://gist.github.com/729294)
    URL: /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i,
    INT_PHONE_NO: /^\+(?:[0-9] ?){6,14}[0-9]$/
  },
  isIntegerString(x) {
    return typeof(x) === "string" && x.search(/^-?[0-9]+$/) === 0;
  },
  isDateString(v) {
    return typeof v === "string" &&
        /\d{4}-(0\d|1[0-2])-([0-2]\d|3[0-1])/.test(v) && !isNaN(Date.parse(v));
  },
  isDateTimeString(v) {
    return typeof(x) === "string" && x.search(/^-?[0-9]+$/) === 0;
  },
  /**
   * Determines the implicit datatype of a value.
   * @param {*} value
   * @return {string}
   */
  determineDatatype( value) {
    var dataType="";
    if (typeof value === "string") {
      dataType = "String";
    } else if (Number.isInteger(value)) {
      if (1800<=value && value<2100) dataType = "Year";
      else dataType = "Integer";
    } else if (typeof value === "number") {
      dataType = "Decimal";
    } else if (Array.isArray( value)) {
      dataType = "List";
    } else if (typeof value === "object" && Object.keys( value).length > 0) {
      dataType = "Record";
    }
    return dataType;
  },
  /**
   * Converts a string to a value according to a prescribed datatype.
   * The return value is undefined, if the string does not comply with the datatype.
   * @param {string} valStr - the string to be converted
   * @param {string} type - one of: Integer, Year, Decimal, List, Record, ...
   * @return {*}
   */
  parseValueString( valStr, type) {
    var value=[], valueStringsToParse=[];
    if (valStr.includes(",")) {  // a collection value
      valueStringsToParse = valStr.split(",");
    } else {
      valueStringsToParse = [valStr];
    }
    if (dt.isStringType( type)) {
      for (const str of valueStringsToParse) {
        if (!dt.dataTypes[type].condition( str)) {
          value = undefined; break;
        } else {
          value.push( str);
        }
      }
    } else if (dt.isIntegerType( type)) {
      for (const str of valueStringsToParse) {
        if (isNaN( parseInt( str)) || !dt.dataTypes[type].stringCondition( str)) {
          value = undefined; break;
        } else {
          value.push( parseInt( str));
        }
      }
    } else if (dt.isDecimalType( type)) {
      for (const str of valueStringsToParse) {
        if (isNaN( parseFloat( str)) || !dt.dataTypes[type].stringCondition( str)) {
          value = undefined; break;
        } else {
          value.push( parseFloat( str));
        }
      }
    } else {
      switch (type) {
      case "Date":
      case "DateTime":
        for (const str of valueStringsToParse) {
          if (isNaN( Date.parse( str))) {
            value = undefined; break;
          } else {
            value.push( Date.parse( str));
          }
        }
        break;
      case "Boolean":
        for (const str of valueStringsToParse) {
          if (!["true","yes","false","no"].includes( str)) {
            value = undefined; break;
          } else {
            value.push(["true","yes"].includes( str));
          }
        }
        break;
      case "List":
      case "Record":
        for (const str of valueStringsToParse) {
          let val;
          try {
            val = JSON.parse( str);
          } catch (error) {
            val = undefined; break;
          }
          if (val) value.push( val);
        }
        break;
      default:
        if (type in dt.classes) {
          for (const str of valueStringsToParse) {  // should be an ID
            const obj = dt.classes[type].instances[str];
            if (!obj) {
              value = undefined; break;
            } else {
              value.push( obj.id);  // convert to object IDs
            }
          }
        } else if (type in dt.dataTypes && "str2val" in dt.dataTypes[type] &&
            dt.isOfType( value, type)) {
          value = dt.dataTypes[type].str2val( valStr);
        } else {
          value = undefined;
        }
      }
    }
    if (value && value.length === 1) {  // single value
      value = value[0];
    }
    return value;
  },
  /**
   * Converts a value to a string according to an explicitly provided (or implicit) datatype.
   * The return value is undefined, if the string does not comply with the datatype.
   * @param {string} value - the value to be stringified
   * @param {string} type - one of: Integer, Year, Decimal, List, Record
   * @return {string}
   */
  stringifyValue( value, type) {
    let string="", valuesToStringify=[];
    if (!type) type = dt.determineDatatype( value);
    // make sure value is an array
    if (!Array.isArray( value)) {
      if (type in dt.classes && typeof value === "object" &&
          Object.keys(value).every( id => value[id] instanceof dt.classes[type])) {
        // value is an entity table (a map from IDs to objects of a certain type)
        valuesToStringify = Object.keys( value);
      } else {
        valuesToStringify = [value];
      }
    } else {
      valuesToStringify = value;
    }
    if (dt.isStringType( type)) {
      string = valuesToStringify.toString();
    } else if (dt.isNumberType( type)) {
      string = valuesToStringify.toString();
    } else if (type in dt.classes) {
      string = valuesToStringify.toString();
    } else {
      switch (type) {
        case "List":
        case "Record":
          string = JSON.stringify( value);
          break;
        default:
          if (type in dt.dataTypes && "val2str" in dt.dataTypes[type] &&
              dt.isOfType( value, type)) {
            string = dt.dataTypes[type].val2str( value);
          }
      }
    }
    return string;
  },
  // from https://stackoverflow.com/questions/5646279/get-object-class-from-string-name-in-javascript/53199720
  getClassByName( name){
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
  /********************************************************************
   Assuming that in the case of a simple entity table, the first entity record
   defines the attributes/structure of the table, check if all records include
   these attributes. Otherwise, for an entity table with attribute declarations,
   check if all records satisfy the declarations.
   ********************************************************************/
  checkEntityTable( entityRecords, columnDeclarations) {
    if (!(entityRecords instanceof Object) || Object.keys( entityRecords).length === 0) return false;
    const entityIDs = Object.keys( entityRecords);
    let attributeNames=[], constrVio=[];
    if (columnDeclarations) {
      attributeNames = Object.keys( columnDeclarations);
    } else {
      const firstEntityRecord = entityRecords[entityIDs[0]];
      attributeNames = Object.keys( firstEntityRecord);
    }
    for (const id of entityIDs) {
      const record = entityRecords[id],
      recFields = Object.keys( record);
      for (const attr of attributeNames) {
        if (!recFields.includes( attr)) {
          constrVio.push( new Error(`The attribute ${attr} is missing in record with ID ${id}.`));
          return constrVio;
        }
        if (columnDeclarations) {
          const val = record[attr],
                range = columnDeclarations[attr].range;
          if (!range) {
            constrVio.push( new Error(`The attribute declaration of ${attr} does not declare the range of the attribute!`));
          } else if (!dt.supportedDatatypes.includes( range)  && !(range in dt.classes)) {
            constrVio.push( new Error(`The range ${range} is not a supported datatype or class! ${JSON.stringify(dt.classes)}`));
          }
          constrVio.push( ...dt.check( attr, columnDeclarations[attr], val));
          if (constrVio[constrVio.length-1] instanceof NoConstraintViolation) {
            constrVio.length -= 1;  // drop
          }
        }
      }
    }
    return constrVio;
  },
  registerModelClasses( listOfClassNames) {  // Make classes accessible via their name
    for (const className of listOfClassNames) {
      dt.classes[className] = dt.getClassByName( className);
    }
  },
  dataTypes: {
    "String": {phrase:"a string",
        condition: value => typeof value === "string"},
    "NonEmptyString": {phrase:"a non-empty string",
        condition: value => typeof value === "string" && value.trim() !== ""},
    "Email": {phrase:"an email address",
        condition: v => typeof v === "string" && v.trim() !== "" && dt.patterns.EMAIL.test( v)},
    "URL": {phrase:"a URL",
        condition: v => typeof v === "string" && v.trim() !== "" && dt.patterns.URL.test( v)},
    "PhoneNumber": {phrase:"an international phone number",
        condition: v => typeof v === "string" && v.trim() !== "" && dt.patterns.INT_PHONE_NO.test( v)},
    "Identifier": {phrase:"an identifier",  // an alphanumeric/"-"/"_" string
        condition: v => typeof v === "string" && v.trim() !== "" && dt.patterns.ID.test( v)},
    "Integer": {phrase:"an integer",
        stringCondition: valStr => dt.isIntegerString( valStr),
        condition: value => Number.isInteger( value)},
    "NonNegativeInteger": {phrase:"a non-negative integer",
        stringCondition: valStr => dt.isIntegerString( valStr) && parseInt( valStr) >= 0,
        condition: value => Number.isInteger(value) && value >= 0},
    "PositiveInteger": {phrase:"a positive integer",
        stringCondition: valStr => dt.isIntegerString( valStr) && parseInt( valStr) > 0,
        condition: value => Number.isInteger(value) && value > 0},
    "AutoIdNumber": {phrase:"a positive integer as required for an auto-ID",
        stringCondition: valStr => dt.isIntegerString( valStr) && parseInt( valStr) > 0,
        condition: value => Number.isInteger(value) && value > 0},
    "Year": {phrase:"a year number (between 1000 and 9999)",
        stringCondition: valStr => dt.isIntegerString( valStr) &&
            parseInt( valStr) >= 1000 && parseInt( valStr) <= 9999,
        condition: value => Number.isInteger(value) && value >= 1000 && value <= 9999},
    "Number": {phrase:"a number",
        stringCondition: valStr => !isNaN( parseFloat( valStr)) &&
            String( parseFloat( valStr)) === valStr,
        condition: value => typeof value === "number"},
    "Decimal": {phrase:"a decimal number",
        stringCondition: valStr => String( parseFloat( valStr)) === valStr,
        condition: value => typeof value === "number"},
    "Percent": {phrase:"a percentage number",
        stringCondition: valStr => String( parseFloat( valStr)) === valStr,
        condition: value => typeof value === "number"},
    "Probability": {phrase:"a probability number in [0,1]",
        stringCondition: valStr => String( parseFloat( valStr)) === valStr &&
            parseFloat( valStr) <= 1,
        condition: value => typeof value === "number" && value>=0 && value<=1},
    "ClosedUnitInterval": {phrase:"a number in the closed unit interval [0,1]",
        condition: value => typeof value === "number" && value>=0 && value<=1},
    "OpenUnitInterval": {phrase:"a number in the open unit interval (0,1)",
        condition: value => typeof value === "number" && value>0 && value<1},
    "Date": {phrase:"an ISO date string (or a JS Date value)",
        condition: value => value instanceof Date,
        str2val: s => new Date(s)},
    "DateTime": {phrase:"an ISO date-time string (or a JS Date value)",
        condition: value => value instanceof Date,
        str2val: s => new Date(s)},
    "Boolean": {phrase:"a Boolean value (true/'yes' or false/'no')",
        condition: value => typeof value === "boolean",
        str2val: s => ["true","yes"].includes(s) ? true :
            (["false","no"].includes(s) ? false : undefined)}
  },
  isOfType( value, Type) {
    const cond = dt.dataTypes[Type]?.condition;
    return cond !== undefined && cond( value);
  },
  // https://stackoverflow.com/questions/526559/testing-if-something-is-a-class-in-javascript
  isClass( C) {
    return typeof C === "function" && C.prototype !== undefined;
  },
  range2JsDataType( range) {
    var jsDataType="";
    switch (range) {
    case "String":
    case "NonEmptyString":
    case "Email":
    case "URL":
    case "PhoneNumber":
    case "Date":
      jsDataType = "string";
      break;
    case "Integer":
    case "NonNegativeInteger":
    case "PositiveInteger":
    case "Number":
    case "AutoIdNumber":
    case "Decimal":
    case "Percent":
    case "ClosedUnitInterval":
    case "OpenUnitInterval":
      jsDataType = "number";
      break;
    case "Boolean":
      jsDataType = "boolean";
      break;
    default:
      if (range instanceof eNUMERATION) {
        jsDataType = "number";
      } else if (typeof range === "string" && mODELcLASS[range]) {
        jsDataType = "string";  // for the standard ID (TODO: can also be "number")
      } else if (typeof range === "object") {  // a.g. Array or Object
        jsDataType = "object";
      }
    }
    return jsDataType;
  },
  /**
   * Generic method for checking the integrity constraints defined in attribute declarations.
   * The values to be checked are first parsed/deserialized if provided as strings.
   * Copied from the cOMPLEXtYPE class of oNTOjs
   *
   * min/max: numeric (or string length) minimum/maximum
   * optional: true if property is single-valued and optional (false by default)
   * range: String|NonEmptyString|Integer|...
   * pattern: a regular expression to be matched
   * minCard/maxCard: minimum/maximum cardinality of a multi-valued property
   *     By default, maxCard is 1, implying that the property is single-valued, in which
   *     case minCard is meaningless/ignored. maxCard may be Infinity.
   *
   * @method
   * @author Gerd Wagner
   * @param {string} attr  The attribute for which a value is to be checked.
   * @param {object} decl  The attribute's declaration.
   * @param val  The value to be checked.
   * @param optParams.checkRefInt  Check referential integrity
   * @return {object}  The constraint violation object.
   */
  check( attr, decl, val, optParams) {
    var constrVio=[], valuesToCheck=[],
        minCard = decl.minCard !== "undefined" ? decl.minCard : (decl.optional ? 0 : 1),  // by default, an attribute is mandatory
        maxCard = decl.maxCard || 1,  // by default, an attribute is single-valued
        min = typeof decl.min === "function" ? decl.min() : decl.min,
        max = typeof decl.max === "function" ? decl.max() : decl.max,
        range = decl.range,
        msg = decl.patternMessage || "",
        pattern = decl.pattern;
    // check Mandatory Value Constraint
    if (val === undefined || val === "") {
      if (decl.optional) constrVio.push( new NoConstraintViolation());
      else constrVio.push( new MandatoryValueConstraintViolation(
            `A value for ${attr} is required!`));
    }
    if (maxCard === 1) {  // single-valued attribute
      if (range === "List" && Array.isArray(val)) {
        valuesToCheck = [[...val]];
      } else if (range === "Record" && typeof val === "object") {
        valuesToCheck = [{...val}];
      } else {
        valuesToCheck = [val];
      }
    } else {  // multi-valued properties (can be array-valued or map-valued)
      if (Array.isArray( val) ) {
        if (range === "List" && val.every( el => Array.isArray(el))) {
          valuesToCheck = val.map( a => [...a]);
        } else if (range === "Record" && val.every( el => typeof el === "object")) {
          valuesToCheck = val.map( function (o) {return {...o};});
        } else if (typeof range === "string" && range in dt.classes &&
              val.every( el => String(el) in dt.classes[range].instances)) {
          valuesToCheck = val.map( id => dt.classes[range].instances[id]);
        } else {
          valuesToCheck = val;
        }
      } else if (typeof val === "object" && typeof range === "string" && range in dt.classes) {
        if (!decl.isOrdered) {  // convert map to array list
          valuesToCheck = Object.keys( val).map( id => val[id]);
        } else {
          constrVio.push( new RangeConstraintViolation(
            `The ordered-collection-valued attribute ${attr} must not have a map value like ${val}`));
        }
      } else {
        valuesToCheck = [val];
      }
    }
    /***************************************************************
     ***  Convert value strings to values  *************************
     ***************************************************************/
    if (dt.isIntegerType( range)) {  // convert integer strings to integers
      valuesToCheck.forEach( function (v,i) {
        if (typeof v === "string") valuesToCheck[i] = parseInt( v);
      });
    } else if (dt.isDecimalType( range)) {  // convert decimal strings to decimal numbers
      valuesToCheck.forEach( function (v,i) {
        if (typeof v === "string") valuesToCheck[i] = parseFloat( v);
      });
    } else {
      switch (range) {
      case "Boolean":  // convert 'yes'/'no' strings to Boolean true/false
        valuesToCheck.forEach( function (v,i) {
          if (typeof v === "string") {
            if (["true","yes"].includes(v)) valuesToCheck[i] = true;
            else if (["no","false"].includes(v)) valuesToCheck[i] = false;
          }
        });
        break;
      case "Date":  // convert ISO date string to JS Date value
        valuesToCheck.forEach(function (v, i) {
          if (dt.isDateString(v)) valuesToCheck[i] = new Date(v);
        });
        break;
      case "DateTime":  // convert ISO date-time string to JS Date value
        valuesToCheck.forEach(function (v, i) {
          if (typeof v === "string" && !isNaN(Date.parse(v))) valuesToCheck[i] = new Date(v);
        });
        break;
      }
    }
    /********************************************************************
     ***  Check range constraints  **************************************
     ********************************************************************/
    if (range in dt.dataTypes) {
      for (const v of valuesToCheck) {
        if (!dt.dataTypes[range].condition( v)) {
          constrVio.push( new RangeConstraintViolation(
              `The value ${v} of attribute ${attr} is not ${dt.dataTypes[range].phrase}!`));
        }
      }
    } else {
      if (typeof eNUMERATION === "object" &&
          (range instanceof eNUMERATION || typeof range === "string" && eNUMERATION[range])) {
        if (typeof range === "string") range = eNUMERATION[range];
        for (const v of valuesToCheck) {
          if (!Number.isInteger(v) || v < 1 || v > range.MAX) {
            constrVio.push( new RangeConstraintViolation("The value "+ v +
                " is not an admissible enumeration integer for "+ attr));
          }
        }
      } else if (Array.isArray( range)) {  // *** Ad-hoc enumeration ***
        for (const v of valuesToCheck) {
          if (range.indexOf(v) === -1) {
            constrVio.push( new RangeConstraintViolation("The "+ attr +" value "+ v +
                " is not in value list "+ range.toString()));
          }
        }
      } else if (typeof range === "string" && range in dt.classes) {
        const RangeClass = dt.classes[range];
        valuesToCheck.forEach( function (v, i) {
          var recFldNames=[], propDefs={};
          if (!RangeClass.isComplexDatatype && !(v instanceof RangeClass)) {
            if (typeof v === "object") {
              constrVio.push( new ReferentialIntegrityConstraintViolation(
                  `The object ${JSON.stringify(v)} referenced by attribute ${attr} is not from its range ${range}`));
            } else {
              // convert IdRef to object reference
              if (RangeClass.instances[v]) {
                valuesToCheck[i] = RangeClass.instances[String(v)];
              } else if (optParams?.checkRefInt) {
                constrVio.push( new ReferentialIntegrityConstraintViolation("The value " + v +
                    " of attribute '"+ attr +"' is not an ID of any " + range + " object!"));
              }
            }
          } else if (RangeClass.isComplexDatatype && typeof v === "object") {
            v = Object.assign({}, v);  // use a clone
            // v is a record that must comply with the complex datatype
            recFldNames = Object.keys(v);
            propDefs = RangeClass.properties;
            // test if all mandatory properties occur in v and if all fields of v are properties
            if (Object.keys( propDefs).every( function (p) {return !!propDefs[p].optional || p in v;}) &&
                recFldNames.every( function (fld) {return !!propDefs[fld];})) {
              recFldNames.forEach( function (p) {
                var validationResult = dt.check( p, propDefs[p], v[p]);
                if (validationResult instanceof NoConstraintViolation) {
                  v[p] = validationResult.checkedValue;
                } else {
                  throw validationResult;
                }
              })
            } else {
              constrVio.push( new RangeConstraintViolation("The value of " + attr +
                  " must be an instance of "+ range +" or a compatible record!"+
                  JSON.stringify(v) + " is not admissible!"));
            }
          }
        });
      } else if (typeof range === "string" && range.includes("|")) {
        valuesToCheck.forEach( function (v, i) {
          var rangeTypes=[];
          rangeTypes = range.split("|");
          if (typeof v === "object") {
            if (!rangeTypes.some( rc => v instanceof dt.classes[rc])) {
              constrVio.push( new ReferentialIntegrityConstraintViolation("The object " + JSON.stringify(v) +
                  " is not an instance of any class from " + range + "!"));
            } else {
              v = valuesToCheck[i] = v.id;  // convert to IdRef
            }
          } else if (Number.isInteger(v)) {
            if (optParams && optParams.checkRefInt) {
              if (!dt.classes[range].instances[String(v)]) {
                constrVio.push( new ReferentialIntegrityConstraintViolation(
                    `The value ${v} of attribute "${attr}" is not an ID of any ${range} object!`));
              }
            }
          } else if (typeof v === "string") {
            if (!isNaN( parseInt(v))) v = valuesToCheck[i] = parseInt(v);
          } else {
            constrVio.push( new RangeConstraintViolation(
                `The value (${v}) of attribute "${attr}" is neither an integer nor a string!`));
          }
        });
      } else if (typeof range === "object" && range.dataType !== undefined) {
        // the range is a (collection) datatype declaration record
        for (const v of valuesToCheck) {
          if (typeof v !== "object") {
            constrVio.push( new RangeConstraintViolation("The value of " + attr +
                " must be an object! " + JSON.stringify(v) + " is not admissible!"));
          }
          switch (range.dataType) {
            case "Array":
              if (!Array.isArray(v)) {
                constrVio.push( new RangeConstraintViolation("The value of " + attr +
                    " must be an array! " + JSON.stringify(v) + " is not admissible!"));
                break;
              }
              if (v.length !== range.size) {
                constrVio.push( new RangeConstraintViolation("The value of " + attr +
                    " must be an array of length " + range.size + "! " + JSON.stringify(v) + " is not admissible!"));
                break;
              }
              for (let i = 0; i < v.length; i++) {
                if (!dt.isOfType(v[i], range.itemType)) {
                  constrVio.push( new RangeConstraintViolation("The items of " + attr +
                      " must be of type " + range.itemType + "! " + JSON.stringify(v) +
                      " is not admissible!"));
                }
              }
              break;
            case "ArrayList":
              if (!Array.isArray(v)) {
                constrVio.push( new RangeConstraintViolation("The value of " + attr +
                    " must be an array! " + JSON.stringify(v) + " is not admissible!"));
                break;
              }
              for (let i = 0; i < v.length; i++) {
                if (!dt.isOfType(v[i], range.itemType)) {
                  constrVio.push( new RangeConstraintViolation("The items of " + attr +
                      " must be of type " + range.itemType + "! " + JSON.stringify(v) +
                      " is not admissible!"));
                }
              }
              break;
          }
        }
      } else if (range === Object) {
        for (const v of valuesToCheck) {
          if (!(v instanceof Object)) {
            constrVio.push( new RangeConstraintViolation("The value of " + attr +
                " must be a JS object! " + JSON.stringify(v) + " is not admissible!"));
          }
        }
      }
    }
    // return constraint violations found in range constraint checks
    if (constrVio.length > 0) return constrVio;

    /********************************************************
     ***  Check constraints that apply to several ranges  ***
     ********************************************************/
    if (range === "String" || range === "NonEmptyString") {
      for (const v of valuesToCheck) {
        if (min !== undefined && v.length < min) {
          constrVio.push( new StringLengthConstraintViolation("The length of "+
              attr + " must not be smaller than "+ min));
        } else if (max !== undefined && v.length > max) {
          constrVio.push( new StringLengthConstraintViolation("The length of "+
              attr + " must not be greater than "+ max));
        } else if (pattern !== undefined && !pattern.test( v)) {
          constrVio.push( new PatternConstraintViolation( msg || v +
              "does not comply with the pattern defined for "+ attr));
        }
      }
    }
    // check Interval Constraints
    if (dt.isNumberType( range)) {
      for (const v of valuesToCheck) {
        if (min !== undefined && v < min) {
          constrVio.push( new IntervalConstraintViolation( attr +
              " must be greater than "+ min));
        } else if (max !== undefined && v > max) {
          constrVio.push( new IntervalConstraintViolation( attr +
              " must be smaller than "+ max));
        }
      }
    }
    // return constraint violations found in range constraint checks
    if (constrVio.length > 0) return constrVio;

    /********************************************************
     ***  Check cardinality constraints  *********************
     ********************************************************/
    if (maxCard > 1) { // (a multi-valued attribute can be array- or map-valued)
      // check minimum cardinality constraint
      if (minCard > 0 && valuesToCheck.length < minCard) {
        constrVio.push( new CardinalityConstraintViolation(
            `A collection of at least ${minCard} values is required for ${attr}`));
      }
      // check maximum cardinality constraint
      if (valuesToCheck.length > maxCard) {
        constrVio.push( new CardinalityConstraintViolation("A collection value for "+
            attr +" must not have more than "+ maxCard +" members!"));
      }
    }
    if (constrVio.length === 0) {
      // return de-serialized value available in validationResult.checkedValue
      constrVio.push( new NoConstraintViolation( maxCard === 1 ? valuesToCheck[0] : valuesToCheck));
    }
    return constrVio;
  }
}
dt.numericTypes = dt.integerTypes.concat( dt.decimalTypes);
dt.primitiveDatatypes = [...dt.stringTypes, ...dt.numericTypes, ...dt.otherPrimitiveTypes];
dt.supportedDatatypes = [...dt.primitiveDatatypes, ...dt.structuredDataTypes];
