import json
from threading import Thread
from .consumers import sendTLM
from .TLMConsumer import TLMConsumer 
import time

UPDATE_INTERVAL = 5

tlm = TLMConsumer()

class workerTLM (Thread):
    # thread para inicilizacao do subscribe e publish da tlm envio periodico dos dados de telemetria"""

    def __init__(self):
        Thread.__init__(self)
        self.tlm = TLMConsumer()

    def run(self):

        self.count = 1
        self.tlm.init()
        self.tlm.loop_start()
    
        while True:
            print("Get TLM")
            self.tlm.readValues()
            sendTLM(tlm)
            self.count += 1
            time.sleep(UPDATE_INTERVAL)

    def start(self):
        Thread.start(self)