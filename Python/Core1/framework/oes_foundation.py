defaults = {
  "nextMomentDeltaT": 0.01,
  "expostStatDecimalPlaces": 2,
  "simLogDecimalPlaces": 2
}

class eVENT:
    def __init__(self, sim, occTime = None, delay = None):
        if occTime != None: self.occTime = occTime + sim.time
        elif delay != None: self.occTime = sim.time + delay
        else: self.occTime = sim.time + sim.nextMomentDeltaT
        
    def toString(self): pass

    def __str__(self):
        return self.__class__.__name__ + " @ " + "{:.2f}".format(self.occTime)
        
class oBJECT:
    def __init__(self, sim, id = None, name = None):
        if id != None: self.id = id
        else: self.id = sim.idCounter
            
        if name != None: self.name = name

        # add each new object to the collection of simulation objects
        sim.objects[ self.id] = self

    def toString(self): pass

