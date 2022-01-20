/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Signalling-Game-1";
sim.model.time = "discrete"; // implies using only discrete random variables

sim.model.objectTypes = ["Barrier", "Speaker", "Jumper"];
sim.model.eventTypes = ["StartOver", "PerceiveBarrier", "SendJumpLengthSignal", "Jump"];
// a class for the (training-data-based) learning function
sim.model.otherCodeFiles = ["LearningMatrix"];
// the learning sensitivity coefficient for increasing/decreasing the learning matrix probabilities
sim.model.p.alpha = 0.5;
/*******************************************************
 Default Scenario
 ********************************************************/
//sim.scenario.durationInSimTime = 200;
sim.scenario.description = "Default scenario";
sim.scenario.setupInitialState = function(){
  const jumper = new Jumper({id: 1, name:"jumper", position: 0}),
        speaker = new Speaker({id: 2, name:"speaker", jumper}),
        barrier = new Barrier({id: 3, name:"barrier", shortLabel:"bar", length: 0});
  Jump.speaker = speaker;  // needed for rewarding the speaker
  Jump.barrier = barrier;  // needed for expressing the Jump success condition
  // Schedule initial events
  sim.schedule( new StartOver({occTime: 1, barrier:barrier, jumper:jumper, speaker:speaker}));
  StartOver.maxNmrOfEvents = 100;  // for ending the simulation run
};

/*******************************************************
 Define Output Statistics Variables
 ********************************************************/
sim.model.setupStatistics = function () {
  sim.stat.nmrOfJumps = 0;
  sim.stat.jumpSuccessAfterFirst25Attempts = 0;
  sim.stat.jumpFailureAfterFirst25Attempts = 0;
};
sim.model.computeFinalStatistics = function () {
  // percentage of business days without stock-outs
  sim.stat.successPercentageAfterFirst25Attempts = sim.stat.nmrOfJumps===0 ? 0 :
      Math.floor((sim.stat.jumpSuccessAfterFirst25Attempts/(sim.stat.nmrOfJumps-25))*100);
};
