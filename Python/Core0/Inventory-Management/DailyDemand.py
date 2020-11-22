import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundations import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import math_lib

class DailyDemand(eVENT):
    def __init__(self, occTime, quantity, shop):
        super().__init__(occTime)
        self.quantity = quantity
        self.shop = shop
        
    def onEvent(self):
        q = self.quantity
        prevStockLevel = self.shop.quantityInStock
        if (q > prevStockLevel):
            sim.stat.nmrOfStockOuts = sim.stat.nmrOfStockOuts + 1
            sim.stat.lostSales = sim.stat.lostSales + (q - prevStockLevel)
            
        self.shop.quantityInStock = max(prevStockLevel-q,0)
        
        if (prevStockLevel > self.shop.reorderLevel and 
            prevStockLevel - q <= self.shop.reorderLevel):
            delay = Delivery.leadTime()
            quantity = self.shop.targetInventory - self.shop.quantityInStock
            receiver = self.shop
            return Delivery(delay, quantity, receiver)
        else:
            return []
    
    @staticmethod
    def quantity2():
        return math_lib.getUniformRandomInteger(5, 30)
    
    @staticmethod
    def recurrence():
        return 1
    
    def createNextEvent(self):
        occTime = self.occTime + DailyDemand.recurrence()
        quantity = DailyDemand.quantity2()
        shop = self.shop
        return DailyDemand(occTime, quantity, shop)
    