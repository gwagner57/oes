class ServiceStart extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[], ws = this.serviceDesk;
    ws.status = "BUSY";
    // schedule the processing end event
    followupEvents.push( new ServiceEnd({
      delay: ServiceDesk.serviceTime(),
      serviceDesk: ws
    }));
    return followupEvents;
  }
}
