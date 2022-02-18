from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic.base import RedirectView

from . import views

urlpatterns = [
    #Refer to Corey Schafer's Django tutorial.
    path("accounts/login/",LoginView.as_view(),name="login"),
    path("accounts/logout/",LogoutView.as_view(),name="logout"),
    path("accounts/signup/",views.signup,name="signup"),
    
    path("",RedirectView.as_view(url="home")),
    path("home/",views.home,name="home"),
    path("create/",views.create_maze,name="create_maze"),
    path("play/<int:pk>/",views.play_maze,name="play_maze"),
    path("maze/<int:pk>/",views.MazeDetailView.as_view(),name="maze"),
    path("search_mazes/",views.MazeListView.as_view(),name="search_mazes"),
    path("user/<int:pk>/",views.view_user,name="user"),
    path("profile",views.profile,name="profile"),
    path('maze/delete/<int:pk>/',views.MazeDeleteView.as_view(),name="delete_maze"),
    path('maze/update_maze/<int:pk>/',views.update_maze,name="update_maze"),
    path("wiki/",views.wiki,name="wiki"),
]