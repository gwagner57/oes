/***********************************************************
*** Run with "gulp" (for coreworker) and "gulp coreui" 
***********************************************************/

const { src, dest } = require('gulp');
const concat = require('gulp-concat');
//const uglify = require('gulp-uglify');

const targetdir = "../../../../sim4edu/OESjs/Core2/framework/";
const workerSrcFiles = [
    "init-oes.js", "OES-Foundation.js", "OES-Activities.js", "simulator.js"
  ];
const uiSrcFiles = ["simulatorUI.js", "index.js"];

const coreworker = function () {
  return src( workerSrcFiles)
    .pipe( concat('core2-worker-oes.js'))
//    .pipe(uglify())
    .pipe( dest( targetdir));
};
exports.default = coreworker;

const coreui = function () {
  return src( uiSrcFiles)
    .pipe( concat('core2-ui-oes.js'))
//    .pipe(uglify())
    .pipe( dest( targetdir));
};
exports.coreui = coreui;