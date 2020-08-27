class PerformService extends aCTIVITY {
  constructor({id, startTime, duration, resourceRoles, serviceDesk}) {
    super({id, startTime, duration, resourceRoles});
    this.serviceDesk = serviceDesk;
  }
  onActivityEnd() {
    var followupEvents = [];
    // remove customer from queue
    this.serviceDesk.queueLength--;
    // update statistics
    sim.stat.departedCustomers++;
    // if there are still customers waiting
    if (this.serviceDesk.queueLength > 0) {
      // start next service
      followupEvents.push( new aCTIVITYsTART({
        activityType: PerformService,
        /* a property "serviceDesk" is created  automatically from the corresponding
         resource role defined in the resources map of the ActivityStart event  */
        resourceRoles: {"serviceDesk": this.serviceDesk}
      }));
    }
    return followupEvents;
  }
}
PerformService.duration = function () {
  return rand.frequency({"1":0.1, "2":0.2, "3":0.3, "4":0.25, "5":0.1, "6":0.05});
};
