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
        self.objects = None
        self.stat = None
        self.nextEvtTime = 0
        pass
    
    def initializeSimulator(self):
        pass
    
    def initializeScenarioRun(self):
        pass
    
    def advanceSimulationTime(self):
        pass
    
    def runScenario(self):
        pass
    
class Model:
    def __init__(self, time, timeUnit, objectTypes, eventTypes):
        self.time = time
        self.timeUnit = timeUnit
        self.objectTypes = objectTypes
        self.eventTypes = eventTypes
        pass
    
    def setupStatistics(self):
        pass
    
    def computeFinalStatistics(self):
        pass
    
class Scenario:
    def __init__(self):
        self.durationInSimTime = 0
        self.idCounter = 0
        pass
    
    def setupInitialState(self):
        pass


sim = Simulator()