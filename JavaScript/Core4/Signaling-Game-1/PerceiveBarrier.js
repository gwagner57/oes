class PerceiveBarrier extends pERCEPTIONeVENT {
  constructor({ occTime, delay, perceiver, length}) {
    super({occTime, delay, perceiver});
    this.length = length;
  }
  onEvent() {
    const followupEvents=[],
          percept = {type:"barrier", length: this.length};
    this.perceiver.perceive( percept);
    return followupEvents;
  }
}
PerceiveBarrier.labels = {"length":"len"};

