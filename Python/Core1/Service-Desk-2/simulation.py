import sys, os

# Get the absolute path to the parent directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Get the path to the Core0/lib directory
oespy_dir = os.path.join(current_dir, '..', '..', 'Core1', 'framework')

# Add the lib directory to sys.path
sys.path.insert(0, oespy_dir)

from simulator import Simulator, Model

# create simulator (object)
sim = Simulator()
#*******************************************************
# Simulation Model                                     *
# ******************************************************
timeModel = "continuous"
timeUnit = "min"
objectTypes = ["ServiceDesk", "Customer"]
eventTypes = ["CustomerArrival", "CustomerDeparture"]
sim.model = Model( timeModel, timeUnit, objectTypes, eventTypes)
#*******************************************************
# Dynamic Imports                                      *
# ******************************************************
from ServiceDesk import ServiceDesk
from CustomerArrival import CustomerArrival

#*******************************************************
# Simulation Scenario/Configuration Settings                         *
#*******************************************************
sim.scenario.durationInSimTime = 1000
sim.scenario.idCounter = 11 # start value of auto IDs

sim.config.createLog = True
#*******************************************************
# Initial State                                        *
#*******************************************************

def setupInitialState():
    # sD = ServiceDesk(id=1, queueLength=0)
    sD = ServiceDesk(sim,id=1, queueLength=0)
    sim.FEL.add(  CustomerArrival(sim,occTime=1, serviceDesk=sD))
#*******************************************************
# Statistics Variables                                 *
#*******************************************************
def setupStatistics():
    sim.stat = {"arrivedCustomers": 0, "departedCustomers": 0, "cumulativeTimeInSystem": 0.0,"meanTimeInSystem":0.0,"maxQueueLength":0}
    
def computeFinalStatistics():
    sim.stat["meanTimeInSystem"] = (sim.stat["cumulativeTimeInSystem"] /(sim.stat["departedCustomers"]))
#************************************************************
# Overwriting the (Abstract) Methods of Scenario and Model  *
#************************************************************
sim.scenario.setupInitialState = setupInitialState
sim.model.setupStatistics = setupStatistics
sim.model.computeFinalStatistics = computeFinalStatistics
#********************************************************
# Running the Standalone Scenario                       *
#********************************************************
sim.runStandaloneScenario()

