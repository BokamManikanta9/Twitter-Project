from django.urls import path
from . import views
app_name = "accounts"  
urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('edit_profile/', views.edit_profile_view, name='edit_profile'),
    path('request-verification/', views.request_verification, name='request_verification'),
    path('follow/<int:user_id>/',views.follow_user,name='follow_user'),
    path('people/', views.people, name='people'),
    path('search/', views.search_page, name='search_page'),
    path('<str:username>/followers/',views.followers_list,name= 'followers_list'),
    path('<str:username>/following/',views.following_list,name='following_list'),
    path('<str:username>/', views.profile_view, name='profile'),
   
]