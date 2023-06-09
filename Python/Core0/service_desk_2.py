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
class Customer(Object):
    def __init__(self, arrivalTime):
        self.arrivalTime = arrivalTime    

class queueDesk(Object):
    def __init__(self, queueLength):
        self.queueLength = queueLength
        self.waitingCustomers = []

    @staticmethod
    def queueDuration():
        return uniform(0.5, 5)        
    
class CustomerArrival(Event):
    def __init__(self, queueDesk, occTime=None, delay=None):
        super().__init__( occTime, delay)
        self.queueDesk = queueDesk
        self.customer = None;  # is assigned on occurrence

    def onEvent( self):
        followupEvents = []
        # create new customer object
        self.customer = Customer(arrivalTime=self.occTime)
        
        # push new customer to the queue
        self.queueDesk.waitingCustomers.append( self.customer)

        # update statistics
        # sim.stat["arrivedCustomers"]=sim.stat["arrivedCustomers"]+1
        
        if (len(self.queueDesk.waitingCustomers) >= 1) :
            delay = expovariate( rate_queueTime )
            followupEvents.append( CustomerDeparture(delay = delay + self.occTime,queueDesk= self.queueDesk,occTime=self.occTime+delay))
        
        return followupEvents

    @staticmethod
    def recurrence(): return uniform(1, 6)
    
    def nextOccurrence(self):
        delay = expovariate( rate_nextOccurrence)
        # delay = CustomerArrival.recurrence()
        queueDesk=self.queueDesk
        return CustomerArrival( queueDesk = queueDesk, delay = delay, occTime = self.occTime+delay)    

class CustomerDeparture(Event):
    def __init__(self, queueDesk, occTime=None, delay=None):
        super().__init__( occTime, delay)
        self.queueDesk = queueDesk
   
    seriveTimeInSystem=0
    def onEvent( self):
        followupEvents = []
        #remove/pop customer from FIFO queue (FIFO pop = JS shift)
        if len(self.queueDesk.waitingCustomers) > 0:
            departingCustomer = self.queueDesk.waitingCustomers.pop(0)

            self.queueDesk.queueLength = len(self.queueDesk.waitingCustomers)
            # add the time the customer has spent in the system
            CustomerDeparture.seriveTimeInSystem=abs(self.occTime-departingCustomer.arrivalTime)
      
            # if there are still customers waiting
            if (len(self.queueDesk.waitingCustomers) > 0) :
                delay = expovariate( rate_queueTime )
           
                # start next queue and schedule its end/departure
                followupEvents.append( CustomerDeparture(delay=delay+self.occTime,queueDesk= self.queueDesk,occTime=self.occTime+delay))
     
        return followupEvents

    
#-------------------------------------
#----- Simulation initialization -----
#-------------------------------------
# initialize simulation
evList = EventList()
simTime = 100000 # Total simulation time
# assign model parameters
rate_nextOccurrence = 0.5
rate_queueTime = 0.6
# set up the initial state
sD = queueDesk(queueLength=0)
evList.addEvent( CustomerArrival( occTime=1, queueDesk=sD))
# initialize simulation statistics
queue = []
#-------------------------------------
#----- Simulation loop ---------------
#-------------------------------------
clock = 0
while (clock <= simTime):
    ev = evList.getNextEvent()
    clock = ev.occTime
    #--- if the event is recurrent, schedule the next one -----
    if has_method( ev, "nextOccurrence"):
        # print("++++++++++"+str(ev.nextOccurrence()))
        evList.addEvent( ev.nextOccurrence())	
    followUpEvents = ev.onEvent()
    for ev in followUpEvents: evList.addEvent(ev)	
    #--- Collect statistics data -----
    if isinstance( ev, CustomerDeparture):
        sD.queueLength = len(sD.waitingCustomers)
        queue.append(sD.queueLength)

#----- Print output statistics -----

print("Average Queue length = ", round( mean( queue), 2))
