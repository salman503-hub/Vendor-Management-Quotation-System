from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from core.models import Vendor, QuotationRequest, Quotation
from core.forms import VendorForm, QuotationForm
from datetime import date

class VendorModelTests(TestCase):
    def setUp(self):
        self.vendor = Vendor.objects.create(
            name="John Doe",
            company_name="Test Company LLC",
            email="test@company.com",
            contact_number="+1234567890",
            business_address="123 Test St"
        )

    def test_vendor_string_representation(self):
        self.assertEqual(str(self.vendor), "John Doe - Test Company LLC")

    def test_vendor_form_valid(self):
        form_data = {
            'name': 'Alice Smith',
            'company_name': 'Smith Tech',
            'email': 'alice@smithtech.com',
            'contact_number': '+9876543210',
            'business_address': '456 Tech Ave'
        }
        form = VendorForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_vendor_form_invalid_phone(self):
        form_data = {
            'name': 'Alice Smith',
            'company_name': 'Smith Tech',
            'email': 'alice@smithtech.com',
            'contact_number': '123',  # Too short, invalid phone
            'business_address': '456 Tech Ave'
        }
        form = VendorForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('contact_number', form.errors)

class QuotationModelTests(TestCase):
    def setUp(self):
        self.vendor = Vendor.objects.create(
            name="Jane Connor",
            company_name="Cyberdyne Systems",
            email="jane@cyberdyne.com",
            contact_number="+9876543210",
            business_address="789 Robotics Rd"
        )
        self.req = QuotationRequest.objects.create(
            title="Server Hardware Purchase",
            description="Procuring server racks",
            status="Open"
        )

    def test_quotation_amount_validation(self):
        # Test negative quotation amount
        form_data = {
            'request': self.req.pk,
            'vendor': self.vendor.pk,
            'vendor_reference': 'REF-001',
            'amount': -1500.00,  # Negative amount should be invalid
            'submission_date': date.today(),
            'status': 'Pending'
        }
        form = QuotationForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('amount', form.errors)

    def test_quotation_ordering_lowest_first(self):
        # Create quotes with varying amounts
        quote_high = Quotation.objects.create(
            request=self.req,
            vendor=self.vendor,
            vendor_reference="HIGH-001",
            amount=5000.00,
            submission_date=date.today()
        )
        quote_low = Quotation.objects.create(
            request=self.req,
            vendor=self.vendor,
            vendor_reference="LOW-001",
            amount=2500.00,
            submission_date=date.today()
        )
        # Check standard ordering
        quotes = self.req.quotations.all()
        self.assertEqual(quotes.first(), quote_low)
        self.assertEqual(quotes.last(), quote_high)

class ViewAuthenticationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testadmin', password='testpassword123')

    def test_dashboard_redirects_for_anonymous_user(self):
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse('login'), response.url)

    def test_dashboard_accessible_for_logged_in_user(self):
        self.client.login(username='testadmin', password='testpassword123')
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'core/dashboard.html')

