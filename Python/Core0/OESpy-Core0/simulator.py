import sys, os

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
        
        print("-------------------- Initialize Scenario Run --------------------\n", 
              "Step =", self.step, ", Time =", self.time, ", End Time =", 
              self.endTime, ", ID Counter =", self.idCounter)
        
        if (self.scenario.setupInitialState(self) != False):
            self.scenario.setupInitialState(self)
            print ("\n-------------------- Setup Initial State --------------------\n")
            
        if (self.model.setupStatistics(self) != False):
            stat = self.model.setupStatistics(self)
            print ("-------------------- Setup Statistics --------------------\n",
           "Stat = ", stat)
    
    def advanceSimulationTime(self):
        self.nextEvtTime = self.FEL.getNextOccurrenceTime()
        self.step += 1
        print("\n-------------------- Advance Simulation Time --------------------\n",
              "Next Event Time = ", self.nextEvtTime, ", Step = ", self.step)
        if(self.nextEvtTime > 0):
            self.time = self.nextEvtTime
            print(" Time = ", self.time)
    
    def runScenario(self):
        iteration = 0
        while (self.time < self.endTime and not self.FEL.isEmpty()):
            iteration += 1
            print("\n-------------------- Run Scenario Iteration " + str(iteration) + "--------------------") 
            self.advanceSimulationTime()
            nextEvents = self.FEL.removeNextEvents()
            print (" nextEvents = ", nextEvents)
            for e in nextEvents:
                followUpEvents = e.onEvent(self)
                print(" Follow Up Events = ", followUpEvents)
                for f in followUpEvents:
                    self.FEL.add(f)
            # more code to test if e is an exogenous event
        
        if (self.model.computeFinalStatistics(self) != False):
            stat = self.model.computeFinalStatistics(self)
            print ("\n-------------------- Compute Final Statistics --------------------\n",
                   "Stat = ", stat)
            
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
