/***********************************************************
*** Run with "gulp" (for worker-library) and "gulp uilib" 
***********************************************************/


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

const uilib = function () {
  return src([
	"util.js", "datatypes.js", "constraint-violation-error-types.js",
    "ui/SingleRecordTableWidget.js", "ui/EntityTableWidget.js", "ui/svg.js", 
    "math.js", "idb5.js"
  ])
    .pipe( concat('ui-library-files.js'))
    //.pipe( terser().on('error', (error) => console.log(error)))
    //.pipe( rename({ suffix: '.min' }))
    .pipe( dest( dir.lib));
};
exports.uilib = uilib;