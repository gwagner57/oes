/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Signalling-Game-1";
sim.model.time = "discrete"; // implies using only discrete random variables

sim.model.objectTypes = ["Jumper", "Speaker", "Barrier"];
sim.model.eventTypes = ["StartOver", "Jump"];

sim.model.v.alpha = {
  range:"Decimal", initialValue: 0.5,
  label:"Learning sensitivity",
  hint:"This coefficient is used for increasing/decreasing the learning matrix probabilities"
};
/*******************************************************
 Default Scenario
 ********************************************************/
sim.scenario.durationInSimTime = 200;
sim.scenario.description = "Default scenario";
sim.scenario.setupInitialState = function(){
  const jumper = new Jumper({id: 1, name:"jumper", position: 0}),
        speaker = new Speaker({id: 2, name:"speaker", jumper}),
        barrier = new Barrier({id: 3, name:"barrier", shortLabel:"bar", length: 0});
  Jump.speaker = speaker;  // needed for rewarding the speaker
  Jump.barrier = barrier;  // needed for expressing the Jump success condition
  // Schedule initial events
  sim.FEL.add( new StartOver({occTime: 1, barrier:barrier, jumper:jumper, speaker:speaker}));
};

/*******************************************************
 Define Output Statistics Variables
 ********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.nmrOfJumps = 0;
  sim.stat.jumpSuccess = 0;
  sim.stat.jumpFailure = 0;
};
sim.model.computeFinalStatistics = function () {
  // percentage of business days without stock-outs
  sim.stat.successPercentage = sim.stat.nmrOfJumps===0 ? 0 :
      Math.floor((sim.stat.jumpSuccess/sim.stat.nmrOfJumps)*100);
};
