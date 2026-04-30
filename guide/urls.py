from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('process/', views.process, name='process'),
    path('timeline/', views.timeline, name='timeline'),
    path('steps/', views.steps, name='steps'),
    path('constituency/', views.constituency_lookup, name='constituency_lookup'),
    path('api/districts/', views.api_districts, name='api_districts'),
    path('api/constituencies/', views.api_constituencies, name='api_constituencies'),
]
