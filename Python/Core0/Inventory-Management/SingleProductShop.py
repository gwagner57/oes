import importlib
mod = importlib.import_module(".OESFoundations", "Core0.OESpyCore0") 


class SingleProductShop(mod.oBJECT):
    def __init__(self, id, name, quantityInStock, reorderLevel, targetInventory, labels):
        super().__init__(id, name)
        self.quantityInStock = quantityInStock
        self.reorderLevel = reorderLevel
        self.targetInventory = targetInventory
        self.labels = labels
