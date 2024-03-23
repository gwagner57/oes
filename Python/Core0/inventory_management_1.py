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
    
class SingleProductShop( Object):
    def __init__(self, name, quantityInStock, reorderLevel, targetInventory):
        super().__init__(name)
        self.quantityInStock = quantityInStock
        self.reorderLevel = reorderLevel
        self.targetInventory = targetInventory
          
class DailyDemand( Event):
    def __init__(self, quantity, shop, occTime=None, delay=None):
        super().__init__(occTime, delay)
        self.quantity = quantity
        self.shop = shop

    def onEvent(self):
        followupEvents = []
        q = self.quantity
        prevStockLevel = self.shop.quantityInStock
        # perform state changes
        self.shop.quantityInStock = max( prevStockLevel-q, 0)
        stat={}
        # update statistics
        if q > prevStockLevel:
            stat["nmrOfStockOuts"] = stat["nmrOfStockOuts"] + 1
            stat["lostSales"] = stat["lostSales"] + (q - prevStockLevel)
        # create follow-up events
        if prevStockLevel > self.shop.reorderLevel >= prevStockLevel - q :
            quantity = self.shop.targetInventory - self.shop.quantityInStock
            receiver = self.shop
            followupEvents.append( Delivery( quantity, receiver, self.occTime))
        return followupEvents
    
    def nextOccurrence( self):
        delay = expovariate( rate_nextOccurrence)
        quantity = DailyDemand.quantity()
        return DailyDemand(quantity, self.shop, self.occTime + delay)
    
    @staticmethod
    def quantity(): return uniform(5, 30)

class Delivery(Event):
    def __init__(self, quantity, receiver, occTime=None, delay=None):
        super().__init__( occTime, delay)
        self.quantity = quantity
        self.receiver = receiver

    def onEvent( self):
        followupEvents = []
        # perform state changes
        self.receiver.quantityInStock += self.quantity
        # if stock quantity is still below reorderLevel, order more
        if self.receiver.quantityInStock <= self.receiver.reorderLevel:
            quantity = self.receiver.targetInventory - self.receiver.quantityInStock
            receiver = self.receiver
            delay = expovariate( rate_serviceTime )
            followupEvents.append( Delivery( quantity, receiver, self.occTime + delay))
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
tvShop = SingleProductShop("TV Shop", 80, 50, 100)
evList.addEvent( DailyDemand( 25, tvShop, occTime=1))
# initialize simulation statistics
quantityInStock = []
#-------------------------------------
#----- Simulation loop ---------------
#-------------------------------------
clock = 0
while (clock <= simTime):
    ev = evList.getNextEvent()
    clock = ev.occTime
    #--- if the event is recurrent, schedule the next one -----
    if has_method( ev, "nextOccurrence"):
        evList.addEvent( ev.nextOccurrence())	
    followUpEvents = ev.onEvent()
    for ev in followUpEvents: evList.addEvent(ev)	
    #--- Collect statistics data -----
    if isinstance( ev, DailyDemand):
        quantityInStock.append( tvShop.quantityInStock-1)

#----- Print output statistics -----

print("Average Quantity in stock = ", round( mean( quantityInStock), 2))
