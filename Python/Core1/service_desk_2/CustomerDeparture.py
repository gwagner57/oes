import sys, os


# Get the absolute path to the parent directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Get the path to the Core0/lib directory
oespy_dir = os.path.join(current_dir, '..', '..', 'Core1', 'framework')

# Add the lib directory to sys.path
sys.path.insert(0, oespy_dir)
from oes_foundation import eVENT
# module_path = os.path.abspath('lib/')
# sys.path.insert(1, module_path)
# from oes_foundation import eVENT
from ServiceDesk import ServiceDesk
class CustomerDeparture(eVENT):
    def __init__(self, sim, serviceDesk, occTime=None, delay=None):
        super().__init__( sim, occTime, delay)
        self.serviceDesk = serviceDesk
   
    seriveTimeInSystem=0
    def onEvent( self, sim):
        followupEvents = []
        if (len(self.serviceDesk.waitingCustomers) > 0) :
        #remove/pop customer from FIFO queue (FIFO pop = JS shift)
            departingCustomer = self.serviceDesk.waitingCustomers.pop(0)
    
            # add the time the customer has spent in the system
            sim.stat['cumulativeTimeInSystem'] = sim.stat['cumulativeTimeInSystem']+ self.occTime - departingCustomer.arrivalTime
            CustomerDeparture.seriveTimeInSystem=abs(self.occTime-departingCustomer.arrivalTime)
        
            # remove customer from map of simulation objects
            if departingCustomer.id in sim.objects:
                del sim.objects[departingCustomer.id]

            #update statistics
            sim.stat["departedCustomers"]+=1
            
            # start next service and schedule its end/departure
            followupEvents.append( CustomerDeparture(sim, delay=ServiceDesk.serviceDuration(),serviceDesk= self.serviceDesk))
   
        return followupEvents


   
    