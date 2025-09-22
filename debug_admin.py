import requests
import json

base_url = "https://trade-portal-dev.preview.emergentagent.com/api"

# Register a new user
test_data = {
    "name": "Debug Admin User",
    "email": "debug_admin@test.com",
    "password": "DebugPass123!"
}

print("Registering user...")
response = requests.post(f"{base_url}/auth/register", json=test_data)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 200:
    data = response.json()
    token = data['access_token']
    user = data['user']
    
    print(f"\nUser is admin: {user['is_admin']}")
    
    if user['is_admin']:
        print("\nTesting admin endpoints...")
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test admin stats
        stats_response = requests.get(f"{base_url}/admin/stats", headers=headers)
        print(f"Admin stats status: {stats_response.status_code}")
        
        # Test admin users
        users_response = requests.get(f"{base_url}/admin/users", headers=headers)
        print(f"Admin users status: {users_response.status_code}")
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"Total users in system: {len(users)}")