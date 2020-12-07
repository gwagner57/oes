import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundations import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import math_lib

from Delivery import Delivery

class DailyDemand(eVENT):
    def __init__(self, sim, occTime, quantity, shop):
        super().__init__(sim, occTime)
        self.quantity = quantity
        self.shop = shop
        self.labels = {"quantity":quantity}
        
    def onEvent(self, sim):
        q = self.quantity
        prevStockLevel = self.shop.quantityInStock
        if (q > prevStockLevel):
            sim.stat["nmrOfStockOuts"] = sim.stat["nmrOfStockOuts"] + 1
            sim.stat["lostSales"] = sim.stat["lostSales"] + (q - prevStockLevel)
            
        self.shop.quantityInStock = max(prevStockLevel-q,0)
        
        if (prevStockLevel > self.shop.reorderLevel and 
            prevStockLevel - q <= self.shop.reorderLevel):
            delay = Delivery.leadTime()
            quantity = self.shop.targetInventory - self.shop.quantityInStock
            receiver = self.shop
            return [Delivery(sim, quantity, receiver, delay=delay)]
        
        else:
            return []
    
    @staticmethod
    def quantity2():
        return math_lib.getUniformRandomInteger(5, 30)
    
    @staticmethod
    def recurrence():
        return 1
    
    def createNextEvent(self, sim):
        occTime = self.occTime + DailyDemand.recurrence()
        quantity = DailyDemand.quantity2()
        shop = self.shop
        return DailyDemand(sim, occTime, quantity, shop)
    
    def __str__(self):
        return 'Type: Daily Demand, Quantity:'+str(self.quantity)+', Shop: '+ str(self.shop.name)
    