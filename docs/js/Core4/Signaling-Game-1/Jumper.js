class Jumper extends rEINFORCEMENTlEARNINGaGENT {
  constructor({ id, name, position, learnMatrix = [[0.25, 0.25, 0.25, 0.25],
      [0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25]]}) {
    super({id, name, learnFunction: new LearningMatrix( learnMatrix)});
    this.position = position;
  }
  onReceive( msg, sender) {
    switch (msg.type) {
    case "JumpLengthSignal":
      const lengthSignal = msg.lengthSignal,  // "A","B","C"
            stateTypeNo = {"A":1,"B":2,"C":3}[lengthSignal],  // map "A","B","C" to 1,2,3
            actionNo = this.learnFunction.getActionNo( stateTypeNo),  // 1,2,3,4
            jumpLength = actionNo;  // 1,2,3,4
      // save stateType/action pair for later update of the learning function
      this.currentStateTypeNo = stateTypeNo;
      this.chosenActionNo = actionNo;
      // create follow-up event
      sim.schedule( new Jump({ performer:this, jumpLength}));
      break;
    }
  }
  reset() {
    this.position = 0;
    this.currentStateTypeNo = 0;
    this.chosenActionNo = 0;
  }
}
Jumper.labels = {"position":"pos"};
