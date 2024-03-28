class VisitHookPage extends aCTION {
  constructor({ occTime, delay, performer, hookPage}) {
    super({occTime, delay, performer});
    this.hookPage = hookPage;
  }
  onEvent() {
    const followupEvents=[];
    followupEvents.push( new LookAtHookPage({delay: 5, perceiver: this.performer, 
        hookPage: this.hookPage}));
    return followupEvents;
  }
}
VisitHookPage.labels = {"className":"Ship", "quantity":"qty","receiverId":"to"};

