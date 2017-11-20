#! /bin/bash
#  
#  Scrip com variveis de ambiente para do GoodsTracker
#
#  gTracker     : inicia o servidor web com a aplicacao goodstracker
#  pmAdmin      : Inicia o Adm do banco de dados
#  sudo ntopng  : Inicia o servidor web com a aplicacao ntop
#

source /usr/local/bin/virtualenvwrapper.sh
export WORKON_HOME=$HOME/.virtualenvs


export BASE_PATH=/media/jefferson/Dados/workspace/WebAPP
export BASE_PRJ=$BASE_PATH/GoodsTracker
export DEST_PRJ=/home/jefferson

IP_SERVER=192.168.42.1
PYTHON_VERSION=$(python --version | cut -c 8-10) 
PORT=8000
IP=$(ifconfig | grep 'inet ' | awk '/192.168.42/{print $2}' | sed 's,^ *,,; s, *$,,' )
WEB_HOST="$IP:$PORT"
ENV_PACKAGES=/tmp/env_packages.txt

G_TRACKER=$BASE_PRJ/manage.py
PG_ADMIN=$WORKON_HOME/gTracker/lib/python$PYTHON_VERSION/site-packages/pgadmin4/pgAdmin4.py

alias pgAdmin='python $PG_ADMIN'
alias gTracker='python $G_TRACKER runserver $WEB_HOST'
alias pip-u-all='pip freeze --local > $ENV_PACKAGES && pip install -U -r $ENV_PACKAGES'
alias p_sel='sudo update-alternatives --config python'
alias sync-prj='rsync -avz $BASE_PRJ jefferson@$IP_SERVER:$DEST_PRJ'