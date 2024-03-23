from queue import PriorityQueue
from random import expovariate,uniform
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
    def addEvent( self, currEvt):
        self.events.put( (currEvt.occTime, currEvt.priority, currEvt) )
    def getNextEvent( self):
        currEvt = self.events.get()
        return currEvt[2]
    def isEmpty( self):
        return self.events.empty()
    

#------------------------------------------------------- 
# ----- Simulation model: object and event classes -----
#------------------------------------------------------- 
class Customer( Object):
    def __init__(self, arrivalTime):
        self.arrivalTime = arrivalTime    

class ServiceDesk( Object):
    def __init__(self, queueLength):
        self.queueLength = queueLength
        self.waitingCustomers = []
    @staticmethod
    def queueDuration():
        return uniform(0.5, 5)        
    
class CustomerArrival( Event):
    def __init__(self, serviceDesk, occTime=None, delay=None):
        super().__init__( occTime, delay)
        self.serviceDesk = serviceDesk
        self.customer = None;  # is assigned on occurrence
    def onEvent( self):
        followupEvents = []
        # create new customer object
        self.customer = Customer( arrivalTime=self.occTime)        
        # push new customer to the queue
        self.serviceDesk.waitingCustomers.append( self.customer)
        # update statistics
        # sim.stat["arrivedCustomers"]=sim.stat["arrivedCustomers"]+1
        if (len(self.serviceDesk.waitingCustomers) >= 1) :
            delay = expovariate( rate_queueTime )
            followupEvents.append( CustomerDeparture( serviceDesk=self.serviceDesk, occTime=self.occTime+delay))
        
        return followupEvents

    @staticmethod
    def recurrence(): return uniform(1, 6)
    
    def nextOccurrence(self):
        delay = expovariate( rate_nextOccurrence)
        # delay = CustomerArrival.recurrence()
        return CustomerArrival( serviceDesk=self.serviceDesk, occTime = self.occTime+delay)    

class CustomerDeparture( Event):
    def __init__(self, serviceDesk, occTime=None, delay=None):
        super().__init__( occTime, delay)
        self.serviceDesk = serviceDesk
   
    seriveTimeInSystem=0
    def onEvent( self):
        followupEvents = []
        #remove/pop customer from FIFO queue (FIFO pop = JS shift)
        if len(self.serviceDesk.waitingCustomers) > 0:
            departingCustomer = self.serviceDesk.waitingCustomers.pop(0)

            self.serviceDesk.queueLength = len(self.serviceDesk.waitingCustomers)
            # add the time the customer has spent in the system
            CustomerDeparture.seriveTimeInSystem=abs(self.occTime-departingCustomer.arrivalTime)
      
            # if there are still customers waiting
            if (len(self.serviceDesk.waitingCustomers) > 0) :
                delay = expovariate( rate_queueTime )           
                # start next queue and schedule its end/departure
                followupEvents.append( CustomerDeparture( serviceDesk=self.serviceDesk, occTime=self.occTime+delay))
     
        return followupEvents

    
#-------------------------------------
#----- Simulation initialization -----
#-------------------------------------
# initialize simulation
evtList = EventList()
duration = 100000 # Total simulation time
# assign model parameters
rate_nextOccurrence = 0.5
rate_queueTime = 0.6
# set up the initial state
sD = ServiceDesk(queueLength=0)
evtList.addEvent( CustomerArrival( occTime=1, serviceDesk=sD))
# initialize simulation statistics
queue = []
#-------------------------------------
#----- Simulation loop ---------------
#-------------------------------------
simTime = 0
while (simTime <= duration):
    #--- retrieve the next event -----
    currEvt = evtList.getNextEvent()
    #--- advance simulation time by setting it to the occurrence time of the current event -----
    simTime = currEvt.occTime
    #--- if the event is recurrent, schedule the next one -----
    if has_method( currEvt, "nextOccurrence"):
        evtList.addEvent( currEvt.nextOccurrence())	
    #--- get follow-up events (and perform state changes) by executing current event rule -----
    followUpEvents = currEvt.onEvent()
    #--- schedule follow-up events -----
    for e in followUpEvents: evtList.addEvent(e)	
    #--- Collect statistics data -----
    if isinstance( currEvt, CustomerDeparture):
        sD.queueLength = len(sD.waitingCustomers)
        queue.append(sD.queueLength)

#----- Print output statistics -----

print("Average Queue length = ", round( mean( queue), 2))
