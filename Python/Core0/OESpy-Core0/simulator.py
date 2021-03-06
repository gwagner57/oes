import sys, os, simulatorUI

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
from EventList import EventList

class Simulator:
    def __init__(self):
        self.step = 0
        self.time = 0
        self.endTime = 0
        self.idCounter = 1000
        self.nextMomentDeltaT = 1
        self.model = None
        self.scenario = Scenario()
        self.FEL = EventList()
        self.objects = dict()
        self.stat = None
        self.nextEvtTime = 0
        pass
    
    def initializeSimulator(self):
        if (self.model.time == "discrete"):
            self.nextMomentDeltaT = 1
        else:
            self.nextMomentDeltaT = 2
    
    def initializeScenarioRun(self):
        self.objects.clear()
        self.step = 0
        self.time = 0
        self.endTime = self.scenario.durationInSimTime or 100000 #must be set it to infinity
        self.idCounter = self.scenario.idCounter or 1000
             
        self.scenario.setupInitialState(self)
        
        if (self.model.setupStatistics(self) != False):
            stat = self.model.setupStatistics(self)
    
    def advanceSimulationTime(self):
        self.nextEvtTime = self.FEL.getNextOccurrenceTime()
        self.step += 1
        if(self.nextEvtTime > 0):
            self.time = self.nextEvtTime
    
    def runScenario(self):
        iteration = 0
        while (self.time < self.endTime and not self.FEL.isEmpty()):
            iteration += 1
            simulatorUI.logSimulationStep(self)
            self.advanceSimulationTime()
            nextEvents = self.FEL.removeNextEvents()
            for e in nextEvents:
                followUpEvents = e.onEvent(self)
                for f in followUpEvents:
                    self.FEL.add(f)

                # check if e is a recurrence
                if (e.recurrence() == 1):
                    self.FEL.add(e.createNextEvent(self))
        
        if (self.model.computeFinalStatistics(self) != False):
            stat = self.model.computeFinalStatistics(self)
            print ("\n-------------------- Compute Final Statistics --------------------------")
            print ("Stat:", stat)
            
    def runStandaloneScenario(self):
        self.initializeSimulator()
        self.initializeScenarioRun()
        self.runScenario()
    
class Model:
    def __init__(self, time, timeUnit, objectTypes, eventTypes):
        self.time = time
        self.timeUnit = timeUnit
        self.objectTypes = objectTypes
        self.eventTypes = eventTypes
    
    def setupStatistics(self):
        return False
    
    def computeFinalStatistics(self):
        return False
    
class Scenario:
    def __init__(self):
        self.durationInSimTime = 0
        self.idCounter = 0
    
    def setupInitialState(self):
        return False
