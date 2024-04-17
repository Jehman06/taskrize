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
from authentication.views import register_user, login_user, logout_user, reset_password_request, reset_password_confirm, get_profile
from django.views.generic import RedirectView
from workspaces.views import create_workspace, get_workspaces, update_workspace, delete_workspace, get_workspace_boards
from boards.views import get_boards, create_board, update_board, toggle_favorite_board, delete_board
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    # Authentication
    path('', RedirectView.as_view(url='/admin/')), # Redirect to the admin page
    path('admin/', admin.site.urls),
    path('api/register', register_user, name='register'),
    path('api/login', login_user, name='login'),
    path('api/logout', logout_user, name='logout'),
    path('api/reset-password', reset_password_request, name='reset-password-request'),
    re_path(r'^api/reset-password-confirm/(?P<user_id>\d+)/?(?P<reset_code>\w+)?$', reset_password_confirm, name='reset-password-confirm'),
    # User
    path('api/user/profile', get_profile, name='user-profile'),
    # Tokens
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    # Workspaces
    path('api/workspaces/', get_workspaces, name='workspace-list'),
    path('api/workspaces/<int:workspace_id>/boards/', get_workspace_boards, name='workspace-board'),
    path('api/workspaces/create', create_workspace, name='workspace-create'),
    path('api/workspaces/update', update_workspace, name='workspace-update'),
    path('api/workspaces/delete', delete_workspace, name='workspace-delete'),
    # Boards
    path('api/boards/', get_boards, name='board-list'),
    path('api/boards/create', create_board, name='board-create'),
    path('api/boards/update', update_board, name='board-update'),
    path('api/boards/toggle-favorite', toggle_favorite_board, name='toggle-favorite-board'),
    path('api/boards/delete', delete_board, name='board-delete'),
]