# Vendor Management & Quotation System
### Teyzix Core Internship Program - Task ID: FS-2
### Domain: Full-Stack Web Development

A premium, full-stack web-based **Vendor Management & Quotation System** built using Python, Django, SQLite, and custom Vanilla CSS/JS. The application allows organizations to manage vendor directories, request quotation proposals, track vendor bids, compare quotes side-by-side, highlight the most cost-effective bids, and export reports to PDF.

---

## 🌟 Key Features

### 🏢 Vendor Management (CRUD)
- **Add New Vendors**: Captures Name, Company Name, Email, Contact Number, and Business Address.
- **View Vendor Profiles**: Comprehensive details including quotation history and individual statistics (win rates, totals).
- **Edit & Update Vendor Info**: Full editing capabilities.
- **Delete Vendors**: Complete deletion with defensive confirmation dialogs.
- **Dynamic Search & Filter**: Real-time frontend filtering on company names, contact names, and email addresses.

### 📝 Quotation Request Management
- **Create Quotation Requests**: Define title, description, and initial status (Open/Closed).
- **Submit Proposal Responses**: Assign quotation responses on behalf of registered vendors with reference codes, amounts, and dates.
- **Review Proposals**: View all bids submitted for a specific request.
- **Update Proposal Statuses**: Admin can individually Approve or Reject proposals, which logs actions instantly.

### 📊 Quotation Comparison & Matrix
- **Side-by-Side Comparison Matrix**: View all submitted proposals for a request in a ranked order (lowest amount first).
- **Highlights the Most Cost-Effective Bid**: Automatically labels and highlights the lowest bid (rank #1) in green.
- **Statistics Panel**: Displays Total Bids, Minimum (Cost-Effective), Maximum, and Average Bid amounts.
- **PDF / Print Export**: Prints/saves the comparison sheet in clean PDF styling, omitting sidebar/headers.

### 📈 Interactive Dashboard
- **Key Metrics Overview**: Total Vendors, Active Requests, Pending Quotes, Approved Quotes.
- **Recent Activities Log**: Audit logs showing user registration, logins, vendor additions, request creations, and proposal decisions.
- **Quick Overviews**: Tables displaying latest quotation requests and vendor submissions.

### 🎨 Premium UI/UX & Responsive Layout
- **Dark Mode / Light Mode**: Seamless dark mode support using CSS variables, retaining selection via local storage.
- **Modern Typography & Layout**: Built using the Outfit typeface, custom glassmorphism panels, flex grids, and smooth animations.
- **Fully Responsive**: Adapts seamlessly to Desktop, Tablet, and Mobile layouts.

---

## 🛠️ Technology Stack
1. **Backend**: Python 3.13 / Django 6.0.6 (clean, structured, and modular Model-View-Template pattern)
2. **Database**: SQLite (built-in, self-contained for easy shipping and ZIP compliance)
3. **Frontend**: HTML5, Vanilla CSS3 (custom CSS variables, responsive design, `@media print`), Vanilla JavaScript (theme management, alert timeouts, live client search/filters)
4. **Icons**: Inline SVG Icons (vector icons with zero external dependencies)

---

## 📁 Project Directory Structure
```
Task-2/
 ├── manage.py               # Django CLI utility
 ├── requirements.txt        # Backend dependencies
 ├── db.sqlite3              # SQLite Database file
 ├── run.bat                 # Automatic start script (Windows)
 ├── create_demo_data.py     # Database seeder (Adds default user & mock data)
 ├── README.md               # Technical Markdown documentation
 ├── README.txt              # Task submission text instructions
 ├── project/                # Django project settings
 │    ├── settings.py
 │    ├── urls.py
 │    └── wsgi.py / asgi.py
 └── core/                   # Application folder
      ├── models.py          # Database models (Vendor, QuotationRequest, etc.)
      ├── views.py           # Backend controller logic
      ├── urls.py            # Route mappings
      ├── forms.py           # Custom form definitions and validation logic
      ├── static/            # Static assets
      │    ├── css/
      │    │    └── style.css   # Main stylesheet (includes dark mode / print CSS)
      │    └── js/
      │         └── script.js    # Client-side actions
      └── templates/         # HTML templates
           └── core/
                ├── base.html
                ├── login.html
                ├── register.html
                ├── dashboard.html
                ├── vendors.html
                ├── vendor_form.html
                ├── vendor_detail.html
                ├── quotation_requests.html
                ├── quotation_request_detail.html
                ├── quotation_form.html
                └── compare.html
```

---

## 🗄️ Database Design (SQLite)

```
                       +-------------------------+
                       |         Vendor          |
                       +-------------------------+
                       | id (PK)                 |
                       | name (CharField)        |
                       | company_name (CharField) |
                       | email (EmailField)      |
                       | contact_number (CharField)|
                       | business_address (Text) |
                       | created_at (DateTime)   |
                       +-------------------------+
                                    |
                                    | 1
                                    |
                                    | N
                       +-------------------------+          +-------------------------+
                       |        Quotation        |          |    Quotation Request    |
                       +-------------------------+          +-------------------------+
                       | id (PK)                 |          | id (PK)                 |
                       | request_id (FK) --------|--------> | title (CharField)       |
                       | vendor_id (FK) ---------|          | description (Text)      |
                       | vendor_ref (CharField)  |          | status (CharField)      |
                       | amount (Decimal)        |          | created_at (DateTime)   |
                       | submission_date (Date)  |          +-------------------------+
                       | status (CharField)      |
                       | created_at (DateTime)   |
                       +-------------------------+

                       +-------------------------+
                       |       ActivityLog       |
                       +-------------------------+
                       | id (PK)                 |
                       | user_id (FK -> User)    |
                       | action (CharField)      |
                       | details (TextField)     |
                       | timestamp (DateTime)    |
                       +-------------------------+
```

---

## 🚀 How to Run the Project

### Method 1: Quick Start (Windows)
Double-click the **`run.bat`** file in the project folder. 
This script will:
1. Validate Python is installed.
2. Install dependencies listed in `requirements.txt`.
3. Apply database migrations.
4. Run `create_demo_data.py` to create the admin account and seed realistic sample records.
5. Start the Django development server at `http://127.0.0.1:8000/`.

### Method 2: Manual Start (Command Line - OS Independent)
If you prefer running command line tools manually, perform the following steps in the project root directory:

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Apply Migrations**:
   ```bash
   python manage.py migrate
   ```
3. **Seed Database and Create Admin Account**:
   ```bash
   python create_demo_data.py
   ```
4. **Start the Web Server**:
   ```bash
   python manage.py runserver
   ```
5. **Access Application**:
   Open your browser and navigate to `http://127.0.0.1:8000/`.

---

## 🔑 Default Authentication Credentials
The database seeder automatically creates an administrator account:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@teyzix.com`

*Note: You can also register a new account on the application startup registration page.*
