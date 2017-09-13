import json
from channels import Channel, Group
from channels.sessions import channel_session, enforce_ordering
from channels.auth import channel_session_user, channel_session_user_from_http,channel_session_user_from_http
from channels.security.websockets import allowed_hosts_only
from .Tracker import Tracker

GRUPO_TRACKERS = "trackers"

tracker =  None

# Permite apenas os servidores listados no settings.py
@allowed_hosts_only
# Conectado um websocket
@channel_session_user_from_http
def ws_connect(message):
    group = Group(GRUPO_TRACKERS)
    # Adiciona no grupo
    group.add(message.reply_channel)
    # Envia menssagem Accept the connection request
    message.reply_channel.send({"accept": True})
    print("connect-tracker")
 
# Conectado em um websocket
@channel_session
def ws_disconnect(message):
    Group(GRUPO_TRACKERS).discard(message.reply_channel)
    #if tracker:
    #    print("Desconectando...")
    tracker.stop()
    print("disconnect-tracker")

def ws_receive(message):
    payload = json.loads(message['text'])
    payload['reply_channel'] = message.content['reply_channel']
    Channel("tracker.receive").send(payload)
 
@channel_session_user
@channel_session
def tracker_ping(message):
    payload = json.dumps({"pong": "test"})
    message.reply_channel.send({"text": payload})

@channel_session_user
@channel_session
def tracker_connect(message):
    global tracker
    tracker = Tracker(message.reply_channel,int(message['nr_tracker']))

@channel_session_user
@channel_session
def tracker_route(message):
    global tracker
    tracker = Tracker(message.reply_channel,int(message['nr_tracker']))
    tracker.route = message['route']

