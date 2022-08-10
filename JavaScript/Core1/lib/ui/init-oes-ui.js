// Create initial objects/maps/arrays
const sim = Object.create(null); // instead of {}
sim.model = Object.create(null);
sim.model.v = Object.create(null); // model variables
sim.model.p = Object.create(null); // model parameters
sim.ui = Object.create(null); // user interface items
sim.scenario = Object.create(null);
sim.scenarios = [];
sim.stat = Object.create(null);
sim.experimentTypes = [];
// for being able to run setupInitialStateForUi
class oBJECT {
  constructor( id, name) {
    this.id = id || sim.idCounter++;
    // add each new object to the Map of simulation objects by ID
    if (name) {  // name is optional
      this.name = name;
    }
  }
}