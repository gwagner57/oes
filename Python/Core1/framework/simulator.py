import random
import sys
import os
import numpy as np



# Get the absolute path to the parent directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Get the path to the Core0/lib directory
lib_dir = os.path.join(current_dir, '..', '..', 'Core1', 'lib')

# Add the lib directory to sys.path
sys.path.insert(0, lib_dir)
from confidence_interval import confint

# Import EventList
from EventList import EventList
from oes_foundation import defaults
from simulatorUI import logSimulationStep

def has_method( o, name):
    return callable( getattr( o, name, None))

class Simulator:
    def __init__(self):
        self.step = 0
        self.time = 0
        self.endTime = 0
        self.nextMomentDeltaT = None
        self.model = None
        self.scenario = Scenario()
        self.config = Configuration( createLog = False)
        self.FEL = EventList()
        self.objects = dict()
        self.stat = None
        self.nextEvtTime = 0
        self._idCounter = 0
    pass

    @property  # define getter for property
    def idCounter(self):
        self._idCounter += 1  # increment on read
        return self._idCounter
    @idCounter.setter
    def idCounter(self, x):
        self._idCounter = x

    def initializeSimulator(self):
        if self.model.time == "discrete": self.nextMomentDeltaT = 1
        else: self.nextMomentDeltaT = self.model.nextMomentDeltaT or defaults["nextMomentDeltaT"]
    
    def initializeScenarioRun(self, seed = None):
        self.objects.clear()
        self.step = 0
        self.time = 0
        self.endTime = self.scenario.durationInSimTime or float('inf')  # infinity
        self._idCounter = self.scenario.idCounter or 1000
        self.scenario.setupInitialState()
        if has_method( self.model, "setupStatistics"): self.model.setupStatistics()

        if seed is not None:
            random.seed(seed)
    
    def advanceSimulationTime(self):
        nextEvtTime = self.FEL.getNextOccurrenceTime()  # 0 if there is no next event
        self.step += 1
        if nextEvtTime > 0: self.time = nextEvtTime
    
    def runScenario(self):
        while (
            self.time < self.endTime
            and not self.FEL.isEmpty()
            and self.step < self.experiment_type.get("nmrOfReplications", float("inf"))
            # and self.step < self.scenario.idCounter
        ):
            if self.config.createLog:
                logSimulationStep(self)
            self.advanceSimulationTime()
            nextEvents = self.FEL.removeNextEvents()
            for e in nextEvents:
                followUpEvents = e.onEvent(self)
            
                for f in followUpEvents:
                    self.FEL.add(f)
                if has_method(e, "recurrence"):
                    if has_method(e, "createNextEvent"):
                        self.FEL.add(e.createNextEvent(self))
                    else:
                        self.FEL.add(type(e)(delay=e.recurrence()))
        
        self.calculateStatistics()  # Call the statistics calculation method



    def calculateStatistics(self):
        if has_method(self.model, "computeFinalStatistics"):
            self.model.computeFinalStatistics()

        for k, v in self.stat.items():
            if type(v) == float:
                self.stat[k] = round(v, defaults['expostStatDecimalPlaces'])

        print("\n-------------------- Final Statistics --------------------------")
        print("Stat:", self.stat)



    def calculateAverageStatistics(self, replicStat):
        average_stat = {}
        std_dev_stat = {}
        min_stat = {}
        max_stat = {}
        ci_stat_lower = {}
        ci_stat_upper = {}

        for varName, values in replicStat.items():
            if varName != "nodes":
                average_stat[varName] = round(np.mean(values), 2)
                std_dev_stat[varName] = round(np.std(values), 2)
                min_stat[varName] = round(np.min(values), 2)
                max_stat[varName] = round(np.max(values), 2)
                ci_stat_lower[varName] = round(confint(values)[0], 2)
                ci_stat_upper[varName] = round(confint(values)[1], 2)

        print("\n-------------------- Average Statistics ------------------------")
        print("Average Stat:", average_stat)
        print("Standard Deviation Stat:", std_dev_stat)
        print("Minimum Stat:", min_stat)
        print("Maximum Stat:", max_stat)
        print("CI lower:", ci_stat_lower)
        print("CI upper:", ci_stat_upper)


    def runStandaloneScenario(self):
        self.initializeSimulator()
        self.initializeScenarioRun()
        self.runScenario()


    def runSimpleExperiment(self):
        if hasattr(self.model, "setupStatistics"):
            self.model.setupStatistics()

        # Define exp variable
        exp = {}
        exp["replicStat"] = {}

        for varName in self.stat.keys():
            exp["replicStat"][varName] = []

        nmrOfReplications = self.experiment_type.get("nmrOfReplications", 10)  # Number of replicas to run
        seeds = self.experiment_type.get("seeds", [None] * nmrOfReplications)  # List of seeds

        for i in range(nmrOfReplications):
            seed = seeds[i]
            self.initializeScenarioRun(seed=seed)

            while self.time <=1000:
            # for step in range(stepsPerReplication):
                # if self.config.createLog:
                    # logSimulationStep(self)
                self.advanceSimulationTime()
                nextEvents = self.FEL.removeNextEvents()
                for e in nextEvents:
                    followUpEvents = e.onEvent(self)
                    for f in followUpEvents:
                        self.FEL.add(f)
                    if has_method(e, "recurrence"):
                        if has_method(e, "createNextEvent"):
                            self.FEL.add(e.createNextEvent(self))
                        else:
                            self.FEL.add(type(e)(delay=e.recurrence()))
            self.runScenario()

            for key in exp["replicStat"].keys():
                if key != "nodes":
                    exp["replicStat"][key].append(self.stat[key])

        self.calculateAverageStatistics(exp["replicStat"])

        exp["summaryStat"] = {}

        for varName in exp["replicStat"].keys():
            exp["summaryStat"][varName] = {}

    
class Model:
    def __init__(self, time, timeUnit, objectTypes, eventTypes, nextMomentDeltaT=None):
        self.time = time
        self.timeUnit = timeUnit
        self.objectTypes = objectTypes
        self.eventTypes = eventTypes
        self.nextMomentDeltaT = nextMomentDeltaT

class Scenario:
    def __init__(self):
        self.durationInSimTime = 1000
        self.idCounter = 1000
    
    def setupInitialState(self):
        return False

class Configuration:
    def __init__(self, createLog):
        self.createLog = createLog





