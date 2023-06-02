import sys, os,util

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)       
from oes_foundation import oBJECT

class ServiceDesk(oBJECT):
    def __init__(self, sim, id, queueLength):
        super().__init__(sim, id)
        self.queueLength = queueLength
        self.waitingCustomers = []

    @staticmethod
    def serviceDuration():
        return util.getUniformRandomNumber(0.5, 5)

    def __str__(self):
        return self.__class__.__name__ + " @ " + "{:.2f}".format(len(self.waitingCustomers))

ServiceDesk.labels = {"waitingCustomers": "queue"}       
