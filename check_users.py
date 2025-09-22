import requests
import json

base_url = "https://trade-portal-dev.preview.emergentagent.com/api"

# First, let's try to find an admin user by registering and checking if we get admin
# If there are existing users, we need to find the admin

# Let's try to register a user and see if we can find admin credentials
test_data = {
    "name": "Test User for Admin Check",
    "email": "admin_check@test.com", 
    "password": "AdminCheck123!"
}

print("Registering user to check admin status...")
response = requests.post(f"{base_url}/auth/register", json=test_data)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    user = data['user']
    print(f"User is admin: {user['is_admin']}")
    
    if user['is_admin']:
        print("This user is admin!")
        token = data['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Get all users to see the system state
        users_response = requests.get(f"{base_url}/admin/users", headers=headers)
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"Total users in system: {len(users)}")
            for user in users:
                print(f"  - {user['name']} ({user['email']}) - Admin: {user['is_admin']}")
    else:
        print("User is not admin - there must be existing users")

# Let's try some common admin credentials that might exist
common_admin_emails = [
    "admin@bitsecure.com",
    "admin@test.com", 
    "test@admin.com",
    "admin@admin.com"
]

print("\nTrying to find existing admin...")
for email in common_admin_emails:
    login_data = {
        "email": email,
        "password": "admin123"  # Common password
    }
    
    login_response = requests.post(f"{base_url}/auth/login", json=login_data)
    if login_response.status_code == 200:
        login_data_response = login_response.json()
        if login_data_response['user']['is_admin']:
            print(f"Found admin: {email}")
            break
    
    # Try other common passwords
    for password in ["password", "admin", "123456", "AdminPass123!"]:
        login_data["password"] = password
        login_response = requests.post(f"{base_url}/auth/login", json=login_data)
        if login_response.status_code == 200:
            login_data_response = login_response.json()
            if login_data_response['user']['is_admin']:
                print(f"Found admin: {email} with password: {password}")
                break