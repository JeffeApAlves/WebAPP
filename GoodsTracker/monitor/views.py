from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from .TLMConsumer import TLMConsumer

tlm = TLMConsumer()

@login_required(login_url='/log_in/')
def index(request):
    return render(request, 'monitor/index.html')

def pressure(request):    
    return HttpResponse("Pressao: %s %%" % str(tlm.getPressure()))

def humidity(request):
    return HttpResponse("Humidade: %s %%" % str(tlm.getHumidity()))

def temperature(request):
    return HttpResponse("Temperatura: %s Celsus" % str(tlm.getCPUtemperature()))
    
def cpu(request):
    return HttpResponse("CPU: %s %%" % str(tlm.getCPU()))

def memory(request):
    return HttpResponse("Memoria: %s MB" % str(tlm.getMemory()))

def disk(request):
    return HttpResponse("Disco: %s GB" % str(tlm.getDisk()))
