class PerceiveBarrier extends pERCEPTIONeVENT {
  constructor({ occTime, delay, perceiver, length}) {
    super({occTime, delay, perceiver});
    this.length = length;
  }
  onEvent() {
    const percept = {type:"barrier", length: this.length};
    this.perceiver.onPerceive( percept);
    return [];  // no follow-up events
  }
}
PerceiveBarrier.labels = {"length":"len"};

