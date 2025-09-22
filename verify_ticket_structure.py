import requests
import json
from datetime import datetime
import random
import string

def generate_test_email():
    timestamp = datetime.now().strftime('%H%M%S')
    random_str = ''.join(random.choices(string.ascii_lowercase, k=4))
    return f"structure_test_{timestamp}_{random_str}@bitsecure.com"

base_url = "https://trade-portal-dev.preview.emergentagent.com/api"

print("🔍 Verifying Support Ticket Structure Against Expected Format")
print("=" * 60)

# Expected structure from the review request
expected_structure = {
    "id": "uuid",
    "user_id": "string", 
    "user_name": "string",
    "user_email": "string",
    "subject": "string",
    "message": "string", 
    "priority": "medium",
    "status": "open",
    "created_at": "datetime"
}

print("Expected structure:")
print(json.dumps(expected_structure, indent=2))

# Create user and ticket
user_data = {
    "name": "Structure Test User",
    "email": generate_test_email(),
    "password": "StructureTest123!"
}

print("\n1. Creating test user...")
response = requests.post(f"{base_url}/auth/register", json=user_data)
if response.status_code != 200:
    print(f"❌ Failed to create user: {response.status_code}")
    exit(1)

token = response.json()['access_token']
user = response.json()['user']
print(f"✅ User created: {user['name']}")

# Create support ticket with exact test data
print("\n2. Creating support ticket...")
ticket_data = {
    "subject": "Test Support",
    "message": "Testing support system",
    "priority": "medium"
}

headers = {'Authorization': f'Bearer {token}'}
response = requests.post(f"{base_url}/support/tickets", json=ticket_data, headers=headers)

if response.status_code != 200:
    print(f"❌ Failed to create ticket: {response.status_code}")
    exit(1)

ticket_id = response.json()['ticket_id']
print(f"✅ Ticket created: {ticket_id}")

# Get the ticket back
print("\n3. Retrieving ticket to verify structure...")
response = requests.get(f"{base_url}/support/tickets", headers=headers)

if response.status_code != 200:
    print(f"❌ Failed to retrieve tickets: {response.status_code}")
    exit(1)

tickets = response.json()
if not tickets:
    print("❌ No tickets found")
    exit(1)

ticket = tickets[0]
print("\nActual ticket structure:")
print(json.dumps(ticket, indent=2, default=str))

# Verify structure matches expected
print("\n4. Structure verification:")
print("=" * 40)

all_match = True
for field, expected_type in expected_structure.items():
    if field in ticket:
        actual_value = ticket[field]
        
        # Type checking
        if field == "id" and isinstance(actual_value, str) and len(actual_value) == 36:
            print(f"✅ {field}: UUID format correct")
        elif field in ["user_id", "user_name", "user_email", "subject", "message"] and isinstance(actual_value, str):
            print(f"✅ {field}: String type correct - '{actual_value}'")
        elif field == "priority" and actual_value == "medium":
            print(f"✅ {field}: Correct value - '{actual_value}'")
        elif field == "status" and actual_value == "open":
            print(f"✅ {field}: Correct value - '{actual_value}'")
        elif field == "created_at" and isinstance(actual_value, str):
            print(f"✅ {field}: Datetime format - '{actual_value}'")
        else:
            print(f"⚠️  {field}: Value '{actual_value}' (type: {type(actual_value).__name__})")
    else:
        print(f"❌ {field}: MISSING")
        all_match = False

# Check for extra fields
extra_fields = set(ticket.keys()) - set(expected_structure.keys())
if extra_fields:
    print(f"\n📋 Additional fields present: {list(extra_fields)}")

print("\n" + "=" * 60)
if all_match:
    print("✅ STRUCTURE VERIFICATION PASSED")
    print("   All expected fields present with correct types and values")
else:
    print("❌ STRUCTURE VERIFICATION FAILED")
    print("   Some expected fields missing or incorrect")

# Verify specific test values
print(f"\n🎯 Test Data Verification:")
print(f"   Subject: '{ticket['subject']}' == 'Test Support' ✅" if ticket['subject'] == 'Test Support' else f"   Subject: MISMATCH ❌")
print(f"   Message: '{ticket['message']}' == 'Testing support system' ✅" if ticket['message'] == 'Testing support system' else f"   Message: MISMATCH ❌")
print(f"   Priority: '{ticket['priority']}' == 'medium' ✅" if ticket['priority'] == 'medium' else f"   Priority: MISMATCH ❌")
print(f"   Status: '{ticket['status']}' == 'open' ✅" if ticket['status'] == 'open' else f"   Status: MISMATCH ❌")