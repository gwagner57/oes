import sys, os

module_path = os.path.abspath('OESpy-Core0/')
sys.path.insert(1, module_path)
from oes_foundation import oBJECT

module_path = os.path.abspath('lib/')
sys.path.insert(1, module_path)
import util

class WorkStation( oBJECT):
    def __init__(self, sim, id, name, inputBufferLength=0, status="AVAILABLE"):
        super().__init__(sim, id, name)
        self.inputBufferLength = inputBufferLength
        self.status = status

    def __str__(self):
        objIdDescr = str(self.id) + ("/"+ self.name) if self.name is not None else ""
        objStr = "WS{ inpBufLen: "+ str(self.inputBufferLength) + ", status: "+ self.status +"}"
        return objStr