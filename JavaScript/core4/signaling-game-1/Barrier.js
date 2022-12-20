class Barrier extends oBJECT {
  constructor({ id, name, length}) {
    super( id, name);
    this.length = length;
  }
}
Barrier.labels = {"length":"len"};
