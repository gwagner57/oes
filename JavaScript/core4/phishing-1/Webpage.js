class Webpage extends oBJECT {
  constructor({ id, name, body, phisher, impersonatedAgent}) {
    super( id, name);
    this.body = body;
    if (phisher) this.phisher = phisher;
    if (impersonatedAgent) this.impersonatedAgent = impersonatedAgent;
  }
}
