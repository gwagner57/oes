/***********************************************************
*** Run with "gulp" (for coreworker) and "gulp coreui" 
***********************************************************/

const { src, dest } = require('gulp');
const concat = require('gulp-concat');
//const uglify = require('gulp-uglify');

const targetdir = "../../../../sim4edu/OESjs/Core1/framework/";
const workerSrcFiles = [
    "init-oes.js", "OES-Foundation.js", "simulator.js"
  ];
const uiSrcFiles = ["simulatorUI.js", "index.js"];

const coreworker = function () {
  return src( workerSrcFiles)
    .pipe( concat('core1-worker-oes.js'))
//    .pipe(uglify())
    .pipe( dest( targetdir));
};
exports.default = coreworker;

const coreui = function () {
  return src( uiSrcFiles)
    .pipe( concat('core1-ui-oes.js'))
//    .pipe(uglify())
    .pipe( dest( targetdir));
};
exports.coreui = coreui;