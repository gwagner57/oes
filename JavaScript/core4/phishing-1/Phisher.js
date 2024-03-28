class Phisher extends aGENT {
  constructor({ id, name, assetsTUSD=0, phishingTargets}) {
    super({id, name});
    this.assetsTUSD = assetsTUSD;
    this.phishingTargets = phishingTargets;
  }
  onTimeEvent( timeEvt) {
    switch (timeEvt.constructor.name) {
    case "StartOfDay":
      //TODO: use target information for creating specific lure messages
      const msg = this.createLureMessage();
      this.send({ type:"LureMessage", sender: msg.sender, subject: msg.subject,
            body: msg.body, hookPage: msg.hookPage}, this.phishingTargets);
      break;
    }
    // return [resultingStateChanges, resultingFutureEvents];
  }
  onPerceive( perceptionEvt, roundBased) {
    switch (perceptionEvt.constructor.name) {
    case "PerceiveExploitableData":
      this.perform( new ExploitScammedData({ scammedData: perceptionEvt.data,
          victim: perceptionEvt.victim}));
      break;
    }
    // return [resultingStateChanges, resultingFutureEvents];
  }
  createLureMessage( target) {
    //TODO: use target information for creating specific cues
    const msg = {hookPage:{}},
          hookPage = new Webpage({ phisher: this, impersonatedAgent:"Postbank",
          body:`<h1>Postbank Login</h1>
<form><div><label>User name: <input name="userName"/></label></div>
<div><label>Password: <input name="password"/></label></div>
</form>`});
    msg.impersonatedAgent = "Postbank";
    msg.sender = "customerservice@postbank.de";
    msg.subject = "Important customer information";
    msg.body = `<p>Dear customer,</p>
    <p>Due to a system failure we had to restore our customer database and therefore
     ask all our customers to confirm their account information.</p>
<div><a href="https://posttbank.de/account-login">Please confirm your account information</a></div>`;
    msg.hookPage = hookPage;
    return msg;
  }
}
Phisher.labels = {className:"Phisher", assetsTUSD:"TUSD"};
