class DailyProduction extends eVENT {
  constructor({occTime, delay, company} = {}) {
    super({occTime, delay});
    this.company = company;
  }
  onEvent() {
    const followupEvents=[];
    this.company.performProduction();
    // schedule next event
    followupEvents.push( new DailyDemand({
      delay: 5,  // 5 hours later
      company: this.company
    }));
    return followupEvents;
  }
}
