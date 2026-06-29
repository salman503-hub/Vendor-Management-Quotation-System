=======================================================================
           VENDOR MANAGEMENT & QUOTATION SYSTEM (TASK ID: FS-2)
                      TEYZIX CORE INTERNSHIP PROGRAM
           INTERN REFERENCE ID: TC-INT-18991230-761
=======================================================================

1. SHORT DESCRIPTION
--------------------
This is a full-stack web-based Vendor Management & Quotation System designed 
to help organizations manage vendor directories, request quotation proposals, 
track vendor bids, compare quotes side-by-side (highlighting the most cost-
effective bids), view dashboard metrics, audit activities, and export print-
ready quotation summary sheets to PDF.

Built using Django (Python), SQLite (database), and custom CSS and JavaScript 
for styling and frontend interactions (like Dark Mode, live search/filtering).

2. KEY FEATURES
---------------
- Vendor CRUD (Create, Read, Update, Delete) & profile metrics.
- Quotation Request creation & tracking.
- Proposal Response submission & status updates (Approve/Reject).
- Comparison dashboard (ranked side-by-side with cost-effective highlight).
- Responsive UI (Mobile / Desktop) with theme toggle (Dark / Light).
- Activity Log audit trail.
- Print-friendly layout for PDF exports.

3. DEFAULT LOGIN CREDENTIALS
----------------------------
An administrator account is pre-created by the seeder script:
- Username: admin
- Password: admin123
- Email: admin@teyzix.com

4. RUNNING INSTRUCTIONS
-----------------------
Make sure Python 3.x is installed on your computer.

METHOD A: Quick Start (Windows)
Double-click the "run.bat" file in this folder. It will install packages,
migrate the database, load demo data, and launch the server.

METHOD B: Manual Launch (Command Line)
1. Open terminal inside the project root folder.
2. Install packages:
   pip install -r requirements.txt
3. Apply database schemas:
   python manage.py migrate
4. Seed demo users & records:
   python create_demo_data.py
5. Start development server:
   python manage.py runserver
6. Open browser and visit:
   http://127.0.0.1:8000/

5. LINKEDIN POST / DEMO LINK
----------------------------
Aap niche diye gaye link par click kar ke demo ya post dekh sakte hain:
https://www.linkedin.com/posts/muhammad-suleman-9ab191373_teyzixcore-internship-fullstackdevelopment-ugcPost-7477434980860698625-1V8I
=======================================================================
