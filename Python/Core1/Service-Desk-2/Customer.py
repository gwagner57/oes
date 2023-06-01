import sys, os,util,ServiceDesk,CustomerDeparture

module_path = os.path.abspath('framework/')
sys.path.insert(1, module_path)
from oes_foundation import oBJECT
class Customer(oBJECT):
    def __init__(self, sim, arrivalTime):
        super().__init__( sim)
        self.arrivalTime = arrivalTime
        
    
    def __str__(self):
        return self.__class__.__name__ + " @ " + "{:.2f}".format(self.arrivalTime)