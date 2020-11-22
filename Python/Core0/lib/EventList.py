# OESFoundations is needed to run the testcases
#from OESFoundations import eVENT

class EventList:
    def __init__(self, a = []):
        self.events = a
        
    def add(self, e):
        self.events.append(e)
        self.events.sort(key=lambda x: x.occTime)
            
    def getNextOccurrenceTime(self):
        if len(self.events) > 0:
            return self.events[0].occTime
        else:
            return 0
        
    def getNextEvent(self):
        if (len(self.events) > 0): return self.events[0]
        else: return None
        
    def isEmpty(self):
        if (len(self.events) > 0): return False
        else: return True
        
    def removeNextEvents(self):
        nextEvents = []
        if (len(self.events) == 0): return []
        nextTime = self.events[0].occTime
        while (len(self.events) > 0 and self.events[0].occTime == nextTime):
            nextEvents.append(self.events.pop(0))
        return nextEvents

# General Testcases to see if the data structrure behaves correctly      
"""
event = eVENT(occTime=12)
event2 = eVENT(occTime=3)
event3 = eVENT(occTime=50)
event4 = eVENT(occTime=1)
eList = EventList([event, event2, event3])

l = []
for i in eList.events:
    l.append(i.occTime)

print("the list of events added to the EventList data structure using the constructor", l)

eList.add(event4) 

l = []
for i in eList.events:
    l.append(i.occTime)

print("the list of events added to the EventList data structure using a constructor and add() method", l)
 
l = []
for i in eList.removeNextEvents():
    l.append(i.occTime)

print("the list of nextEvents produced by removeNextEvents()", l)

l = []
for i in eList.events:
    l.append(i.occTime)

print("the list of events to after removeNextEvents()", l)
"""

#Other testcases
"""
event = EventList([7,8,9])
print (event.events)
event.add(5)
print (event.events)
#event.removeNextEvents()
print (event.getNextOccurrenceTime())
print (event.isEmpty())
print (event.getNextEvent())
"""