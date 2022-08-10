import sys, os
from simulatorUI import logSimulationStep
from oes_foundation import defaults

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
from EventList import EventList

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
    
    def initializeScenarioRun(self):
        self.objects.clear()
        self.step = 0
        self.time = 0
        self.endTime = self.scenario.durationInSimTime or float('inf')  # infinity
        self._idCounter = self.scenario.idCounter or 1000
             
        self.scenario.setupInitialState()
        
        if has_method( self.model, "setupStatistics"): self.model.setupStatistics()
    
    def advanceSimulationTime(self):
        nextEvtTime = self.FEL.getNextOccurrenceTime()  # 0 if there is no next event
        self.step += 1
        if nextEvtTime > 0: self.time = nextEvtTime
    
    def runScenario(self):
        while self.time < self.endTime and not self.FEL.isEmpty():
            if self.config.createLog: logSimulationStep(self)
            self.advanceSimulationTime()
            nextEvents = self.FEL.removeNextEvents()
            for e in nextEvents:
                followUpEvents = e.onEvent( self)
                for f in followUpEvents: self.FEL.add(f)
                # check if e is a recurrent/exogenous event
                if has_method( e, "recurrence"):
                    if has_method( e, "createNextEvent"): self.FEL.add( e.createNextEvent( self))
                    else: self.FEL.add( type(e)(delay=e.recurrence()))
        
        if has_method( self.model, "computeFinalStatistics"):
            self.model.computeFinalStatistics()
            for k,v in self.stat.items():
                if type(v) == float: self.stat[k] = round( v, defaults['expostStatDecimalPlaces'])
            print ("\n-------------------- Final Statistics --------------------------")
            print ("Stat:", self.stat)
            
    def runStandaloneScenario(self):
        self.initializeSimulator()
        self.initializeScenarioRun()
        self.runScenario()
    
class Model:
    def __init__(self, time, timeUnit, objectTypes, eventTypes, nextMomentDeltaT=None):
        self.time = time
        self.timeUnit = timeUnit
        self.objectTypes = objectTypes
        self.eventTypes = eventTypes
        self.nextMomentDeltaT = nextMomentDeltaT

class Scenario:
    def __init__(self):
        self.durationInSimTime = 0
        self.idCounter = None
    
    def setupInitialState(self):
        return False

class Configuration:
    def __init__(self, createLog):
        self.createLog = createLog
