class Phisher extends aGENT {
  constructor({ id, name, phishingTargets}) {
    super({id, name});
    this.phishingTargets = phishingTargets;
  }
  onTimeEvent( timeEvt) {
    switch (timeEvt.constructor.name) {
      case "StartOfWeek":
        // send({ type:"LureMessage", sender:..., subject:"...", body:...}, target);
        break;
    }
    // return [resultingStateChanges, resultingFutureEvents];
  }
  onPerceive( perceptionEvt, roundBased) {
    switch (perceptionEvt.constructor.name) {
      case "PerceiveExploitableData":
        // perform( new ExploitScammedData(...));
        break;
    }
    // return [resultingStateChanges, resultingFutureEvents];
  }
}
Phisher.labels = {className:"Phisher"};
