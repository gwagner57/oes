class OperatorType extends oBJECT {
  constructor({ id, name, available, canDriveForkliftTypes}) {
    super( id, name);
    this.available = available;
    this.canDriveForkliftTypes = canDriveForkliftTypes;
  }
}
OperatorType.editableAttributes = ["available","canDriveForkliftTypes"];
