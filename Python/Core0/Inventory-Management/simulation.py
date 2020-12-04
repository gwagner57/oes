import sys, os, importlib

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from simulator import Simulator, Model

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import math_lib
#*******************************************************
# Simulation Model                                     *
# ******************************************************
sim = Simulator()
sim.model = Model ("discrete", "days", ["SingleProductShop"], ["DailyDemand", "Delivery"])
#*******************************************************
# Dynamic Imports                                      *
# ******************************************************
from Delivery import Delivery
from DailyDemand import DailyDemand
from SingleProductShop import SingleProductShop

#*******************************************************
# Simulation Scenario Settings                         *
#*******************************************************
sim.scenario.durationInSimTime = 1000
#*******************************************************
# Initial State                                        *
#*******************************************************
def setupInitialState(self):
    tvShop = SingleProductShop(sim, 1,"TV Shop", 80, 50, 100)
    sim.objects["tvShop"] = tvShop
    sim.FEL.add(DailyDemand(sim, 1,25,tvShop))
#*******************************************************
# Statistics Variables                                 *
#*******************************************************
def setupStatistics(self):
    sim.stat = {"nmrOfStockOuts" : 0, "lostSales" : 0, "serviceLevel" : 0.0}
    return sim.stat

def computeFinalStatistics(self):
    sim.stat['serviceLevel'] = (sim.time - sim.stat['nmrOfStockOuts']) / sim.time * 100
    return sim.stat
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
