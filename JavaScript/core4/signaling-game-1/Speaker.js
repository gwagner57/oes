class Speaker extends rEINFORCEMENTlEARNINGaGENT {
  constructor({ id, name, jumper, learnMatrix = [[0.33, 0.33, 0.33],
        [0.33, 0.33, 0.33], [0.33, 0.33, 0.33]]}) {
    super({id, name, learnFunction: new LearningMatrix( learnMatrix)});
    // id or object reference
    this.jumper = typeof jumper === "object" ? jumper : sim.objects.get( jumper);
  }
  onPerceive( perceptionEvt) {
    switch (perceptionEvt.constructor.name) {
    case "PerceiveBarrier":
      const stateTypeNo = perceptionEvt.length,   // 1,2,3
            actionNo = this.learnFunction.getActionNo( stateTypeNo),  // 1,2,3
            lengthSignal = "ABC".charAt( actionNo - 1);   // "A","B","C"
      // save stateType/action pair for later update of the learning function
      this.currentStateTypeNo = stateTypeNo;
      this.chosenActionNo = actionNo;
      this.send({ type:"JumpLengthSignal", lengthSignal}, this.jumper);
      //sim.schedule( new SendJumpLengthSignal({ lengthSignal, sender:this, receiver: this.jumper}));
      break;
    }
  }
  reset() {
    this.currentStateTypeNo = 0;
    this.chosenActionNo = 0;
  }
}
