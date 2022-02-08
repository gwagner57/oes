class Service extends aCTIVITY {
  constructor({id, startTime, duration}={}) {
    super({id, startTime, duration});
  }
static duration() {return rand.uniform( 1, 4)}
}
// A service requires a service desk.
Service.resourceRoles = {
  "serviceDesk": {range: ServiceDesk, card:1}
}
Service.PERFORMER = "serviceDesk";