import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundation import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import util

#from processing_start import ProcessingStart
import processing_start

class ProcessingEnd( eVENT):
    def __init__(self, sim, workStation, occTime=None, delay=None):
        super().__init__( sim, occTime, delay)
        self.workStation = workStation

    def onEvent( self, sim):
        followupEvents = []
        ws = self.workStation
        # perform state changes
        ws.inputBufferLength -= 1
        if ws.inputBufferLength == 0: ws.status = "AVAILABLE"
        # update statistics
        sim.stat["departedParts"] += 1
        # schedule follow-up events
        if ws.inputBufferLength > 0: followupEvents.append( processing_start.ProcessingStart( sim, ws))
        return followupEvents

    def __str__(self): return "ProcEnd@"+ str(round(self.occTime,2))
    