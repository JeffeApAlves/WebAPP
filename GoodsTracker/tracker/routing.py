from channels import route
from .consumers import *

websocket_routing = [
    # Chamado quando um WebSockets é conectado
    route("websocket.connect", ws_connect),

    # Chamado quando um WebSockets envia um data frame
    route("websocket.receive", ws_receive),

    # Chamado quando um websocket disconecta
    route("websocket.disconnect", ws_disconnect),
]

custom_routing = [

    route("tracker.receive", tracker_ping, command="^ping$"),
    route("tracker.receive", tracker_tlm,  command="^update_tlm$"),
    route("tracker.receive", tracker_route,  command="^route$"),
]