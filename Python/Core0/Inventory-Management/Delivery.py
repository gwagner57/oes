import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundations import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import math_lib

class Delivery(eVENT):
    def __init__(self, sim, quantity, receiver, occTime = None, delay = None):
        super().__init__(sim, occTime, delay)
        self.delay = delay
        self.quantity = quantity
        self.receiver = receiver
        
    def onEvent(self, sim):
        self.receiver.quantityInStock = self.receiver.quantityInStock + self.quantity
        if (self.receiver.quantityInStock <= self.receiver.reorderLevel):
            delay = Delivery.leadTime()
            quantity = self.receiver.targetInventory - self.receiver.quantityInStock
            receiver = self.receiver
            return Delivery(delay= delay, quantity= quantity, receiver=receiver)
        else:
            return []
    
    @staticmethod
    def leadTime():
        r = math_lib.getUniformRandomInteger(0, 99)
        if (r < 25):
            return 1
        elif (r < 85):
            return 2
        else:
            return 3