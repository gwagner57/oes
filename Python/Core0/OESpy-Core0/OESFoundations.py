import simulator

class eVENT:
    def __init__(self, occTime = None, delay = None):
        # if occTime is given as a parameter
        if (occTime!=None):
            self.occTime = occTime
            
        # if delay is given as a parameter
        elif (delay!=None):
            self.occTime = simulator.sim.time + delay
        
        # default if no parameter is given 
        else:
            self.occTime = simulator.sim.time + simulator.sim.nextMomentDeltaT
        
    def toString(self):
        pass
        
class oBJECT:
    def __init__(self, id = None, name = None):
        # if id is given as a parameter
        if (id != None):
            self.id = id
            
        # default if no id parameter is given
        else:
            self.id = simulator.sim.scenario.idCounter + 1
            
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