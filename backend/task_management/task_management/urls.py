"""
URL configuration for task_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from authentication import views
from django.views.generic import RedirectView
from boards.views import BoardListView, BoardDetailView, BoardCreateView, BoardUpdateView, BoardDeleteView, BoardFavoriteListView, BoardFavoriteCreateView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Authentication
    path('', RedirectView.as_view(url='/admin/')),  # Redirect to the admin page
    path('admin/', admin.site.urls),
    path('api/register', views.register_user, name='register'),
    path('api/login', TokenObtainPairView.as_view(), name='login'),
    path('api/logout', views.logout_user, name='logout'),
    path('api/reset-password', views.reset_password_request, name='reset-password-request'),
    re_path(r'^api/reset-password-confirm/(?P<user_id>\d+)/?(?P<reset_code>\w+)?$', views.reset_password_confirm, name='reset-password-confirm'),
    # Tokens
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Boards
    path('api/boards/', BoardListView.as_view(), name='board-list'),
    path('api/boards/<int:pk>/', BoardDetailView.as_view(), name='board-detail'),
    path('api/boards/create/', BoardCreateView.as_view(), name='board-create'),
    path('api/boards/<int:pk>/update/', BoardUpdateView.as_view(), name='board-update'),
    path('api/boards/<int:pk>/delete/', BoardDeleteView.as_view(), name='board-delete'),
    # Favorite boards
    path('api/users/<int:user_id>/favorite-boards/', BoardFavoriteListView.as_view(), name='user-favorite-board-list'),
    path('api/users/<int:user_id>/favorite-boards/add/', BoardFavoriteCreateView.as_view(), name='user-favorite-board-add'),
]