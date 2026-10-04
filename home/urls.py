from django.urls import path
from . import views
app_name ='home'
urlpatterns =[
    path('',views.landingpage ,name ='landingpage'),
    path('home',views.homepage , name='homepage'),
]