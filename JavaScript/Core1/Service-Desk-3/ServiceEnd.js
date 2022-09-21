class ServiceEnd extends eVENT {
  constructor({ occTime, delay, serviceDesk}) {
    super({occTime, delay});
    this.serviceDesk = serviceDesk;
  }
  onEvent() {
    var followupEvents=[], ws = this.serviceDesk;
    // decrease buffer length (remove part from buffer)
    ws.queueLength--;
    // update statistics
    sim.stat.departed++;
    // if there are still parts waiting
    if (ws.queueLength > 0) {
      // schedule the next processing start event
      followupEvents.push( new ServiceStart({ serviceDesk: ws}));
    } else {  // buffer empty
      ws.status = "AVAILABLE";
    }
    return followupEvents;
  }
}
