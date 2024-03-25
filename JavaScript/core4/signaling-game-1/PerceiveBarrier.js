class PerceiveBarrier extends pERCEPTIONeVENT {
  constructor({ occTime, delay, perceiver, length}) {
    super({occTime, delay, perceiver});
    this.length = length;
  }
}
PerceiveBarrier.labels = {"length":"len"};

