from __future__ import print_function
import os
import paho.mqtt.client as mqtt
import time
from core.thingspeak.ThingSpeak import ThingSpeak
from ast import literal_eval
import json
#from threading import Thread
import threading
import time

#ThingSpeak
# ID do canal do ThingSpeak
TLM_CHANNEL_ID = "315831"
# Chave de escrita da API para o canal
TLM_READ_API_KEY = "TF63H3V6I2UWO954"
#Host mqtt do ThigSpeak
mqttHost = "mqtt.thingspeak.com"

#Porta 
tPort = 80

class Tracker (threading.Thread):

    def __init__(self):
        super(Tracker, self).__init__()
        self._stop_event = threading.Event()
        self.count = 0
        self.temperature = 0
        self.cpu = 0
        self.memory = 0
        self.disk=''
        self.pressure = 0
        self.humidity = 0
        self.ts = ThingSpeak()
        self.values = None
        self.route = None
        self.count = 0

    def init(self):
        pass
#        self.client = mqtt.Client()
#        self.client.connect(mqttHost,tPort)
 
    def getCPUtemperature(self):
        return self.values.temperature
  
    def getCPU(self):
        return self.values.cpu

    def getMemory(self):
        return self.values.memory

    def getDisk(self):
         return self.values.disk

    def getPressure(self):
        return self.values.pressure

    def getHumidity(self):
        return self.values.humidity

    def readTLM(self):
        
        lat = 0
        lng = 0

        if self.route != None and self.count < len(self.route['legs'][0]['steps']):
            if self.count % 2 == 0:
                lat = self.route['legs'][0]['steps'][self.count]['start_location']['lat']
                lng = self.route['legs'][0]['steps'][self.count]['start_location']['lng']
            else:
                lat = self.route['legs'][0]['steps'][self.count]['end_location']['lat']
                lng = self.route['legs'][0]['steps'][self.count]['end_location']['lng']
                pass

            self.count+=1


        return {
            'address':  2 ,
            'dest':  1 ,
            'timestamp': 1288239239,
            'operation': 'AN',
            'resource': 'TLM',

            'lat': lat,
            'lng': lng,
            'acce,':{'X':2000,'Y':3000,'Z':4000},
            'acce_G,':{'X':0.2,'Y':0.3,'Z':1},

            'speed': 60,
            'level':1000,
            'lock': 1,
            'timestamp_tlm': 321982389,
        }
           
    def loop_start(self):
        pass
#        self.client.loop_start()

    def run(self):
        self.values = self.ts.readChannel(channel=TLM_CHANNEL_ID,key=TLM_READ_API_KEY)
        time.sleep(5)

    def stop(self):
        self._stop_event.set()

    def stopped(self):
        return self._stop_event.is_set()