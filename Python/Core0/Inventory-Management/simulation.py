import sys, os, importlib

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
import oes_foundations
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
objectTypeModules = []
eventTypeModules = []

for file in sim.model.objectTypes:
    objectTypeModules.append(importlib.import_module(file))
    
for file in sim.model.eventTypes:
    eventTypeModules.append(importlib.import_module(file))
#*******************************************************
# Simulation Scenario Settings                         *
#*******************************************************
sim.scenario.durationInSimTime = 1000
#*******************************************************
# Initial State                                        *
#*******************************************************
def setupInitialState():
    tvShop = objectTypeModules[0].SingleProductShop(1,"TV Shop", 80, 50, 100)
    sim.FEL.add(eventTypeModules[0].DailyDemand(1,25,tvShop))
#*******************************************************
# Statistics Variables                                 *
#*******************************************************
def setupStatistics():
    sim.stat = {"nmrOfStockOuts" : 0, "lostSales" : 0, "serviceLevel" : 0.0}

def computeFinalStatistics():
    sim.stat['serviceLevel'] = (sim.time - sim.stat['nmrOfStockOuts']) / sim.time * 100
    print(sim.stat)
#************************************************************
# Overwriting the (Abstract) Methods of Scenario and Model  *
#************************************************************
sim.scenario.setupInitialState = setupInitialState
sim.scenario.setupStatistics = setupStatistics
sim.scenario.computeFinalStatistics = computeFinalStatistics
#********************************************************
# Running the Standalone Scenario                       *
#********************************************************
sim.runStandaloneScenario()
