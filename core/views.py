from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Min, Max, Avg, Count, Sum, Q
from django.utils import timezone
from .models import Vendor, QuotationRequest, Quotation, ActivityLog
from .forms import VendorForm, QuotationRequestForm, QuotationForm

# Helper function to log activities
def log_activity(user, action, details):
    ActivityLog.objects.create(user=user, action=action, details=details)

# --- Authentication Views ---

def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            log_activity(user, "User Registration", f"User {user.username} registered and logged in.")
            messages.success(request, f"Welcome, {user.username}! Your account has been created.")
            return redirect('dashboard')
        else:
            messages.error(request, "Registration failed. Please correct the errors below.")
    else:
        form = UserCreationForm()
    return render(request, 'core/register.html', {'form': form})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                log_activity(user, "User Login", f"User {user.username} logged in successfully.")
                messages.success(request, f"Welcome back, {user.username}!")
                return redirect('dashboard')
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()
    return render(request, 'core/login.html', {'form': form})

def logout_view(request):
    if request.user.is_authenticated:
        username = request.user.username
        user = request.user
        logout(request)
        # Log activity requires user, since they are logged out, we can pass None or log before logout
        log_activity(user, "User Logout", f"User {username} logged out.")
        messages.info(request, "You have been logged out successfully.")
    return redirect('login')


# --- Dashboard View ---

@login_required
def dashboard_view(request):
    total_vendors = Vendor.objects.count()
    active_requests = QuotationRequest.objects.filter(status='Open').count()
    pending_quotations = Quotation.objects.filter(status='Pending').count()
    approved_quotations = Quotation.objects.filter(status='Approved').count()
    
    recent_activities = ActivityLog.objects.all()[:8]
    
    # Quick statistics for charts/visualizations in dashboard
    latest_requests = QuotationRequest.objects.all()[:5]
    latest_quotes = Quotation.objects.all().order_by('-created_at')[:5]

    context = {
        'total_vendors': total_vendors,
        'active_requests': active_requests,
        'pending_quotations': pending_quotations,
        'approved_quotations': approved_quotations,
        'recent_activities': recent_activities,
        'latest_requests': latest_requests,
        'latest_quotes': latest_quotes,
    }
    return render(request, 'core/dashboard.html', context)


# --- Vendor Management ---

@login_required
def vendor_list_view(request):
    vendors = Vendor.objects.all()
    # Live search/filtering is handled via HTML5 + JS on client, but we support URL search parameters too
    query = request.GET.get('search', '')
    if query:
        vendors = vendors.filter(
            Q(name__icontains=query) |
            Q(company_name__icontains=query) |
            Q(email__icontains=query)
        )
    return render(request, 'core/vendors.html', {'vendors': vendors, 'query': query})

@login_required
def vendor_detail_view(request, pk):
    vendor = get_object_or_404(Vendor, pk=pk)
    # Get all quotations submitted by this vendor
    quotations = vendor.quotations.all().order_by('-created_at')
    
    # Calculate vendor statistics
    total_submitted = quotations.count()
    approved_count = quotations.filter(status='Approved').count()
    total_amount = quotations.filter(status='Approved').aggregate(sum_amount=Sum('amount'))['sum_amount'] or 0.00
    
    context = {
        'vendor': vendor,
        'quotations': quotations,
        'total_submitted': total_submitted,
        'approved_count': approved_count,
        'total_amount': total_amount,
    }
    return render(request, 'core/vendor_detail.html', context)

@login_required
def vendor_create_view(request):
    if request.method == 'POST':
        form = VendorForm(request.POST)
        if form.is_valid():
            vendor = form.save()
            log_activity(request.user, "Create Vendor", f"Added new vendor: {vendor.company_name} ({vendor.name})")
            messages.success(request, f"Vendor '{vendor.company_name}' successfully added.")
            return redirect('vendor_list')
        else:
            messages.error(request, "Failed to create vendor. Please correct errors below.")
    else:
        form = VendorForm()
    return render(request, 'core/vendor_form.html', {'form': form, 'title': 'Add New Vendor'})

@login_required
def vendor_update_view(request, pk):
    vendor = get_object_or_404(Vendor, pk=pk)
    if request.method == 'POST':
        form = VendorForm(request.POST, instance=vendor)
        if form.is_valid():
            vendor = form.save()
            log_activity(request.user, "Update Vendor", f"Updated vendor details for: {vendor.company_name}")
            messages.success(request, f"Vendor '{vendor.company_name}' successfully updated.")
            return redirect('vendor_detail', pk=vendor.pk)
        else:
            messages.error(request, "Failed to update vendor. Please correct errors below.")
    else:
        form = VendorForm(instance=vendor)
    return render(request, 'core/vendor_form.html', {'form': form, 'title': 'Edit Vendor Details', 'vendor': vendor})

@login_required
def vendor_delete_view(request, pk):
    vendor = get_object_or_404(Vendor, pk=pk)
    if request.method == 'POST':
        company_name = vendor.company_name
        vendor.delete()
        log_activity(request.user, "Delete Vendor", f"Deleted vendor: {company_name}")
        messages.success(request, f"Vendor '{company_name}' was successfully deleted.")
        return redirect('vendor_list')
    return redirect('vendor_detail', pk=pk)


# --- Quotation Request Management ---

@login_required
def quotation_request_list_view(request):
    requests = QuotationRequest.objects.all()
    return render(request, 'core/quotation_requests.html', {'requests': requests})

@login_required
def quotation_request_detail_view(request, pk):
    req = get_object_or_404(QuotationRequest, pk=pk)
    # Get all responses submitted for this request
    quotes = req.quotations.all().order_by('amount') # lowest amount first
    
    # Calculate some summary figures
    stats = quotes.aggregate(
        min_amount=Min('amount'),
        max_amount=Max('amount'),
        avg_amount=Avg('amount'),
        total_quotes=Count('id')
    )
    
    # Highlight the lowest bid (if any)
    lowest_quote = quotes.first() if quotes.exists() else None
    
    context = {
        'request_detail': req, # named request_detail to avoid conflict with standard template request object
        'quotes': quotes,
        'stats': stats,
        'lowest_quote': lowest_quote,
    }
    return render(request, 'core/quotation_request_detail.html', context)

@login_required
def quotation_request_create_view(request):
    if request.method == 'POST':
        form = QuotationRequestForm(request.POST)
        if form.is_valid():
            req = form.save()
            log_activity(request.user, "Create Quotation Request", f"Created request: '{req.title}'")
            messages.success(request, f"Quotation request '{req.title}' successfully created.")
            return redirect('quotation_request_list')
        else:
            messages.error(request, "Failed to create quotation request.")
    else:
        form = QuotationRequestForm()
    return render(request, 'core/quotation_request_form.html', {'form': form, 'title': 'Create Quotation Request'})

@login_required
def quotation_request_update_view(request, pk):
    req = get_object_or_404(QuotationRequest, pk=pk)
    if request.method == 'POST':
        form = QuotationRequestForm(request.POST, instance=req)
        if form.is_valid():
            req = form.save()
            log_activity(request.user, "Update Quotation Request", f"Updated request: '{req.title}'")
            messages.success(request, f"Quotation request '{req.title}' successfully updated.")
            return redirect('quotation_request_detail', pk=req.pk)
        else:
            messages.error(request, "Failed to update quotation request.")
    else:
        form = QuotationRequestForm(instance=req)
    return render(request, 'core/quotation_request_form.html', {'form': form, 'title': 'Edit Quotation Request', 'request_detail': req})

@login_required
def quotation_request_delete_view(request, pk):
    req = get_object_or_404(QuotationRequest, pk=pk)
    if request.method == 'POST':
        title = req.title
        req.delete()
        log_activity(request.user, "Delete Quotation Request", f"Deleted request: '{title}'")
        messages.success(request, f"Quotation request '{title}' successfully deleted.")
        return redirect('quotation_request_list')
    return redirect('quotation_request_detail', pk=pk)


# --- Quotation Responses (Proposals) ---

@login_required
def quotation_create_view(request):
    request_id = request.GET.get('request_id')
    preselected_request = get_object_or_404(QuotationRequest, pk=request_id) if request_id else None
    
    if request.method == 'POST':
        form = QuotationForm(request.POST)
        if form.is_valid():
            quote = form.save()
            log_activity(
                request.user, 
                "Submit Quotation Response", 
                f"Vendor '{quote.vendor.company_name}' submitted quote for '{quote.request.title}' (Ref: {quote.vendor_reference}, Amt: {quote.amount})"
            )
            messages.success(request, f"Quotation response from '{quote.vendor.company_name}' submitted successfully.")
            return redirect('quotation_request_detail', pk=quote.request.pk)
        else:
            messages.error(request, "Failed to submit quotation response. Please check errors.")
    else:
        # Pass initial values for pre-selection
        initial = {}
        if preselected_request:
            initial['request'] = preselected_request
        form = QuotationForm(initial=initial)
        
    return render(request, 'core/quotation_form.html', {
        'form': form, 
        'preselected_request': preselected_request,
        'title': 'Submit Quotation Response'
    })

@login_required
def quotation_status_update_view(request, pk):
    quote = get_object_or_404(Quotation, pk=pk)
    new_status = request.POST.get('status')
    
    if new_status in ['Approved', 'Rejected', 'Pending']:
        old_status = quote.status
        quote.status = new_status
        quote.save()
        
        # If a quote is approved, we could optionally mark others as rejected or keep them pending.
        # Let's keep it simple: just update the status of this quote.
        log_activity(
            request.user, 
            "Update Quotation Status", 
            f"Changed status of quote (Ref: {quote.vendor_reference}, Vendor: {quote.vendor.company_name}) from '{old_status}' to '{new_status}'."
        )
        messages.success(request, f"Quotation status updated to '{new_status}'.")
    else:
        messages.error(request, "Invalid status update request.")
        
    return redirect('quotation_request_detail', pk=quote.request.pk)


# --- Quotation Comparison ---

@login_required
def compare_view(request, request_pk):
    req = get_object_or_404(QuotationRequest, pk=request_pk)
    quotes = req.quotations.all().order_by('amount')
    
    # Calculate stats
    stats = quotes.aggregate(
        min_amount=Min('amount'),
        max_amount=Max('amount'),
        avg_amount=Avg('amount'),
        total_quotes=Count('id')
    )
    
    # Highlight the lowest bid
    lowest_quote = quotes.first() if quotes.exists() else None
    
    context = {
        'request_detail': req,
        'quotes': quotes,
        'stats': stats,
        'lowest_quote': lowest_quote,
    }
    return render(request, 'core/compare.html', context)

