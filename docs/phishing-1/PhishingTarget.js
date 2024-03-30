class PhishingTarget extends aGENT {
  constructor({ id, name, assetsTUSD=100, trustedDomainNames, susceptibility}) {
    super({id, name});
    this.assetsTUSD = assetsTUSD;
    if (trustedDomainNames === undefined) this.trustedDomainNames = ["postbank","dhl"]
    this.susceptibility = susceptibility;
  }
  // the target does not get/see the real sender address, but only the message.sender
  onReceive( message, sender, roundBased) {
    switch (message.type) {
    case "LureMessage":
      // (1) assess sender address and message subject
      const headerCredibility = this.getMessageHeaderCredibility( message);
      if (headerCredibility*this.susceptibility > 0.5) {  // (2) read and assess message body
        const bodyCredibility = this.getMessageBodyCredibility( message.body);
        if (bodyCredibility*this.susceptibility > 0.5) {  // (3) go to hook webpage
          this.perform( new VisitHookPage({ performer: this, hookPage: message.hookPage,
              impersonatedAgent: message.impersonatedAgent}));
        }
      }
      break;
    }
    // return [resultingStateChanges, resultingFutureEvents];
  }
  onPerceive( perceptionEvt, roundBased) {
    switch (perceptionEvt.constructor.name) {
    case "LookAtHookPage":
      const data = {bankAccountNo:"0123456789", userName:"gwagner", passowrd:"gwagner"};
      const hookPageCredibility = this.getHookPageCredibility( perceptionEvt.hookPage);
      if (hookPageCredibility > 0.7) {  // provide exploitable data
        this.perform( new ProvideExploitableData({ performer:this,
            hookPage: perceptionEvt.hookPage, data}));
      }
      break;
    }
    // return [resultingStateChanges, resultingFutureEvents];
  }
  getMessageHeaderCredibility( message) {
    function credibilityOfSubject( msgSubject) {
      var credibility=0;
      //TODO: check message subject for credibility
      credibility = 1;
      return credibility;
    }
    //TODO: extract sender domain name from message.sender
    const senderDomainName = "postbank";
    var headerDataCredibility=0;
    const subjectCredibility = credibilityOfSubject( message.subject);
    if (this.trustedDomainNames.includes( senderDomainName) &&
        subjectCredibility > 0.7) {
      headerDataCredibility = subjectCredibility;
    }
    return headerDataCredibility;
  }
  getMessageBodyCredibility( msgBody) {
    //TODO: check message body for credibility
    var credibility=0;
    credibility = 1;
    return credibility;
  }
  getHookPageCredibility( hookPage) {
    //TODO: check hook page for credibility
    var credibility=0;
    credibility = 1;
    return credibility;
  }
}
PhishingTarget.labels = {className:"PhishTarg", assetsTUSD:"TUSD"};
