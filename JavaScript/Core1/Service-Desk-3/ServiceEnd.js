class ServiceEnd extends eVENT {
  constructor({ occTime, delay, serviceStation}) {
    super({occTime, delay});
    this.serviceStation = serviceStation;
  }
  onEvent() {
    var followupEvents=[], ws = this.serviceStation;
    // decrease buffer length (remove part from buffer)
    ws.queueLength--;
    // update statistics
    sim.stat.departed++;
    // if there are still parts waiting
    if (ws.queueLength > 0) {
      // schedule the next processing start event
      followupEvents.push( new ServiceStart({ serviceStation: ws}));
    } else {  // buffer empty
      ws.status = "AVAILABLE";
    }
    return followupEvents;
  }
}
