class Jump extends rEINFORCEMENTlEARNINGaCTION {
  constructor({ occTime, delay, performer, jumpLength}) {
    super({occTime, delay, performer,
        success: jumpLength === Jump.barrier.length + 1,
        othersToBeRewarded: [Jump.speaker]});
    this.jumpLength = jumpLength;
  }
  onEvent() {
    const followupEvents=[];
    // invoke event routine of rEINFORCEMENTlEARNINGaCTION
    followupEvents.push(...super.onEvent());
    this.performer.position += this.jumpLength;
    sim.stat.nmrOfJumps++;
    // skip the first 25 attempts for the statistics
    if (sim.stat.nmrOfJumps > 25) {
      if (this.success) sim.stat.jumpSuccessAfterFirst25Attempts++;
      else sim.stat.jumpFailureAfterFirst25Attempts++;
    }
    return followupEvents;
  }
}
Jump.labels = {"jumpLength":"len"};

