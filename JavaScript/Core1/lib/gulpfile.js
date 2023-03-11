/*****************************************************************
*** Run with "gulp" (for worker-library) and "gulp ui1"|"gulp ui2"
*****************************************************************/

const { src, dest } = require('gulp');
const concat = require('gulp-concat');
//const terser = require('gulp-terser');
//const rename = require('gulp-rename');
//const replace = require('gulp-replace');

const dir = {
  //html: {src: ['./src/**/*.html'], dest: './dist/'},
  lib: "../../../../sim4edu/OESjs/Core1/lib/",
}

const workerlib = function () {
  return src([
    "seedrandom.min.js", "rand.js", "util.js", 
    "math.js", "idb5.js", "EventList.js", "eNUMERATION.js"
  ])
    .pipe( concat('worker-library-files.js'))
    //.pipe( terser().on('error', (error) => console.log(error)))
    //.pipe( rename({ suffix: '.min' }))
    .pipe( dest( dir.lib));
};
exports.default = workerlib;

const ui1 = function () {
  return src([
    "util.js", "datatypes.js", "constraint-violation-error-types.js", "eNUMERATION.js",
    "ui/SingleRecordTableWidget.js", "ui/EntityTableWidget.js",
    "ui/dom.js", "ui/svg.js",
    "math.js", "idb5.js",
    "../framework/init-oes.js", "../framework/OES-Foundation.js"
  ])
    .pipe( concat('ui-files1.js'))
    //.pipe( terser().on('error', (error) => console.log(error)))
    //.pipe( rename({ suffix: '.min' }))
    .pipe( dest( dir.lib));
};
const ui2= function () {
  return src([
    "../framework/simulatorUI.js", "../framework/index.js"
  ])
      .pipe( concat('ui-files2.js'))
      //.pipe( terser().on('error', (error) => console.log(error)))
      //.pipe( rename({ suffix: '.min' }))
      .pipe( dest( dir.lib));
};
exports.ui1 = ui1;
exports.ui2 = ui2;