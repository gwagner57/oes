import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundation import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import util

from processing_start import ProcessingStart

class PartArrival( eVENT):
    def __init__( self, sim, workStation, occTime=None, delay=None ):
        super().__init__(sim, occTime, delay)
        self.workStation = workStation

    def onEvent( self, sim):
        followupEvents = []
        ws = self.workStation
        # perform state changes
        ws.inputBufferLength += 1
        # update statistics
        sim.stat["arrivedParts"] += 1
        if ws.inputBufferLength > sim.stat["maxQueueLength"]:
            sim.stat["maxQueueLength"] = ws.inputBufferLength
        # schedule follow-up events
        if ws.status == "AVAILABLE":
            followupEvents.append( ProcessingStart( sim, ws))
        return followupEvents

    @staticmethod
    def recurrence(): return util.getUniformRandomNumber( 3, 9)
    
    def createNextEvent(self, sim):
        return PartArrival( sim, self.workStation, delay=PartArrival.recurrence())
    
    def __str__(self): return "Arr@"+ str(round(self.occTime,2))
    