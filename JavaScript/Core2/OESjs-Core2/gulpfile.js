const { src, dest } = require('gulp');
const concat = require('gulp-concat');

const jsBundle = function () {
  return src([
    "init-oes.js", "OES-Foundation.js", "OES-Activities.js", "simulator.js"
  ])
    .pipe( concat('core2-oes.js'))
    .pipe( dest('.'));
};

exports.default = jsBundle;