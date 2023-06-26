import sys, os

module_path = os.path.abspath('framework/')
sys.path.insert(1, module_path)
from oes_foundation import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import util,Customer,CustomerDeparture,ServiceDesk
from ServiceDesk import ServiceDesk
class CustomerArrival(eVENT):
    def __init__(self, sim, serviceDesk, occTime=None, delay=None):
        super().__init__( sim, occTime, delay)
        self.serviceDesk = serviceDesk
        self.customer = None;  # is assigned on occurrence

    def onEvent( self, sim):
        followupEvents = []
        # create new customer object
        self.customer = Customer.Customer(sim,arrivalTime=self.occTime)
        
        # push new customer to the queue
        self.serviceDesk.waitingCustomers.append( self.customer)

        # update statistics
        sim.stat["arrivedCustomers"]=sim.stat["arrivedCustomers"]+1

        if (len(self.serviceDesk.waitingCustomers) > sim.stat["maxQueueLength"]):
            sim.stat["maxQueueLength"] = len(self.serviceDesk.waitingCustomers)
        
        if (len(self.serviceDesk.waitingCustomers) >= 1) :
            followupEvents.append( CustomerDeparture.CustomerDeparture(sim,delay = ServiceDesk.serviceDuration(),serviceDesk= self.serviceDesk))
        
        return followupEvents

    @staticmethod
    def recurrence(): return util.getUniformRandomNumber(1, 6)
    
    def createNextEvent(self, sim):
        delay = CustomerArrival.recurrence()
        serviceDesk=self.serviceDesk
        return CustomerArrival( sim, serviceDesk, delay)
     




       


