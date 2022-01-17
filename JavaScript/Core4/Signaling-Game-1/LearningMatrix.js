/***
 * A learning matrix as a simple type of RL decision function
 */
class LearningMatrix extends Array {
  constructor( m, learningSensitivity) {
    // spread the array (of arrays) to a list of arguments as required for the Array constructor
    super(...m);
    // used for increasing/decreasing the learning matrix probabilities
    this.learningSensitivity = learningSensitivity || 0.5;
  }
  normalize( r) {
    const R = this[r];   // a row of this matrix
    let rowSum = 0;
    for (const p of R) {  // for each number of array R
      rowSum = rowSum + p;
    }
    for (let j = 0; j < R.length; j++) {
      R[j] = R[j] / rowSum;
      R[j] = (Math.floor( R[j]*100)) / 100;
    }
  }
  getActionNo( row) {
    const R = this[row-1];   // a row of this matrix
    let max = 0;
    for (let j = 1; j < R.length; j++) {
      if (R[j] > R[max]) max = j;
    }
    return max + 1;
  }
  learnSuccess( row, col) {
    const colIndex = col-1, R = this[row-1];
    R[colIndex] = R[colIndex] * (1 + this.learningSensitivity);
    for (let j = 0; j < R.length; j++) {
      if (j !== colIndex) {
        R[j] = (1 - this.learningSensitivity) * R[j];
      }
    }
    this.normalize(row-1);
    //console.log("Success "+ this.toString());
  }
  learnFailure( row, col) {  // instead of "failureUpdate"
    const colIndex = col - 1, R = this[row-1];
    R[colIndex] = R[colIndex] * (1 - this.learningSensitivity);
    for (let j = 0; j < R.length; j++) {
      if (j !== colIndex) {
        R[j] = (1 + this.learningSensitivity) * R[j]
      }
    }
    this.normalize(row-1);
    //console.log("Failure "+ this.toString());
  }

  toString() {
    const P = this, M = P.length, N = P[0].length;
    let outputMess = "";
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < N; j++) {
        outputMess += (P[i][j] + " ");
      }
      outputMess += "\n";
    }
    return outputMess;
  }
}
