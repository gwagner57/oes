import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundations import oBJECT


class SingleProductShop(oBJECT):
    def __init__(self, sim, id, name, quantityInStock, reorderLevel, targetInventory, labels = None):
        super().__init__(sim, id, name)
        self.quantityInStock = quantityInStock
        self.reorderLevel = reorderLevel
        self.targetInventory = targetInventory
        self.labels = labels
