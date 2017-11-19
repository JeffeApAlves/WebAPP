#! /bin/bash
#
# ROda os servidores

sudo ntopng &

python /home/jefferson/WebAPP/GoodsTracker/manage.py runserver 192.168.42.1:8000 &

python $WORKON_HOME/gTracker/lib/python3.5/site-packages/pgadmin4/pgAdmin4.py