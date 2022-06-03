from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth import views as auth_views
from . import views
from .views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(('api.urls', 'api'), namespace = 'api')),
    path('', include(('frontend.urls', 'frontend'), namespace='ride'))
]