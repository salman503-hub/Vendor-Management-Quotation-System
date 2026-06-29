from django import forms
from django.core.exceptions import ValidationError
from .models import Vendor, QuotationRequest, Quotation
import re

class VendorForm(forms.ModelForm):
    class Meta:
        model = Vendor
        fields = ['name', 'company_name', 'email', 'contact_number', 'business_address']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter contact person name'}),
            'company_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter company name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'name@company.com'}),
            'contact_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., +1234567890'}),
            'business_address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Enter complete address'}),
        }

    def clean_contact_number(self):
        contact_number = self.cleaned_data.get('contact_number')
        # Allow numbers, spaces, hyphens, plus signs, and parentheses
        if not re.match(r'^\+?[0-9\s\-()]{7,20}$', contact_number):
            raise ValidationError("Please enter a valid contact number (7-20 digits, optionally starting with +).")
        return contact_number

    def clean_email(self):
        email = self.cleaned_data.get('email')
        # Check uniqueness, ignoring current instance if updating
        qs = Vendor.objects.filter(email__iexact=email)
        if self.instance and self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError("A vendor with this email address already exists.")
        return email

class QuotationRequestForm(forms.ModelForm):
    class Meta:
        model = QuotationRequest
        fields = ['title', 'description', 'status']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., Supply of Office Laptops'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Describe your request details, specifications, etc.'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }

class QuotationForm(forms.ModelForm):
    class Meta:
        model = Quotation
        fields = ['request', 'vendor', 'vendor_reference', 'amount', 'submission_date', 'status']
        widgets = {
            'request': forms.Select(attrs={'class': 'form-control'}),
            'vendor': forms.Select(attrs={'class': 'form-control'}),
            'vendor_reference': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., QTE-2026-001'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0.00', 'step': '0.01'}),
            'submission_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }

    def clean_amount(self):
        amount = self.cleaned_data.get('amount')
        if amount is None or amount <= 0:
            raise ValidationError("Quotation amount must be a positive number greater than 0.")
        return amount
