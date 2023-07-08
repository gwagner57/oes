import sys, os

# Get the absolute path to the parent directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Get the path to the Core1/framework directory
framework_dir = os.path.join(current_dir, '..', '..', 'Core1', 'framework')

# Add the lib directory to sys.path
sys.path.insert(0, framework_dir)

from simulator import Simulator, Model

# create simulator (object)
sim = Simulator()
#*******************************************************
# Simulation Model                                     *
# ******************************************************
timeModel = "discrete"
timeUnit = "days"
objectTypes = ["SingleProductShop"]
eventTypes = ["DailyDemand", "Delivery"]
sim.model = Model( timeModel, timeUnit, objectTypes, eventTypes)
#*******************************************************
# Dynamic Imports                                      *
# ******************************************************
from Delivery import Delivery
from DailyDemand import DailyDemand
from SingleProductShop import SingleProductShop

#*******************************************************
# Simulation Scenario/Configuration Settings                         *
#*******************************************************
sim.scenario.durationInSimTime = 1000
sim.config.createLog = True
#*******************************************************
# Initial State                                        *
#*******************************************************
def setupInitialState():
    tvShop = SingleProductShop( sim, 1,"TV Shop", 80, 50, 100)
    sim.FEL.add( DailyDemand( sim, 25, tvShop, occTime=1))
#*******************************************************
# Statistics Variables                                 *
#*******************************************************
def setupStatistics():
    sim.stat = {"nmrOfStockOuts": 0, "lostSales": 0, "serviceLevel": 0.0}
def computeFinalStatistics():
    sim.stat['serviceLevel'] = (sim.time - sim.stat['nmrOfStockOuts']) / sim.time * 100
#************************************************************
# Overwriting the (Abstract) Methods of Scenario and Model  *
#************************************************************
sim.scenario.setupInitialState = setupInitialState
sim.model.setupStatistics = setupStatistics
sim.model.computeFinalStatistics = computeFinalStatistics
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