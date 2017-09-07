from django.contrib import admin
from django import forms
from .models import *


class EnderecoForm(forms.ModelForm):
    class Media:
        css = {
            'all': ('route/geo_position.css',)
        }
        js = ('route/geo_position.js',)

class EnderecoAdmin(admin.ModelAdmin):
    form = EnderecoForm
    search_fields = ('rua', 'cidade',)
    list_display = ('rua', 'cidade','estado','bairro')
    list_filter = ['estado',]
    save_on_top = True

admin.site.register(Endereco, EnderecoAdmin)