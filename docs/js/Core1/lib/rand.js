var rand = Object.create(null);
rand.LOG4 = Math.log(4.0);
rand.SG_MAGICCONST = 1.0 + Math.log(4.5);

rand.exponential = function (lambda) {
  if (arguments.length != 1) {                         // ARG_CHECK
    throw new SyntaxError("exponential() must "     // ARG_CHECK
        + " be called with 'lambda' parameter"); // ARG_CHECK
  }                                                   // ARG_CHECK
  var r = rand.gen();
  return -Math.log(r) / lambda;
};

rand.gamma = function (alpha, beta) {
  if (arguments.length != 2) {                         // ARG_CHECK
    throw new SyntaxError("gamma() must be called"  // ARG_CHECK
        + " with alpha and beta parameters"); // ARG_CHECK
  }                                                   // ARG_CHECK
  /* Based on Python 2.6 source code of random.py.
   */
  if (alpha > 1.0) {
    var ainv = Math.sqrt(2.0 * alpha - 1.0);
    var bbb = alpha - rand.LOG4;
    var ccc = alpha + ainv;
    while (true) {
      var u1 = rand.gen();
      if ((u1 < 1e-7) || (u > 0.9999999)) {
        continue;
      }
      var u2 = 1.0 - rand.gen();
      var v = Math.log(u1 / (1.0 - u1)) / ainv;
      var x = alpha * Math.exp(v);
      var z = u1 * u1 * u2;
      var r = bbb + ccc * v - x;
      if ((r + rand.SG_MAGICCONST - 4.5 * z >= 0.0) || (r >= Math.log(z))) {
        return x * beta;
      }
    }
  } else if (alpha == 1.0) {
    var u = rand.gen();
    while (u <= 1e-7) {
      u = rand.gen();
    }
    return - Math.log(u) * beta;
  } else {
    while (true) {
      var u = rand.gen();
      var b = (Math.E + alpha) / Math.E;
      var p = b * u;
      if (p <= 1.0) {
        var x = Math.pow(p, 1.0 / alpha);
      } else {
        var x = - Math.log((b - p) / alpha);
      }
      var u1 = rand.gen();
      if (p > 1.0) {
        if (u1 <= Math.pow(x, (alpha - 1.0))) {
          break;
        }
      } else if (u1 <= Math.exp(-x)) {
        break;
      }
    }
    return x * beta;
  }

};

rand.normal = function (mu, sigma) {
  if (arguments.length != 2) {                          // ARG_CHECK
    throw new SyntaxError("normal() must be called"  // ARG_CHECK
        + " with mu and sigma parameters");      // ARG_CHECK
  }                                                    // ARG_CHECK
  var z = rand.lastNormal;
  rand.lastNormal = NaN;
  if (!z) {
    var a = rand.gen() * 2 * Math.PI;
    var b = Math.sqrt(-2.0 * Math.log(1.0 - rand.gen()));
    z = Math.cos(a) * b;
    rand.lastNormal = Math.sin(a) * b;
  }
  return mu + z * sigma;
};

rand.pareto = function (alpha) {
  if (arguments.length != 1) {                         // ARG_CHECK
    throw new SyntaxError("pareto() must be called" // ARG_CHECK
        + " with alpha parameter");             // ARG_CHECK
  }                                                   // ARG_CHECK
  var u = rand.gen();
  return 1.0 / Math.pow((1 - u), 1.0 / alpha);
};

rand.weibull = function (alpha, beta) {
  if (arguments.length != 2) {                         // ARG_CHECK
    throw new SyntaxError("weibull() must be called" // ARG_CHECK
        + " with alpha and beta parameters");    // ARG_CHECK
  }                                                   // ARG_CHECK
  var u = 1.0 - rand.gen();
  return alpha * Math.pow(-Math.log(u), 1.0 / beta);
};

rand.triangular = function (lower, upper, mode) {
  // http://en.wikipedia.org/wiki/Triangular_distribution
  if (arguments.length != 3) {
    throw new SyntaxError("triangular() must be called"
        + " with 3 parameters (lower, upper and mode)");
  }
  if (!(lower < upper && lower <= mode && mode <= upper)) {
    throw new SyntaxError("The lower, upper and mode parameters " +
        "must satisfy the conditions l < U and l <= m <= u!");
  }
  var c = (mode - lower) / (upper - lower);
  var u = rand.gen();
  if (u <= c) {
    return lower + Math.sqrt(u * (upper - lower) * (mode - lower));
  } else {
    return upper - Math.sqrt((1 - u) * (upper - lower) * (upper - mode));
  }
};

rand.uniform = function (lower, upper) {
  if (arguments.length === 1) {
    throw new SyntaxError("uniform(lower, upper) must be called"
        + " 1. with lower and upper parameters [e.g., uniform(lower, upper)] or "
        + " 2. without any parameter [e.g., uniform()]");
  } else if (arguments.length >= 2) {
    return lower + rand.gen() * (upper - lower);
  } else {
    return rand.gen();
  }
};
/***
 Added by Gerd Wagner (20160921)
 */
rand.uniformInt = function (lower, upper) {
  if (arguments.length != 2 ||
      !(Number.isInteger(lower) && Number.isInteger(upper))) {
    throw new SyntaxError("uniformInt() must be called"
        + " with lower and upper integer values!");
  }
  return lower + Math.floor( rand.gen() * (upper - lower + 1));
};

rand.frequency = function (freqMap) {
  if (typeof freqMap !== "object") {
    throw new SyntaxError("rand.frequency() must be called"
        + " with a frequency map argument!");
  }
  var probabilities = Object.values( freqMap);
  if (math.sum( probabilities) !== 1 ) {
    throw new SyntaxError("rand.frequency(): rel. frequency values " +
        "do not add up to 1!");
  }
  var cumProb=0;
  var cumProbs = probabilities.map( function (p) {
    cumProb += p;
    return cumProb;
  });
  var valueStrings = Object.keys( freqMap);
  var valuesAreNumeric = !isNaN( parseInt( valueStrings[0]));
  var randX = rand.gen();
  for (let i=0; i <= cumProbs.length; i++) {
    if (randX < cumProbs[i])
      return valuesAreNumeric ? parseInt(valueStrings[i]) : valueStrings[i];
  }
};

/**
 * Shuffles array in place using the Fisher-Yates shuffle algorithm
 * @param {Array} a - An array of items to be shuffled
 */
rand.shuffleArray = function (a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i -= 1) {
    j = Math.floor( rand.gen() * (i + 1) );
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
};
