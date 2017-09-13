import os
import time
import json
import threading
import time
import pika
from .RabbitMQConfig import RabbitMQConfig
from channels import Channel, Group

QUEUE_TLM   = "TLM%05d"
connection  = pika.BlockingConnection(parameters=RabbitMQConfig.getConnectionParameters())    

class Tracker (threading.Thread):

    def __init__(self,ch,nr):
        super(Tracker, self).__init__()
        self._stop_event = threading.Event()
        self.address = nr
        self.values = None
        self.route = None
        self.reply_channel = ch
        self.channel = None
        self.queue_name = QUEUE_TLM % (nr) 
        self.start()

    def stopConsuming(self):
        self.channel.stop_consuming()

    def startConsuming(self):
        self.channel.start_consuming()
        print("Criado o consume da Queue: " + self.queue_name)

    def createConsume(self):
        self.channel.basic_consume(self.callbackTLM,
                            queue=self.queue_name,
                            no_ack=True)

    def callbackTLM(self,ch, method, properties, body):
        
        datas = body.decode('utf-8').split(",")

        tlm = {
            'address':  datas[0] ,
            'dest':  datas[1] ,
            'timestamp': datas[2],
            'operation': datas[3],
            'resource': datas[4],
            #'size_pl': datas[5], nao existe a necessidade

            'lat': datas[6],
            'lng': datas[7],
            'acce':{'X':datas[8],'Y':datas[9],'Z':datas[10]},
            'acce_G':{'X':round(float(datas[11]),2),'Y':round(float(datas[12]),2),'Z':round(float(datas[13]),2)},

            'speed': datas[14],
            'level':datas[15],
            'lock': datas[16],
            'timestamp_tlm': datas[17],
        }
        payload = json.dumps({"telemetry":tlm})
        self.reply_channel.send({"text":payload})
        print("Enviado TLM:" + str(payload))

    def run(self):
        self.channel = connection.channel()
        time.sleep(1)
        self.createConsume()
        self.startConsuming()

    def stop(self):
        self._stop_event.set()
        self.stopConsuming()
        self.channel.close()

    def stopped(self):
        return self._stop_event.is_set()

        
'''
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
'''           
