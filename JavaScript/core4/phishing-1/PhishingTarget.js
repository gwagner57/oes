class PhishingTarget extends aGENT {
  constructor({ id, name, assetsTUSD=100, susceptibility=1}) {
    super({id, name});
    this.assetsTUSD = assetsTUSD;
    this.susceptibility = susceptibility;
  }
  onReceive( message, sender, roundBased) {
    switch (message.type) {
    case "LureMessage":
      // (1) assess sender address and message subject
      // (2) read and assess message body
      // (3) go to hook webpage
      break;
    }
    // return [resultingStateChanges, resultingFutureEvents];
  }
  onPerceive( perceptionEvt, roundBased) {
    switch (perceptionEvt.constructor.name) {
    case "LookAtHookWebpage":
      // provide exploitable data
      break;
    }
    // return [resultingStateChanges, resultingFutureEvents];
  }
}
PhishingTarget.labels = {className:"PhishTarg", susceptibility:"susc"};
