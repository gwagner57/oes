class ProductType extends oBJECT {
  constructor({ id, name, arrivalRatePerHour}) {
    super( id, name);
    this.arrivalRatePerHour = arrivalRatePerHour;
  }
}
ProductType.editableAttributes = ["arrivalRatePerHour"];
// sim.Classes[className].instances
