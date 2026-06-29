import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.db.models import Min, Max, Avg, Count, Sum, Q
from django.utils.decorators import method_decorator
from django.utils import timezone
from .models import Vendor, QuotationRequest, Quotation, ActivityLog
from .forms import VendorForm, QuotationRequestForm, QuotationForm

# Helper function to log activities
def log_activity(user, action, details):
    ActivityLog.objects.create(user=user, action=action, details=details)

# --- Serve React SPA ---

@ensure_csrf_cookie
def index_view(request):
    """
    Serves the entry point of the React SPA (compiled index.html).
    ensure_csrf_cookie ensures that Django sets the 'csrftoken' cookie
    which React can then read for subsequent API mutations.
    """
    return render(request, 'index.html')


# --- REST API Endpoints ---

def api_me(request):
    """
    Checks if the user is authenticated and returns details.
    """
    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'user': {
                'username': request.user.username,
                'email': request.user.email
            }
        })
    return JsonResponse({'authenticated': False}, status=200)


def api_register(request):
    """
    Registers a new admin user.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        
        if not username or not password or not password_confirm:
            return JsonResponse({'error': 'All fields are required.'}, status=400)
            
        if password != password_confirm:
            return JsonResponse({'error': 'Passwords do not match.'}, status=400)
            
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists.'}, status=400)
            
        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        log_activity(user, "User Registration", f"User {user.username} registered and logged in.")
        
        return JsonResponse({
            'message': 'Registration successful.',
            'user': {'username': user.username}
        })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def api_login(request):
    """
    Log in user and establish session.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'error': 'Username and password are required.'}, status=400)
            
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            log_activity(user, "User Login", f"User {user.username} logged in successfully.")
            return JsonResponse({
                'message': 'Login successful.',
                'user': {'username': user.username}
            })
        else:
            return JsonResponse({'error': 'Invalid username or password.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)


def api_logout(request):
    """
    Log out user.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    if request.user.is_authenticated:
        username = request.user.username
        user = request.user
        logout(request)
        log_activity(user, "User Logout", f"User {username} logged out.")
        return JsonResponse({'message': 'Logged out successfully.'})
        
    return JsonResponse({'message': 'Not logged in.'}, status=400)


@login_required
def api_dashboard(request):
    """
    Fetch counts and data for the Dashboard.
    """
    total_vendors = Vendor.objects.count()
    active_requests = QuotationRequest.objects.filter(status='Open').count()
    pending_quotations = Quotation.objects.filter(status='Pending').count()
    approved_quotations = Quotation.objects.filter(status='Approved').count()
    
    recent_activities = list(ActivityLog.objects.all().values('id', 'action', 'details', 'timestamp')[:8])
    
    latest_requests = []
    for req in QuotationRequest.objects.all()[:5]:
        latest_requests.append({
            'id': req.id,
            'title': req.title,
            'status': req.status,
            'quote_count': req.quotations.count()
        })
        
    latest_quotes = []
    for quote in Quotation.objects.all().order_by('-created_at')[:5]:
        latest_quotes.append({
            'id': quote.id,
            'vendor_id': quote.vendor.id,
            'vendor_company': quote.vendor.company_name,
            'request_title': quote.request.title,
            'amount': str(quote.amount),
            'status': quote.status
        })

    return JsonResponse({
        'total_vendors': total_vendors,
        'active_requests': active_requests,
        'pending_quotations': pending_quotations,
        'approved_quotations': approved_quotations,
        'recent_activities': recent_activities,
        'latest_requests': latest_requests,
        'latest_quotes': latest_quotes
    })


@login_required
def api_vendors(request):
    """
    List vendors (GET) or Create vendor (POST).
    """
    if request.method == 'GET':
        vendors = Vendor.objects.all()
        query = request.GET.get('search', '')
        if query:
            vendors = vendors.filter(
                Q(name__icontains=query) |
                Q(company_name__icontains=query) |
                Q(email__icontains=query)
            )
        return JsonResponse(list(vendors.values('id', 'name', 'company_name', 'email', 'contact_number', 'business_address', 'created_at')), safe=False)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = VendorForm(data)
            if form.is_valid():
                vendor = form.save()
                log_activity(request.user, "Create Vendor", f"Added new vendor: {vendor.company_name} ({vendor.name})")
                return JsonResponse({
                    'message': 'Vendor created successfully.',
                    'vendor': {'id': vendor.id, 'company_name': vendor.company_name}
                }, status=201)
            else:
                # Format validation errors
                errors = {field: errors[0] for field, errors in form.errors.items()}
                return JsonResponse({'error': 'Validation failed.', 'details': errors}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body.'}, status=400)


@login_required
def api_vendor_detail(request, pk):
    """
    Retrieve (GET), Update (PUT), or Delete (DELETE) a single vendor.
    """
    vendor = get_object_or_404(Vendor, pk=pk)
    
    if request.method == 'GET':
        quotations = []
        for q in vendor.quotations.all().order_by('-created_at'):
            quotations.append({
                'id': q.id,
                'request_id': q.request.id,
                'request_title': q.request.title,
                'vendor_reference': q.vendor_reference,
                'amount': str(q.amount),
                'submission_date': q.submission_date.isoformat(),
                'status': q.status
            })
            
        total_submitted = len(quotations)
        approved_count = vendor.quotations.filter(status='Approved').count()
        total_amount = vendor.quotations.filter(status='Approved').aggregate(sum_amount=Sum('amount'))['sum_amount'] or 0.00
        
        return JsonResponse({
            'vendor': {
                'id': vendor.id,
                'name': vendor.name,
                'company_name': vendor.company_name,
                'email': vendor.email,
                'contact_number': vendor.contact_number,
                'business_address': vendor.business_address,
                'created_at': vendor.created_at.isoformat()
            },
            'quotations': quotations,
            'total_submitted': total_submitted,
            'approved_count': approved_count,
            'total_amount': str(total_amount)
        })
        
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            form = VendorForm(data, instance=vendor)
            if form.is_valid():
                vendor = form.save()
                log_activity(request.user, "Update Vendor", f"Updated vendor details for: {vendor.company_name}")
                return JsonResponse({'message': 'Vendor updated successfully.'})
            else:
                errors = {field: errors[0] for field, errors in form.errors.items()}
                return JsonResponse({'error': 'Validation failed.', 'details': errors}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
            
    elif request.method == 'DELETE':
        company_name = vendor.company_name
        vendor.delete()
        log_activity(request.user, "Delete Vendor", f"Deleted vendor: {company_name}")
        return JsonResponse({'message': 'Vendor deleted successfully.'}, status=200)


@login_required
def api_requests(request):
    """
    List requests (GET) or Create request (POST).
    """
    if request.method == 'GET':
        reqs = QuotationRequest.objects.all()
        data = []
        for r in reqs:
            data.append({
                'id': r.id,
                'title': r.title,
                'description': r.description,
                'status': r.status,
                'created_at': r.created_at.isoformat(),
                'quote_count': r.quotations.count()
            })
        return JsonResponse(data, safe=False)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = QuotationRequestForm(data)
            if form.is_valid():
                req = form.save()
                log_activity(request.user, "Create Quotation Request", f"Created request: '{req.title}'")
                return JsonResponse({
                    'message': 'Quotation request created successfully.',
                    'request': {'id': req.id, 'title': req.title}
                }, status=201)
            else:
                errors = {field: errors[0] for field, errors in form.errors.items()}
                return JsonResponse({'error': 'Validation failed.', 'details': errors}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body.'}, status=400)


@login_required
def api_request_detail(request, pk):
    """
    Retrieve (GET), Update (PUT), or Delete (DELETE) a single request.
    """
    req = get_object_or_404(QuotationRequest, pk=pk)
    
    if request.method == 'GET':
        quotes = []
        for q in req.quotations.all().order_by('amount'):
            quotes.append({
                'id': q.id,
                'vendor_id': q.vendor.id,
                'vendor_company': q.vendor.company_name,
                'vendor_reference': q.vendor_reference,
                'amount': str(q.amount),
                'submission_date': q.submission_date.isoformat(),
                'status': q.status
            })
            
        stats_agg = req.quotations.aggregate(
            min_amount=Min('amount'),
            max_amount=Max('amount'),
            avg_amount=Avg('amount'),
            total_quotes=Count('id')
        )
        
        stats = {
            'min_amount': str(stats_agg['min_amount'] or '0.00'),
            'max_amount': str(stats_agg['max_amount'] or '0.00'),
            'avg_amount': str(stats_agg['avg_amount'] or '0.00'),
            'total_quotes': stats_agg['total_quotes'] or 0
        }
        
        lowest = req.quotations.all().order_by('amount').first()
        lowest_quote = {
            'id': lowest.id,
            'vendor_company': lowest.vendor.company_name,
            'amount': str(lowest.amount)
        } if lowest else None
        
        return JsonResponse({
            'request': {
                'id': req.id,
                'title': req.title,
                'description': req.description,
                'status': req.status,
                'created_at': req.created_at.isoformat()
            },
            'quotes': quotes,
            'stats': stats,
            'lowest_quote': lowest_quote
        })
        
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            form = QuotationRequestForm(data, instance=req)
            if form.is_valid():
                req = form.save()
                log_activity(request.user, "Update Quotation Request", f"Updated request: '{req.title}'")
                return JsonResponse({'message': 'Quotation request updated successfully.'})
            else:
                errors = {field: errors[0] for field, errors in form.errors.items()}
                return JsonResponse({'error': 'Validation failed.', 'details': errors}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
            
    elif request.method == 'DELETE':
        title = req.title
        req.delete()
        log_activity(request.user, "Delete Quotation Request", f"Deleted request: '{title}'")
        return JsonResponse({'message': 'Quotation request deleted successfully.'}, status=200)


@login_required
def api_quotations(request):
    """
    Create a vendor proposal response.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        form = QuotationForm(data)
        if form.is_valid():
            quote = form.save()
            log_activity(
                request.user, 
                "Submit Quotation Response", 
                f"Vendor '{quote.vendor.company_name}' submitted quote for '{quote.request.title}' (Ref: {quote.vendor_reference}, Amt: {quote.amount})"
            )
            return JsonResponse({
                'message': 'Quotation submitted successfully.',
                'quote': {'id': quote.id}
            }, status=201)
        else:
            errors = {field: errors[0] for field, errors in form.errors.items()}
            return JsonResponse({'error': 'Validation failed.', 'details': errors}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)


@login_required
def api_quotation_status(request, pk):
    """
    Update quotation approval status.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    quote = get_object_or_404(Quotation, pk=pk)
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        if new_status in ['Approved', 'Rejected', 'Pending']:
            old_status = quote.status
            quote.status = new_status
            quote.save()
            log_activity(
                request.user, 
                "Update Quotation Status", 
                f"Changed status of quote (Ref: {quote.vendor_reference}, Vendor: {quote.vendor.company_name}) from '{old_status}' to '{new_status}'."
            )
            return JsonResponse({'message': f'Quotation status successfully updated to {new_status}.'})
        else:
            return JsonResponse({'error': 'Invalid status choice.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)


@login_required
def api_compare(request, request_pk):
    """
    Fetch side-by-side matrices and aggregate metrics for comparison.
    """
    req = get_object_or_404(QuotationRequest, pk=request_pk)
    quotes_qs = req.quotations.all().order_by('amount')
    
    quotes = []
    for q in quotes_qs:
        quotes.append({
            'id': q.id,
            'vendor_id': q.vendor.id,
            'vendor_company': q.vendor.company_name,
            'vendor_name': q.vendor.name,
            'vendor_reference': q.vendor_reference,
            'amount': str(q.amount),
            'submission_date': q.submission_date.isoformat(),
            'status': q.status
        })
        
    stats_agg = quotes_qs.aggregate(
        min_amount=Min('amount'),
        max_amount=Max('amount'),
        avg_amount=Avg('amount'),
        total_quotes=Count('id')
    )
    
    stats = {
        'min_amount': str(stats_agg['min_amount'] or '0.00'),
        'max_amount': str(stats_agg['max_amount'] or '0.00'),
        'avg_amount': str(stats_agg['avg_amount'] or '0.00'),
        'total_quotes': stats_agg['total_quotes'] or 0
    }
    
    lowest = quotes_qs.first()
    lowest_quote = {
        'id': lowest.id,
        'vendor_company': lowest.vendor.company_name,
        'amount': str(lowest.amount)
    } if lowest else None
    
    return JsonResponse({
        'request': {
            'id': req.id,
            'title': req.title,
            'description': req.description,
            'status': req.status
        },
        'quotes': quotes,
        'stats': stats,
        'lowest_quote': lowest_quote
    })
