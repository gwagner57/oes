import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundation import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import util

from Delivery import Delivery

class DailyDemand( eVENT):
    def __init__(self, sim, quantity, shop, occTime=None, delay=None):
        super().__init__(sim, occTime, delay)
        self.quantity = quantity
        self.shop = shop

    def onEvent(self, sim):
        followupEvents = []
        q = self.quantity
        prevStockLevel = self.shop.quantityInStock
        # perform state changes
        self.shop.quantityInStock = max( prevStockLevel-q, 0)
        # update statistics
        if q > prevStockLevel:
            sim.stat["nmrOfStockOuts"] = sim.stat["nmrOfStockOuts"] + 1
            sim.stat["lostSales"] = sim.stat["lostSales"] + (q - prevStockLevel)
        # create follow-up events
        if prevStockLevel > self.shop.reorderLevel >= prevStockLevel - q :
            quantity = self.shop.targetInventory - self.shop.quantityInStock
            receiver = self.shop
            followupEvents.append( Delivery( sim, quantity, receiver, delay=Delivery.leadTime()))
        return followupEvents
    
    @staticmethod
    def quantity(): return util.getUniformRandomInteger(5, 30)
    
    @staticmethod
    def recurrence(): return 1
    
    def createNextEvent(self, sim):
        quantity = DailyDemand.quantity()
        shop = self.shop
        return DailyDemand( sim, quantity, shop, delay=DailyDemand.recurrence())
    
    def __str__(self):
        return "Demand@"+ str(self.occTime) + "{ quant:"+ str(self.quantity) +"}"
    