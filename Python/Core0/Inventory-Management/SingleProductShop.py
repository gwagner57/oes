import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundation import oBJECT

class SingleProductShop(oBJECT):
    def __init__(self, sim, id, name, quantityInStock, reorderLevel, targetInventory):
        super().__init__(sim, id, name)
        self.quantityInStock = quantityInStock
        self.reorderLevel = reorderLevel
        self.targetInventory = targetInventory

    def __str__(self):
        objIdDescr = str(self.id) + ("/"+ self.name) if self.name is not None else ""
        objStr = "Shop{ stockQuant: "+ str(self.quantityInStock) +"}"
        return objStr