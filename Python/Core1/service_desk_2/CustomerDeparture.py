import sys, os
module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
from oes_foundation import eVENT
from ServiceDesk import ServiceDesk
class CustomerDeparture(eVENT):
    def __init__(self, sim, serviceDesk, occTime=None, delay=None):
        super().__init__( sim, occTime, delay)
        self.serviceDesk = serviceDesk
   
    seriveTimeInSystem=0
    def onEvent( self, sim):
        followupEvents = []
        #remove/pop customer from FIFO queue (FIFO pop = JS shift)
   
        departingCustomer = self.serviceDesk.waitingCustomers.pop(0)
  
        # add the time the customer has spent in the system
 
        sim.stat['cumulativeTimeInSystem'] = sim.stat['cumulativeTimeInSystem']+ self.occTime - departingCustomer.arrivalTime
        CustomerDeparture.seriveTimeInSystem=abs(self.occTime-departingCustomer.arrivalTime)
      
        # remove customer from map of simulation objects
        del sim.objects[departingCustomer.id]

      



        #update statistics
        sim.stat["departedCustomers"]+=1
        # if there are still customers waiting
        if (len(self.serviceDesk.waitingCustomers) > 0) :
           
        # start next service and schedule its end/departure
            followupEvents.append( CustomerDeparture(sim, delay=ServiceDesk.serviceDuration(),serviceDesk= self.serviceDesk))

    

     
        return followupEvents


   
    