from django.conf.urls import url
from .views import *

urlpatterns = [
    url(r'^$', users_list, name='users_list'),
]