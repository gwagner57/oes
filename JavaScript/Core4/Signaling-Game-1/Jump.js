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
    if (this.success) sim.stat.jumpSuccess++;
    else sim.stat.jumpFailure++;
    sim.stat.nmrOfJumps++;
    return followupEvents;
  }
}
Jump.labels = {"jumpLength":"len"};

