class GoToHookWebpage extends aCTION {
  constructor({ occTime, delay, performer, webpage}) {
    super({occTime, delay, performer});
    this.webpage = webpage;
  }
  onEvent() {
    const followupEvents=[];
    followupEvents.push( new LookAtHookWebpage({delay: 5, quantity: this.quantity,
      perceiver: this.performer.downStreamNode}));
    return followupEvents;
  }
}
GoToHookWebpage.labels = {"className":"Ship", "quantity":"qty","receiverId":"to"};

