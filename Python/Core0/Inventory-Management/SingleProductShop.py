import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
import OES_Foundations


class SingleProductShop(OES_Foundations.oBJECT):
    def __init__(self, id, name, quantityInStock, reorderLevel, targetInventory, labels):
        super().__init__(id, name)
        self.quantityInStock = quantityInStock
        self.reorderLevel = reorderLevel
        self.targetInventory = targetInventory
        self.labels = labels

#print(module_path)