import sys, os

module_path = os.path.abspath('../framework/')
sys.path.insert(1, module_path)
from simulator import Simulator, Model

from workstation import WorkStation
from part_arrival import PartArrival

# create simulator (object)
sim = Simulator()
#*******************************************************
#*** Simulation Model  *********************************
#*******************************************************
timeModel = "continuous"
timeUnit = "min"
objectTypes = ["WorkStation"]
eventTypes = ["PartArrival", "ProcessingStart", "ProcessingEnd"]
sim.model = Model( timeModel, timeUnit, objectTypes, eventTypes)
#*******************************************************
#*** Simulation Scenario/Configuration Settings ********
#*******************************************************
sim.scenario.durationInSimTime = 20*60  # 20 hours
sim.config.createLog = True
#*******************************************************
#*** Initial State *************************************
#*******************************************************
def setupInitialState():
    ws = WorkStation( sim, 1, "ws1")
    sim.FEL.add( PartArrival( sim, ws, occTime=1))
#*******************************************************
#*** Statistics Variables ******************************
#*******************************************************
def setupStatistics():
    sim.stat = {"arrivedParts": 0, "departedParts": 0, "maxQueueLength": 0}
#************************************************************
#*** Overwriting the (Abstract) Methods of Scenario and Model
#************************************************************
sim.scenario.setupInitialState = setupInitialState
sim.model.setupStatistics = setupStatistics
#********************************************************
# Running the Standalone Scenario                       *
#********************************************************
# sim.runStandaloneScenario()
experiment_type = {
    "id": 0,
    "title": f"Simple Experiment with 10 replications, each running for {sim.scenario.durationInSimTime} {sim.model.timeUnit}.",
    "nmrOfReplications": 10,
    "seeds": [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012],
    "storeExpResults": True 
}

sim.experiment_type = experiment_type  # Set the experiment_type attribute in the Simulator instance
sim.runSimpleExperiment() 