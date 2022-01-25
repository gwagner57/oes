class SendJumpLengthSignal extends mESSAGEeVENT {
  constructor({ occTime, delay, lengthSignal, sender, receiver}) {
    super({occTime, delay, sender, receiver});
    this.lengthSignal = lengthSignal;
  }
  onEvent() {
    const followupEvents=[],
          message = {type:"JumpLengthSignal", lengthSignal: this.lengthSignal};
    this.receiver.onReceive( message, this.sender);
    return followupEvents;
  }
}
SendJumpLengthSignal.labels = {"lengthSignal":"sign"};

