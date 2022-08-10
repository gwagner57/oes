import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundation import eVENT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import util

from workstation import WorkStation
from processing_end import ProcessingEnd


class ProcessingStart( eVENT):
    def __init__(self, sim, workStation, occTime=None, delay=None):
        super().__init__( sim, occTime, delay)
        self.workStation = workStation

    def onEvent( self, sim):
        followupEvents = []
        ws = self.workStation
        # perform state changes
        ws.status = "BUSY"
        # create follow-up events
        followupEvents.append( ProcessingEnd( sim, ws, delay=ProcessingStart.processingTime()))
        return followupEvents

    @staticmethod
    def processingTime(): return util.getUniformRandomNumber(3, 9)

    def __str__(self): return "ProcStart@"+ str(round(self.occTime,2))
    