/*******************************************************************************
 * Math/Statistics Library for OESCore
 *
 * @copyright Copyright 2020 Gerd Wagner
 *   Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

/****************************************************************
 ****************************************************************/
const math = {};
/**
 * Compute the Cartesian Product of an array of arrays
 * From https://stackoverflow.com/a/36234242/2795909
 * @param {Array} arr - An array of arrays of values to be combined
 */
math.cartesianProduct = function (arr) {
  return arr.reduce( function (a,b) {
    return a.map( function (x) {
      return b.map( function (y) {
        return x.concat(y);
      })
    }).reduce( function (a,b) {return a.concat(b)}, [])
  }, [[]])
};
/**
 * Round a decimal number to decimalPlaces
 * @param {number} x - the number to round
 * @param {number} d - decimal places
 */
math.round = function (x,d) {
  var roundingFactor = Math.pow(10, d);
  return Math.round((x + Number.EPSILON) * roundingFactor) / roundingFactor;
};
/**
 * Compute the sum of an array of numbers
 * @param {Array} data - An array of numbers
 */
math.sum = function (data) {
  function add( a, b) {return a + b;}
  return data.reduce( add, 0);
};
/**
 * Compute the max/min of an array of numbers
 * @param {Array} data - An array of numbers
 */
math.max = function (data) {
  return Math.max( ...data);
};
math.min = function (data) {
  return Math.min( ...data);
};
/**
 * Compute the arithmetic mean of an array of numbers
 * @param {Array} data - An array of numbers
 */
math.mean = function (data) {
  return math.sum( data) / data.length;
};
/**
 * Compute the standard deviation of an array of numbers
 * @param {Array} data - An array of numbers
 */
math.stdDev = function (data) {
  var m = math.mean( data);
  return Math.sqrt( data.reduce( function (acc, x) {
    return acc + Math.pow( x - m, 2);}, 0) / (data.length - 1));
};
// Returns a random number between min (inclusive) and max (exclusive)
math.getUniformRandomNumber = function (min, max) {
  return Math.random() * (max - min) + min;
}
// Returns a random integer between min (included) and max (included)
math.getUniformRandomInteger = function (min, max) {
  return Math.floor( Math.random() * (max - min + 1)) + min;
}
/**
 * Compute the confidence interval of an array of numbers. Based on
 *   Efron, B. (1985). Bootstrap confidence intervals for a class of parametric
 *   problems. Biometrika, 72(1), 45-58.
 * @param {Array<number>} data - An array of numbers
 * @param {number} samples - Number of bootstrap samples (default 10000)
 * @param {number} alpha - Confidence interval to estimate [0,1] (default 0.95)
 * @returns {{lowerBound:number, upperBound:number}} Lower and upper bound of confidence interval
 */
math.confInt = function ( data, samples, alpha ) {
  var n = samples || 10000;
  var p = alpha || 0.95;
  var mu = Array( n );
  var m = math.mean( data );
  var len = data.length;
  // Calculate bootstrap samples
  for (let i = 0; i < n; i++) {
    let t = 0;
    for (let j = 0; j < len; j++) {
      t += data[ Math.floor( Math.random() * len ) ];
    }
    mu[ i ] = ( t / len ) - m;
  }
  // Sort in ascending order
  mu.sort((a,b) => a - b);
  // Return the lower and upper confidence interval
  return {
    lowerBound: m - mu[ Math.floor( Math.min( n - 1,
        n * ( 1 - ( ( 1 - p ) / 2 ) ) ) ) ],
    upperBound: m - mu[ Math.floor( Math.max( 0, n * ( ( 1 - p ) / 2 ) ) ) ]
  };
};
/**
 * Define summary statistics record
 */
math.stat = Object.create( null);
math.stat.summary = {
  average: {label:"Average", f: math.mean},
  stdDev: {label:"Std.dev.", f: math.stdDev},
  min: {label:"Minimum", f: math.min},
  max: {label:"Maximum", f: math.max},
  confIntLowerBound: {label: "CI Lower", f: function ( data ) {
      math.stat.CurrentCI = math.confInt( data ); // {lowerBound: x, upperBound: y}
      return math.stat.CurrentCI.lowerBound;
  }},
  confIntUpperBound: {label: "CI Upper", f: function () {
      return math.stat.CurrentCI.upperBound;
  }}
};


confInt([1,2,3,4,5], 10000, 0.95);