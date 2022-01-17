class Speaker extends rEINFORCEMENTlEARNINGaGENT {
  constructor({ id, name, jumper, learnMatrix = [[0.33, 0.33, 0.33],
        [0.33, 0.33, 0.33], [0.33, 0.33, 0.33]]}) {
    super({id, name, learnFunction: new LearningMatrix( learnMatrix)});
    // id or object reference
    this.jumper = typeof jumper === "object" ? jumper : sim.objects[jumper];
  }
  perceive( percept) {
    switch (percept.type) {
    case "barrier":
      const stateTypeNo = percept.length,   // 1,2,3
            actionNo = this.learnFunction.getActionNo( stateTypeNo),  // 1,2,3
            lengthSignal = "ABC".charAt( actionNo - 1),   // "A","B","C"
            message = {type:"SIGNAL", value: lengthSignal};
      // save stateType/action pair for later update of the learning function
      this.currentStateTypeNo = stateTypeNo;
      this.chosenActionNo = actionNo;
      // create follow-up event
      sim.schedule( new mESSAGEeVENT({ message, sender:this, receiver: this.jumper}));
      break;
    }
  }
  reset() {
    this.currentStateTypeNo = 0;
    this.chosenActionNo = 0;
  }
}
