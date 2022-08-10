import sys, os, importlib

#module_path = os.path.abspath('OESpy-Core0/')
#sys.path.insert(1, module_path)
from simulator import Simulator, Model

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import util

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
sim.runStandaloneScenario()
