class StartOver extends eVENT {
  constructor({ occTime, delay, barrier, speaker, jumper}) {
    super({occTime, delay});
    this.barrier = barrier;
    this.speaker = speaker;
    this.jumper = jumper;
  }
  onEvent() {
    const followupEvents=[];
    const barrierLength = rand.uniformInt( 1, 3);
    this.barrier.length = barrierLength;
    this.speaker.reset();  // reset the speaker
    this.jumper.reset();  // reset the jumper
    followupEvents.push( new PerceiveBarrier({length: barrierLength, perceiver: this.speaker}));
    return followupEvents;
  }
  createNextEvent() {
    if (StartOver.maxNmrOfEvents && StartOver.counter >= StartOver.maxNmrOfEvents) {
      return null;
    } else {
      StartOver.counter++;
      return new StartOver({barrier: this.barrier, speaker: this.speaker, jumper: this.jumper});
    }
  }
  static recurrence() {
    return 4;
  }
}
StartOver.counter = 1;  // counting the initial event at 1