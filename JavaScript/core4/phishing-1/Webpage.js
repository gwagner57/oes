class Webpage extends oBJECT {
  constructor({ id, name, bodyText, phisher}) {
    super( id, name);
    this.bodyText = bodyText;
    if (phisher) this.phisher = phisher;
  }
}
