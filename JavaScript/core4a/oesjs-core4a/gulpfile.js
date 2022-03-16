const { src, dest } = require('gulp');
const concat = require('gulp-concat');

const jsBundle = function () {
  return src([
    "OES-Foundation.js", "OES-Activities.js", 
	//"OES-ProcessingNetworks.js", 
	"OES-Agents.js", "simulator.js"
  ])
    .pipe( concat('core4-oes.js'))
    .pipe( dest('.'));
};

exports.default = jsBundle;