class eVENT:
    def __init__(self, sim, occTime = None, delay = None):
        # if occTime is given as a parameter
        if (occTime!=None):
            self.occTime = occTime
            
        # if delay is given as a parameter
        elif (delay!=None):
            self.occTime = sim.time + delay
        
        # default if no parameter is given 
        else:
            self.occTime = sim.time + sim.nextMomentDeltaT
        
    def toString(self):
        pass
        
class oBJECT:
    def __init__(self, sim, id = None, name = None):
        # if id is given as a parameter
        if (id != None):
            self.id = id
            
        # default if no id parameter is given
        else:
            self.id = sim.scenario.idCounter + 1
            
        self.name = name
        
    def toString(self):
        pass

#General testcases
""" 
ev = eVENT()
print(ev.occTime)
ob = oBJECT(name="object")
print(ob.name, ob.id)
"""