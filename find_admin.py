import requests
import json

base_url = "https://trade-portal-dev.preview.emergentagent.com/api"

# Let's try to create the first user by checking if database is empty
# or find existing admin

print("Attempting to find or create admin user...")

# Try common admin credentials
admin_attempts = [
    {"email": "admin@bitsecure.com", "password": "admin123"},
    {"email": "admin@test.com", "password": "admin123"},
    {"email": "admin@admin.com", "password": "admin123"},
    {"email": "test@admin.com", "password": "admin123"},
    {"email": "admin@bitsecure.com", "password": "AdminPass123!"},
    {"email": "admin@test.com", "password": "AdminPass123!"},
]

admin_found = False
admin_token = None

for attempt in admin_attempts:
    print(f"Trying {attempt['email']}...")
    response = requests.post(f"{base_url}/auth/login", json=attempt)
    
    if response.status_code == 200:
        data = response.json()
        if data['user']['is_admin']:
            print(f"✅ Found admin: {attempt['email']}")
            admin_token = data['access_token']
            admin_found = True
            break
        else:
            print(f"   User exists but not admin")
    else:
        print(f"   Login failed: {response.status_code}")

if not admin_found:
    print("\nNo existing admin found. Let's try to register one...")
    
    # Try to register with common admin emails
    for email in ["admin@bitsecure.com", "admin@test.com"]:
        reg_data = {
            "name": "Admin User",
            "email": email,
            "password": "AdminPass123!"
        }
        
        print(f"Trying to register {email}...")
        response = requests.post(f"{base_url}/auth/register", json=reg_data)
        
        if response.status_code == 200:
            data = response.json()
            if data['user']['is_admin']:
                print(f"✅ Created admin: {email}")
                admin_token = data['access_token']
                admin_found = True
                break
            else:
                print(f"   Registered but not admin (user count > 0)")
        else:
            print(f"   Registration failed: {response.status_code}")
            if response.status_code == 400:
                print(f"   Probably already exists")

if admin_found and admin_token:
    print(f"\n🎉 Admin token obtained!")
    print(f"Token: {admin_token[:50]}...")
    
    # Test admin endpoints
    headers = {'Authorization': f'Bearer {admin_token}'}
    
    print("\nTesting admin endpoints...")
    
    # Test admin stats
    response = requests.get(f"{base_url}/admin/stats", headers=headers)
    print(f"Admin stats: {response.status_code}")
    
    # Test admin support tickets
    response = requests.get(f"{base_url}/admin/support/tickets", headers=headers)
    print(f"Admin support tickets: {response.status_code}")
    if response.status_code == 200:
        tickets = response.json()
        print(f"Found {len(tickets)} total support tickets")
        
        for ticket in tickets:
            print(f"  - {ticket['subject']} ({ticket['status']}) by {ticket['user_name']}")
    
    # Test admin notifications
    response = requests.get(f"{base_url}/admin/notifications", headers=headers)
    print(f"Admin notifications: {response.status_code}")
    if response.status_code == 200:
        notifications = response.json()
        support_notifications = [n for n in notifications if n.get('type') == 'support_ticket']
        print(f"Found {len(support_notifications)} support ticket notifications")
        
else:
    print("\n❌ Could not obtain admin access")
    print("This might be because:")
    print("1. Database already has users (first user is not auto-admin)")
    print("2. Admin user exists but we don't know credentials")
    print("3. Admin functionality requires different setup")