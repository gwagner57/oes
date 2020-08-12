 /*******************************************************************************
 * cLASS allows defining constructor-based JavaScript classes and
 * class hierarchies based on a declarative description of the form:
 *
 *   var MyObject = new cLASS({
 *     Name: "MyObject",
 *     supertypeName: "MySuperClass",
 *     properties: {
 *       "myAdditionalAttribute": {range:"Integer", label:"...", max: 7, ...}
 *     },
 *     methods: {
 *     }
 *   });
 *   var myObj = new MyObject({id: 1, myAdditionalAttribute: 7});
 *   // test if instance of MyObject
 *   if (myObj.constructor.Name ==="MyObject") ...
 *   // or, alternatively,
 *   if (myObj instanceof MyObject) ...
 *
 * @copyright Copyright 2015-2016 Gerd Wagner, Chair of Internet Technology,
 *   Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/
function cLASS (classSlots) {
  var props = classSlots.properties || {},
      methods = classSlots.methods || {},
      supertypeName = classSlots.supertypeName,
      superclass=null, constr=null,
      propsWithInitialValFunc = [];
  // check Class definition constraints
  if (supertypeName && !cLASS[supertypeName]) {
    throw "Specified supertype "+ supertypeName +" has not been defined!";
  }
   if (!Object.keys( props).every( function (p) {
         return !!props[p].range
       }) ) {
     throw "No range defined for some property of class "+ classSlots.Name +" !";
   }
  // define new class as constructor function
  constr = function (instanceSlots) {
    if (supertypeName) {
      // invoke supertype constructor
      cLASS[supertypeName].call( this, instanceSlots);
    }
    // assign own properties
    Object.keys( props).forEach( function (p) {
      var range = props[p].range, val;
      if (typeof( instanceSlots) === "object" && instanceSlots[p]) {
        val = instanceSlots[p];
        if (typeof(range) == "string" && cLASS[range] &&
             typeof(val) !== "object") {  // convert IdRef to object ref.
          this[p] = cLASS[range].instances[String(val)];
        } else this[p] = val;
        delete instanceSlots[p];
      } else if (props[p].initialValue !== undefined) {
        if (typeof props[p].initialValue === "function")
          propsWithInitialValFunc.push(p);
        else this[p] = props[p].initialValue;
      } else if (!props[p].optional) {
        if (cLASS.isIntegerType(range) || cLASS.isDecimalType(range)) {
          this[p] = 0;
        } else if (range==="String") {
          this[p] = "";
        } else if (range==="Boolean") {
          this[p] = false;
        }
      }
    }, this);
    // call the functions for initial values, with the object as parameter
    // NOTE: this can only be called now, after all the properties were processed,
    //       otherwise some properties may not have the desired value(s) since Object.keys
    //        returns the properties in a non predictable order.
    propsWithInitialValFunc.forEach( function (p) {
      this[p] = props[p].initialValue.call(this);
    }, this);
    // assign remaining fields not defined as properties by the object's class
    if (typeof( instanceSlots) === "object") {
      Object.keys( instanceSlots).forEach( function (f) {
        this[f] = instanceSlots[f];
      }, this);
    }

    if (!classSlots.isAbstract && "id" in this) {
      // add new object to the population (extension) of the class
      cLASS[classSlots.Name].instances[String(this.id)] = this;
    }
  };
  // assign class-level (meta-)properties
  constr.constructor = cLASS;
  constr.Name = classSlots.Name;
  if (classSlots.isAbstract) constr.isAbstract = true;
  if (supertypeName) {
    constr.supertypeName = supertypeName;
    superclass = cLASS[supertypeName];
    // apply classical inheritance pattern
    constr.prototype = Object.create( superclass.prototype);
    constr.prototype.constructor = constr;
    // merge superclass property declarations with own property declarations
    constr.properties = Object.create( superclass.properties);
    Object.keys( props).forEach( function (p) {
      constr.properties[p] = props[p];
    });
  } else {
    constr.properties = props;
    // overwrite and improve the standard toString method
    constr.prototype.toString = function () {
      var str = this.constructor.Name + "{ ", i=0;
      Object.keys( this).forEach( function (key) {
        //if (!constr.properties[key]) console.log(key +" "+ JSON.stringify(constr.properties));
        var propLabel = cLASS[this.constructor.Name].properties[key] ?
              cLASS[this.constructor.Name].properties[key].label : key;
        if (this[key] !== undefined && propLabel) {
          str += (i>0 ? ", " : "") + propLabel +": "+ JSON.stringify( this[key]);
          i = i+1;
        }
      }, this);
      return str +"}";
    };
  }
  // assign instance-level methods
  Object.keys( methods).forEach( function (m) {
    constr.prototype[m] = methods[m];
  });
  // store class/constructor as value associated with its name in a map
  cLASS[classSlots.Name] = constr;
  // initialize the class-level instances property
   if (!classSlots.isAbstract) {
     cLASS[classSlots.Name].instances = {};
   }
  // return the class/constructor as the object constructed with new
  return constr;
}
 /**
  * Determine if a type is an integer type.
  * @method
  * @author Gerd Wagner
  * @param {string|eNUMERATION} T  The type to be checked.
  * @return {boolean}
  */
cLASS.isIntegerType = function (T) {
  return typeof(T)==="string" && T.includes('Integer') ||
      T instanceof eNUMERATION;
};
 /**
  * Determine if a type is a decimal type.
  * @method
  * @author Gerd Wagner
  * @param {string} T  The type to be checked.
  * @return {boolean}
  */
 cLASS.isDecimalType = function (T) {
   return typeof(T)==="string" &&
       (T==="Decimal" || T.includes('UnitInterval'));
 };
 /**
  * Generic method for checking the integrity constraints defined in property declarations.
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
  * @param {string} fld  The property for which a value is to be checked.
  * @param {object} decl  The property's declaration.
  * @param {string|number|boolean|object} val  The value to be checked.
  * @return {ConstraintViolation}  The constraint violation object.
  */
 cLASS.check = function (fld, decl, val) {
   var constrVio=null, valuesToCheck=[],
       msg = decl.patternMessage || "",
       minCard = decl.minCard || 0,  // by default, a multi-valued property is optional
       maxCard = decl.maxCard || 1,  // by default, a property is single-valued
       min = decl.min || 0, max = decl.max,
       range = decl.range,
       pattern = decl.pattern;
   if (val === undefined || val === "") {
     if (decl.optional) return new NoConstraintViolation();
     else {
       return new MandatoryValueConstraintViolation(
           "A value for "+ fld +" is required!");
     }
   }
   if (maxCard === 1) {  // single-valued property
     valuesToCheck = [val];
   } else {  // multi-valued property
     // can be array-valued or map-valued
     if (Array.isArray( val) ) {
       valuesToCheck = val;
     } else if (typeof( val) === "string") {
       valuesToCheck = val.split(",").map(function (el) {
         return el.trim();
       });
     } else {
       return new RangeConstraintViolation("Values for "+ fld +
           " must be arrays!");
     }
   }
   // convert integer strings to integers
   if (cLASS.isIntegerType( range)) {
     valuesToCheck.forEach( function (v,i) {
       if (typeof(v) === "string") valuesToCheck[i] = parseInt( v);
     });
   }
   // convert decimal strings to decimal numbers
   if (cLASS.isDecimalType( range)) {
     valuesToCheck.forEach( function (v,i) {
       if (typeof(v) === "string") valuesToCheck[i] = parseFloat( v);
     });
   }
   /*********************************************************************
    ***  Convert value strings to values and check range constraints ****
    ********************************************************************/
   switch (range) {
     case "String":
       valuesToCheck.forEach( function (v) {
         if (typeof(v) !== "string") {
           constrVio = new RangeConstraintViolation("Values for "+ fld +
               " must be strings!");
         }
       });
       break;
     case "NonEmptyString":
       valuesToCheck.forEach( function (v) {
         if (typeof(v) !== "string" || v.trim() === "") {
           constrVio = new RangeConstraintViolation("Values for "+ fld +
               " must be non-empty strings!");
         }
       });
       break;
     case "Integer":
       valuesToCheck.forEach( function (v) {
         if (!Number.isInteger(v)) {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be an integer!");
         }
       });
       break;
     case "NonNegativeInteger":
       valuesToCheck.forEach( function (v) {
         if (!Number.isInteger(v) || v < 0) {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be a non-negative integer!");
         }
       });
       break;
     case "PositiveInteger":
       valuesToCheck.forEach( function (v) {
         if (!Number.isInteger(v) || v < 1) {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be a positive integer (and not "+ v +")!");
         }
       });
       break;
     case "Number":
     case "Decimal":
       valuesToCheck.forEach( function (v) {
         if (typeof(v) !== "number") {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be a (decimal) number!");
         }
       });
       break;
     case "ClosedUnitInterval":
       valuesToCheck.forEach( function (v) {
         if (typeof(v) !== "number") {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be a (decimal) number!");
         } else if (v<0 || v>1) {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be a number in [0,1]!");
         }
       });
       break;
     case "OpenUnitInterval":
       valuesToCheck.forEach( function (v) {
         if (typeof(v) !== "number") {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be a (decimal) number!");
         } else if (v<=0 || v>=1) {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be a number in (0,1)!");
         }
       });
       break;
     case "Boolean":
       valuesToCheck.forEach( function (v,i) {
         if (typeof(v) === "string") {
           if (["true","yes"].includes(v)) valuesToCheck[i] = true;
           else if (["no","false"].includes(v)) valuesToCheck[i] = false;
           else constrVio = new RangeConstraintViolation("The value of "+ fld +
                 " must be either 'true'/'yes' or 'false'/'no'!");
         } else if (typeof(v) !== "boolean") {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be either 'true' or 'false'!");
         }
       });
       break;
     case "Date":
       valuesToCheck.forEach( function (v,i) {
         if (typeof(v) === "string" &&
             (/\d{4}-(0\d|1[0-2])-([0-2]\d|3[0-1])/.test(v) ||
             !isNaN( Date.parse(v)))) {
           valuesToCheck[i] = new Date(v);
         } else if (!(v instanceof Date)) {
           constrVio = new RangeConstraintViolation("The value of "+ fld +
               " must be either a Date value or an ISO date string. "+
               v +" is not admissible!");
         }
       });
       break;
     default:
       if (range instanceof eNUMERATION) {
         valuesToCheck.forEach( function (v) {
           if (!Number.isInteger( v) || v < 1 || v > range.MAX) {
             constrVio = new RangeConstraintViolation("The value "+ v +
                 " is not an admissible enumeration integer for "+ fld);
           }
         });
       } else if (Array.isArray( range)) {
         // *** Ad-hoc enumeration ***
         valuesToCheck.forEach( function (v) {
           if (range.indexOf(v) === -1) {
             constrVio = new RangeConstraintViolation("The "+ fld +" value "+ v +
                 " is not in value list "+ range.toString());
           }
         });
       } else if (typeof(range) == "string" && cLASS[range]) {
         // the range is a cLASS
         valuesToCheck.forEach( function (v,i) {
           if (typeof(v) === "string") v = valuesToCheck[i] = parseInt( v);
           if (!Number.isInteger(v)) {
             constrVio = new RangeConstraintViolation("The value ("+ val +") of property '"+
                 fld +"' is not an integer!");
           } else if (!cLASS[range].instances[String(v)]) {
             constrVio = new RangeConstraintViolation("The value ("+ v +") of property '"+
                 fld +"' is not an ID of any "+ range +" object!");
           }
         });
       } else if (typeof(range) == "object" && range.dataType !== undefined) {
         // the range is a (collection) datatype declaration record
         valuesToCheck.forEach( function (v) {
           var i=0;
           if (typeof(v) !== "object") {
             constrVio = new RangeConstraintViolation("The value of "+ fld +
                 " must be an object! "+ JSON.stringify(v) +" is not admissible!");
           }
           switch (range.dataType) {
           case "Array":
             if (!Array.isArray(v)) {
               constrVio = new RangeConstraintViolation("The value of "+ fld +
                   " must be an array! "+ JSON.stringify(v) +" is not admissible!");
               break;
             }
             if (v.length !== range.size) {
               constrVio = new RangeConstraintViolation("The value of "+ fld +
                   " must be an array of length 2! "+ JSON.stringify(v) +" is not admissible!");
               break;
             }
             for (i=0; i < range.size; i++) {
               if (!cLASS.isOfType( v[i], range.itemType)) {
                 constrVio = new RangeConstraintViolation("The items of "+ fld +
                     " must be of type "+ range.itemType +"! "+ JSON.stringify(v) +
                     " is not admissible!");
               }
             }
             break;
           }
         });
       } else if (range === Object) {
         valuesToCheck.forEach( function (v) {
           if (!(v instanceof Object)) {
             constrVio = new RangeConstraintViolation("The value of " + fld +
                 " must be a JS object! " + JSON.stringify(v) + " is not admissible!");
           }
         });
       }
   }
   // return constraint violation found in range switch
   if (constrVio) return constrVio;

   /********************************************************
    ***  Check constraints that apply to several ranges  ***
    ********************************************************/
   if (range === "String" || range === "NonEmptyString") {
     valuesToCheck.forEach( function (v) {
       if (min !== undefined && v.length < min) {
         constrVio = new StringLengthConstraintViolation("The length of "+
             fld + " must not be smaller than "+ min);
       } else if (max !== undefined && v.length > max) {
         constrVio = new StringLengthConstraintViolation("The length of "+
             fld + " must not be greater than "+ max);
       } else if (pattern !== undefined && !pattern.test( v)) {
         constrVio = new PatternConstraintViolation( msg || v +
             "does not comply with the pattern defined for "+ fld);
       }
     });
   }
   if (range === "Integer" || range === "NonNegativeInteger" ||
       range === "PositiveInteger") {
     valuesToCheck.forEach( function (v) {
       if (min !== undefined && v < min) {
         constrVio = new IntervalConstraintViolation( fld +
             " must be greater than "+ min);
       } else if (max !== undefined && v > max) {
         constrVio = new IntervalConstraintViolation( fld +
             " must be smaller than "+ max);
       }
     });
   }
   if (constrVio) return constrVio;

   /********************************************************
    ***  Check cardinality constraints  *********************
    ********************************************************/
   if (maxCard > 1) { // (a multi-valued property can be array-valued or map-valued)
     // check minimum cardinality constraint
     if (minCard > 0 && valuesToCheck.length < minCard) {
       return new CardinalityConstraintViolation("A collection of at least "+
           minCard +" values is required for "+ fld);
     }
     // check maximum cardinality constraint
     if (valuesToCheck.length > maxCard) {
       return new CardinalityConstraintViolation("A collection value for "+
           fld +" must not have more than "+ maxCard +" members!");
     }
   }
   val = maxCard === 1 ? valuesToCheck[0] : valuesToCheck;
   return new NoConstraintViolation( val);
 };
 /**
  * Convert property value to form field value.
  * @method
  * @author Gerd Wagner
  * @param {cLASS} Class  The domain of the property.
  * @param {string} prop  The property name.
  * @param {?} val  The value to be converted.
  * @return {boolean}
  */
 cLASS.convertPropValToStr = function ( Class, prop, val) {
   var eNUMERATION = eNUMERATION || undefined;  // make sure it can be tested
   var range = Class.properties[prop].range;
   if (val === undefined) return "";
   if (eNUMERATION && range instanceof eNUMERATION) return range.labels[val-1];
   if (typeof(val) === "string") return val;
   if (["number","boolean"].includes( typeof(val))) return String( val);
   if (range === "Date") return util.createIsoDateString( val);
   // show object as ID
   if (range.constructor === cLASS) return val["id"];
   // else
   return JSON.stringify( val);
 };
 /**
  * Check if a value is of some type.
  * @method
  * @author Gerd Wagner
  * @return {boolean}
  */
 cLASS.isOfType = function ( v, Type) {
   switch (Type) {
   case "String": return (typeof(v) === "string");
   case "NonEmptyString": return (typeof(v) === "string" && v.trim() !== "");
   case "Integer": return Number.isInteger(v);
   case "NonNegativeInteger": return (Number.isInteger(v) && v >= 0);
   case "PositiveInteger": return (Number.isInteger(v) && v > 0);
   case "Decimal": return (typeof(v) === "number");
   case "ClosedUnitInterval":
     return (typeof(v) === "number" && v>=0 && v<=1);
   case "OpenUnitInterval":
     return (typeof(v) === "number" && v>0 && v<1);
   default: return true;
 }
 };

 /********************************************************
  ***  Collection datatypes  *****************************
  ********************************************************/
/*
 * Collection datatypes are defined in the form of a "datatype definition record"
 * that specifies the collection type, the item type and the size of the collection.
 * For readability, collection datatypes can be defined in the form of function invocations
 * returning the corresponding datatype definition record like {dataType:"Array",
 * itemType:"Decimal", size: 3}.
 */
var c = {};  // the cLASS namespace prefix
c.Array = function (itemType, size) {
   return {dataType:"Array", itemType: itemType, size: size};
 };
c.ArrayList = function (itemType, constraints) {
   if (constraints) {
     return {dataType:"ArrayList", itemType: itemType, constraints: constraints};
   } else return {dataType:"ArrayList", itemType: itemType};
 };
 c.Map = function (itemType, constraints) {
   if (constraints) {
     return {dataType:"Map", itemType: itemType, constraints: constraints};
   } else return {dataType:"Map", itemType: itemType};
 };
