class Processing extends aCTIVITY {
  constructor({id, startTime, duration, workStation}={}) {
    super({id, startTime, duration});
    this.workStation = workStation;
  }
  static duration() {
    return rand.triangular( 3, 8, 4);  // min,max,mode
  }
}
Processing.resourceRoles = {
  "workStation": {range: WorkStation, card: 1}
}
