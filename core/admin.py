from django.contrib import admin
from .models import Vendor, QuotationRequest, Quotation, ActivityLog

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'name', 'email', 'contact_number', 'created_at')
    search_fields = ('company_name', 'name', 'email')
    list_filter = ('created_at',)

@admin.register(QuotationRequest)
class QuotationRequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('status', 'created_at')

@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'request', 'vendor_reference', 'amount', 'submission_date', 'status')
    search_fields = ('vendor_reference', 'vendor__company_name', 'request__title')
    list_filter = ('status', 'submission_date')

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'timestamp')
    search_fields = ('action', 'details', 'user__username')
    list_filter = ('timestamp',)

