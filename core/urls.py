from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),

    # Dashboard
    path('', views.dashboard_view, name='dashboard'),
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # Vendors
    path('vendors/', views.vendor_list_view, name='vendor_list'),
    path('vendors/add/', views.vendor_create_view, name='vendor_create'),
    path('vendors/<int:pk>/', views.vendor_detail_view, name='vendor_detail'),
    path('vendors/<int:pk>/edit/', views.vendor_update_view, name='vendor_update'),
    path('vendors/<int:pk>/delete/', views.vendor_delete_view, name='vendor_delete'),

    # Quotation Requests
    path('requests/', views.quotation_request_list_view, name='quotation_request_list'),
    path('requests/create/', views.quotation_request_create_view, name='quotation_request_create'),
    path('requests/<int:pk>/', views.quotation_request_detail_view, name='quotation_request_detail'),
    path('requests/<int:pk>/edit/', views.quotation_request_update_view, name='quotation_request_update'),
    path('requests/<int:pk>/delete/', views.quotation_request_delete_view, name='quotation_request_delete'),

    # Quotations (Responses/Proposals)
    path('quotations/submit/', views.quotation_create_view, name='quotation_create'),
    path('quotations/<int:pk>/status/', views.quotation_status_update_view, name='quotation_status_update'),

    # Comparison
    path('requests/<int:request_pk>/compare/', views.compare_view, name='compare_quotations'),
]
