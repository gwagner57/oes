class ForkliftType extends oBJECT {
  constructor({ id, name, available, canTakeProductTypes}) {
    super( id, name);
    this.available = available;
    this.canTakeProductTypes = canTakeProductTypes;
  }
}
ForkliftType.editableAttributes = ["available","canTakeProductTypes"];
