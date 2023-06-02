from queue import PriorityQueue
from random import expovariate
from statistics import mean
#----------------------------------- 
#----- Helper methods --------------
#----------------------------------- 
def has_method( obj, name):
    return callable(getattr(obj, name, None))
#----------------------------------- 
# ----- OES foundation classes -----
#----------------------------------- 
class Object:
    def __init__( self, name = None):
        self.name = name        

class Event:
    def __init__( self, occTime, priority):
        self.occTime = occTime
        self.priority = priority        
    def onEvent( self):
        pass                    
    def __str__( self):
        return self.__class__.__name__ + " @ " + str( self.occTime)

class EventList:
    def __init__( self):
        self.events = PriorityQueue()
    
    def addEvent( self, ev):
        self.events.put( (ev.occTime, ev.priority, ev) )
        
    def getNextEvent( self):
        ev = self.events.get()
        return ev[2]
    
    def isEmpty( self):
        return self.events.empty()
#------------------------------------------------------- 
# ----- Simulation model: object and event classes -----
#------------------------------------------------------- 
class WorkStation( Object):
    def __init__( self, name, inputBufferLength=0, status="AVAILABLE"):
        super().__init__(name)
        self.inputBufferLength = inputBufferLength
        self.status = status      
        
class Arrival( Event):
    def __init__( self, occTime, workStation):
        super().__init__(occTime, 1)
        self.ws = workStation    
    def onEvent( self):
        followupEvents = []
        ws = self.ws
        ws.inputBufferLength += 1
        if ws.status == "AVAILABLE":
            followupEvents.append( ProcessingStart( self.occTime, ws))
        return followupEvents
    def nextOccurrence( self):
        delay = expovariate( rate_nextOccurrence)
        return Arrival( self.occTime + delay, self.ws)
    
class ProcessingStart( Event):
    def __init__( self, occTime, workStation):
        super().__init__(occTime, 2)
        self.ws = workStation
            
    def onEvent( self):
        followupEvents = []
        ws = self.ws
        ws.inputBufferLength -= 1
        ws.status= "BUSY"
        delay = expovariate( rate_serviceTime )
        followupEvents.append( ProcessingEnd( self.occTime + delay, ws))
        return followupEvents

class ProcessingEnd( Event):
    def __init__( self, occTime, workStation):
        super().__init__(occTime, 3)
        self.ws = workStation
        
    def onEvent( self):
        followupEvents = []
        ws = self.ws
        ws.status = "AVAILABLE"
        if ws.inputBufferLength > 0:
            followupEvents.append( ProcessingStart( self.occTime, ws) )
        return followupEvents
#-------------------------------------
#----- Simulation initialization -----
#-------------------------------------
# initialize simulation
evList = EventList()
simTime = 100000 # Total simulation time
# assign model parameters
rate_nextOccurrence = 0.5
rate_serviceTime = 0.6
# set up the initial state
ws = WorkStation("ws")
evList.addEvent( Arrival( 0.0, ws))
# initialize simulation statistics
queueLength = []
#-------------------------------------
#----- Simulation loop ---------------
#-------------------------------------
clock = 0
while (clock <= simTime):
    ev = evList.getNextEvent()
    clock = ev.occTime
    #--- if the event is recurrent, schedule the next one -----
    if has_method( ev, "nextOccurrence"):
        evList.addEvent( ev.nextOccurrence)	
    followUpEvents = ev.onEvent()
    for ev in followUpEvents: evList.addEvent(ev)	
    #--- Collect statistics data -----
    if isinstance( ev, Arrival):
        queueLength.append( ws.inputBufferLength - 1)

#----- Print output statistics -----
print("Average Queue Length = ", round( mean( queueLength), 2))
    