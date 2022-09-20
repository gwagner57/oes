class ServiceStart extends eVENT {
  constructor({ occTime, delay, serviceStation}) {
    super({occTime, delay});
    this.serviceStation = serviceStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.serviceStation;
    ws.status = "BUSY";
    // schedule the processing end event
    followupEvents.push( new ServiceEnd({
      delay: ServiceDesk.serviceTime(),
      serviceStation: ws
    }));
    return followupEvents;
  }
}
