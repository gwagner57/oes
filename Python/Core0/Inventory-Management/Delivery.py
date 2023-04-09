import sys, os

module_path = os.path.abspath('framework/')
sys.path.insert(1, module_path)
from oes_foundation import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import util

class Delivery(eVENT):
    def __init__(self, sim, quantity, receiver, occTime=None, delay=None):
        super().__init__( sim, occTime, delay)
        self.quantity = quantity
        self.receiver = receiver

    def onEvent( self, sim):
        followupEvents = []
        # perform state changes
        self.receiver.quantityInStock += self.quantity
        # if stock quantity is still below reorderLevel, order more
        if self.receiver.quantityInStock <= self.receiver.reorderLevel:
            quantity = self.receiver.targetInventory - self.receiver.quantityInStock
            receiver = self.receiver
            followupEvents.append( Delivery( sim, quantity, receiver, delay = Delivery.leadTime()))
        return followupEvents

    @staticmethod
    def leadTime():
        r = util.getUniformRandomInteger( 0, 99)
        if r < 25: return 1
        elif r < 85: return 2
        else: return 3
    
    def __str__(self):
        return "Delivery@"+ str(self.occTime) +"{ quant: " + str(self.quantity) + "}"
    