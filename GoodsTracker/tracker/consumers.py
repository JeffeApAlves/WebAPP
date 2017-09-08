import json
from channels import Channel, Group
from channels.sessions import channel_session, enforce_ordering
from channels.auth import channel_session_user, channel_session_user_from_http,channel_session_user_from_http
from channels.security.websockets import allowed_hosts_only

# Permitir apenas os servidores listados no settings.py
@allowed_hosts_only
# Conectado um websocket
@channel_session_user_from_http
def ws_connect(message):
    group = Group("trackers")
    # Adiciona no grupo
    group.add(message.reply_channel)
    # Envia messangem Accept the connection request
    message.reply_channel.send({"accept": True})
    print("accept-tracker")
 
# Conectado em um websocket
@channel_session
def ws_disconnect(message):
    Group("trackers").discard(message.reply_channel)
    tlm.stop()

def ws_receive(message):
    payload = json.loads(message['text'])
    payload['reply_channel'] = message.content['reply_channel']
    Channel("tracker.receive").send(payload)
    #Debug
    print("WS Tracker rx:" + str(message.content))

@channel_session_user
@channel_session
def tracker_ping(message):
    payload = json.dumps({"pong": "test"})
    message.reply_channel.send({"text": payload})
    print("Enviado pong:" + payload)

@channel_session_user
@channel_session
def tracker_tlm(message):
    payload = json.dumps({"telemetry":tlm.readTLMChannel()})
    message.reply_channel.send({"text": payload})
    #Debug
    print("Enviado TLM:" + str(payload))