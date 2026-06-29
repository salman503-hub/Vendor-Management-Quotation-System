from django.urls import path, re_path
from . import views

urlpatterns = [
    # REST API Routes
    path('api/me/', views.api_me, name='api_me'),
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/dashboard/', views.api_dashboard, name='api_dashboard'),
    path('api/vendors/', views.api_vendors, name='api_vendors'),
    path('api/vendors/<int:pk>/', views.api_vendor_detail, name='api_vendor_detail'),
    path('api/requests/', views.api_requests, name='api_requests'),
    path('api/requests/<int:pk>/', views.api_request_detail, name='api_request_detail'),
    path('api/quotations/', views.api_quotations, name='api_quotations'),
    path('api/quotations/<int:pk>/status/', views.api_quotation_status, name='api_quotation_status'),
    path('api/requests/<int:request_pk>/compare/', views.api_compare, name='api_compare'),

    # SPA Fallback - Any other route is handled by React frontend
    re_path(r'^.*$', views.index_view, name='index'),
]
