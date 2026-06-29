import os
import sys
import django
from datetime import date, timedelta

# Initialize Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Vendor, QuotationRequest, Quotation, ActivityLog

def populate_database():
    print("Populating database with demo data...")

    # 1. Create Superuser (Admin)
    username = "admin"
    password = "admin123"
    email = "admin@teyzix.com"
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Created admin account: Username = '{username}', Password = '{password}'")
    else:
        print("Admin account already exists.")
        
    admin_user = User.objects.get(username=username)

    # 2. Create Sample Vendors
    vendors_data = [
        {
            "name": "Sarah Connor",
            "company_name": "Apex Tech Systems",
            "email": "sarah@apextech.com",
            "contact_number": "+1 555-0199",
            "business_address": "Building 5, Techno Park, Sector 4\nNew York, NY"
        },
        {
            "name": "Marcus Wright",
            "company_name": "Horizon Office Furniture",
            "email": "marcus@horizonfurniture.com",
            "contact_number": "+1 555-0144",
            "business_address": "88 Industrial Way\nChicago, IL"
        },
        {
            "name": "John Connor",
            "company_name": "Matrix Logistics & Supplies",
            "email": "john@matrixlogistics.com",
            "contact_number": "+1 555-0188",
            "business_address": "Suite 12, Terminal Area\nLos Angeles, CA"
        }
    ]

    vendors = []
    for data in vendors_data:
        vendor, created = Vendor.objects.get_or_create(
            email=data["email"],
            defaults=data
        )
        if created:
            print(f"Created Vendor: {vendor.company_name}")
            ActivityLog.objects.create(
                user=admin_user, 
                action="Create Vendor", 
                details=f"Demo Setup: Created Vendor {vendor.company_name}"
            )
        vendors.append(vendor)

    # 3. Create Sample Quotation Requests
    requests_data = [
        {
            "title": "Corporate Laptop Upgrade",
            "description": "Request for proposals for supplying 25 high-performance developer laptops.\n\nRequired specifications:\n- CPU: Intel Core i7 / AMD Ryzen 7 (12th gen or higher)\n- RAM: 32 GB DDR5\n- Storage: 1 TB NVMe SSD\n- Screen: 15.6 inch FHD\n- Warranty: 3 Years on-site warranty\n\nPlease submit all prices in USD including shipping to NY Warehouse.",
            "status": "Open"
        },
        {
            "title": "HQ Office Executive Chairs",
            "description": "Seeking quotations for 50 ergonomic mesh office chairs with adjustable armrests, lumbar support, and headrests.\n\nColor preference: Charcoal Black.\nSubmit samples if possible.",
            "status": "Open"
        }
    ]

    requests = []
    for data in requests_data:
        req, created = QuotationRequest.objects.get_or_create(
            title=data["title"],
            defaults=data
        )
        if created:
            print(f"Created Quotation Request: {req.title}")
            ActivityLog.objects.create(
                user=admin_user, 
                action="Create Quotation Request", 
                details=f"Demo Setup: Created Request '{req.title}'"
            )
        requests.append(req)

    # 4. Create Quotation Responses (Proposals)
    # Quotes for Request 1 (Laptop Upgrade)
    laptop_quotes = [
        {
            "request": requests[0],
            "vendor": vendors[0],  # Apex Tech Systems
            "vendor_reference": "APX-2026-908",
            "amount": 28750.00,
            "submission_date": date.today() - timedelta(days=2),
            "status": "Pending"
        },
        {
            "request": requests[0],
            "vendor": vendors[2],  # Matrix Logistics & Supplies
            "vendor_reference": "MTX-LAP-26",
            "amount": 26900.00,  # Lowest laptop quote (Most Cost-Effective)
            "submission_date": date.today() - timedelta(days=1),
            "status": "Pending"
        }
    ]

    # Quotes for Request 2 (Office Chairs)
    chair_quotes = [
        {
            "request": requests[1],
            "vendor": vendors[1],  # Horizon Office Furniture
            "vendor_reference": "HZ-CH-44",
            "amount": 7500.00,   # Lowest chair quote
            "submission_date": date.today() - timedelta(days=3),
            "status": "Approved"
        },
        {
            "request": requests[1],
            "vendor": vendors[2],  # Matrix Logistics & Supplies
            "vendor_reference": "MTX-FUR-01",
            "amount": 8200.00,
            "submission_date": date.today() - timedelta(days=2),
            "status": "Pending"
        }
    ]

    all_quotes = laptop_quotes + chair_quotes
    for q_data in all_quotes:
        quote, created = Quotation.objects.get_or_create(
            request=q_data["request"],
            vendor=q_data["vendor"],
            vendor_reference=q_data["vendor_reference"],
            defaults={
                "amount": q_data["amount"],
                "submission_date": q_data["submission_date"],
                "status": q_data["status"]
            }
        )
        if created:
            print(f"Created Quote: {quote.vendor.company_name} - ${quote.amount}")
            ActivityLog.objects.create(
                user=admin_user,
                action="Submit Quotation Response",
                details=f"Demo Setup: Vendor '{quote.vendor.company_name}' submitted quote for '{quote.request.title}' (${quote.amount})"
            )

    print("\nDatabase populated successfully!")
    print(f"--- Login Information ---")
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"-------------------------")

if __name__ == "__main__":
    populate_database()
