import requests
import json
import random
import string
from datetime import datetime

class SupportTicketTester:
    def __init__(self):
        self.base_url = "https://trade-portal-dev.preview.emergentagent.com/api"
        self.user_token = None
        self.admin_token = None
        self.ticket_id = None
        self.tests_passed = 0
        self.tests_failed = 0

    def generate_test_email(self):
        """Generate unique test email"""
        timestamp = datetime.now().strftime('%H%M%S')
        random_str = ''.join(random.choices(string.ascii_lowercase, k=4))
        return f"support_test_{timestamp}_{random_str}@bitsecure.com"

    def log_result(self, test_name, success, details=""):
        if success:
            print(f"✅ {test_name}")
            self.tests_passed += 1
        else:
            print(f"❌ {test_name}: {details}")
            self.tests_failed += 1

    def setup_user(self):
        """Create a test user"""
        print("🔧 Setting up test user...")
        
        user_data = {
            "name": "Support Test User",
            "email": self.generate_test_email(),
            "password": "SupportTest123!"
        }
        
        response = requests.post(f"{self.base_url}/auth/register", json=user_data)
        
        if response.status_code == 200:
            data = response.json()
            self.user_token = data['access_token']
            user = data['user']
            
            self.log_result("User Registration", True)
            
            # Check if this user is admin (first user)
            if user['is_admin']:
                self.admin_token = self.user_token
                self.log_result("Admin User Available", True)
            else:
                self.log_result("Regular User Created", True)
                
            return True
        else:
            self.log_result("User Registration", False, f"Status: {response.status_code}")
            return False

    def test_create_support_ticket(self):
        """Test creating a support ticket"""
        print("\n🎫 Testing Support Ticket Creation...")
        
        if not self.user_token:
            self.log_result("Create Support Ticket", False, "No user token")
            return False
        
        ticket_data = {
            "subject": "Test Support",
            "message": "Testing support system",
            "priority": "medium"
        }
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        response = requests.post(f"{self.base_url}/support/tickets", json=ticket_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if 'ticket_id' in data:
                self.ticket_id = data['ticket_id']
                self.log_result("Create Support Ticket", True)
                print(f"   Ticket ID: {self.ticket_id}")
                return True
            else:
                self.log_result("Create Support Ticket", False, "No ticket_id in response")
                return False
        else:
            self.log_result("Create Support Ticket", False, f"Status: {response.status_code}")
            return False

    def test_get_user_tickets(self):
        """Test getting user's support tickets"""
        print("\n📋 Testing Get User Support Tickets...")
        
        if not self.user_token:
            self.log_result("Get User Support Tickets", False, "No user token")
            return False
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        response = requests.get(f"{self.base_url}/support/tickets", headers=headers)
        
        if response.status_code == 200:
            tickets = response.json()
            if isinstance(tickets, list):
                self.log_result("Get User Support Tickets", True)
                print(f"   Found {len(tickets)} tickets")
                
                # Verify our ticket is in the list
                if self.ticket_id and any(t['id'] == self.ticket_id for t in tickets):
                    self.log_result("Created Ticket Found in List", True)
                    
                    # Check ticket structure
                    ticket = next(t for t in tickets if t['id'] == self.ticket_id)
                    expected_fields = ['id', 'user_id', 'user_name', 'user_email', 'subject', 'message', 'priority', 'status', 'created_at']
                    missing_fields = [field for field in expected_fields if field not in ticket]
                    
                    if not missing_fields:
                        self.log_result("Ticket Structure Valid", True)
                        
                        # Verify ticket content
                        if (ticket['subject'] == "Test Support" and 
                            ticket['message'] == "Testing support system" and
                            ticket['priority'] == "medium" and
                            ticket['status'] == "open"):
                            self.log_result("Ticket Content Correct", True)
                        else:
                            self.log_result("Ticket Content Correct", False, "Content mismatch")
                    else:
                        self.log_result("Ticket Structure Valid", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Created Ticket Found in List", False, "Ticket not found")
                
                return True
            else:
                self.log_result("Get User Support Tickets", False, "Response is not a list")
                return False
        else:
            self.log_result("Get User Support Tickets", False, f"Status: {response.status_code}")
            return False

    def test_admin_endpoints(self):
        """Test admin support ticket endpoints if admin token available"""
        if not self.admin_token:
            print("\n⚠️  Admin tests skipped - no admin token available")
            return True
        
        print("\n👑 Testing Admin Support Endpoints...")
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test get all tickets
        response = requests.get(f"{self.base_url}/admin/support/tickets", headers=headers)
        if response.status_code == 200:
            tickets = response.json()
            self.log_result("Admin Get All Tickets", True)
            print(f"   Admin can see {len(tickets)} total tickets")
            
            # Verify admin can see our ticket
            if self.ticket_id and any(t['id'] == self.ticket_id for t in tickets):
                self.log_result("Admin Can See User Ticket", True)
            else:
                self.log_result("Admin Can See User Ticket", False, "User ticket not visible to admin")
        else:
            self.log_result("Admin Get All Tickets", False, f"Status: {response.status_code}")
        
        # Test update ticket status
        if self.ticket_id:
            response = requests.put(f"{self.base_url}/admin/support/tickets/{self.ticket_id}/status?status=in_progress", headers=headers)
            if response.status_code == 200:
                self.log_result("Admin Update Ticket Status", True)
            else:
                self.log_result("Admin Update Ticket Status", False, f"Status: {response.status_code}")

    def test_notifications(self):
        """Test that notifications were created"""
        if not self.admin_token:
            print("\n⚠️  Notification tests skipped - no admin token available")
            return True
        
        print("\n🔔 Testing Support Notifications...")
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        response = requests.get(f"{self.base_url}/admin/notifications", headers=headers)
        
        if response.status_code == 200:
            notifications = response.json()
            support_notifications = [n for n in notifications if n.get('type') == 'support_ticket']
            
            if support_notifications:
                self.log_result("Support Ticket Notification Created", True)
                print(f"   Found {len(support_notifications)} support notifications")
            else:
                self.log_result("Support Ticket Notification Created", False, "No support notifications found")
        else:
            self.log_result("Check Notifications", False, f"Status: {response.status_code}")

    def test_unauthorized_access(self):
        """Test unauthorized access to support endpoints"""
        print("\n🚫 Testing Unauthorized Access...")
        
        # Test without token
        response = requests.post(f"{self.base_url}/support/tickets", json={"subject": "Test", "message": "Test"})
        if response.status_code == 403:
            self.log_result("Unauthorized Ticket Creation Blocked", True)
        else:
            self.log_result("Unauthorized Ticket Creation Blocked", False, f"Expected 403, got {response.status_code}")
        
        response = requests.get(f"{self.base_url}/support/tickets")
        if response.status_code == 403:
            self.log_result("Unauthorized Ticket Access Blocked", True)
        else:
            self.log_result("Unauthorized Ticket Access Blocked", False, f"Expected 403, got {response.status_code}")

    def run_all_tests(self):
        """Run all support ticket tests"""
        print("🚀 Starting Support Ticket System Tests")
        print("=" * 60)
        
        if not self.setup_user():
            print("❌ Failed to setup test user - aborting tests")
            return False
        
        self.test_create_support_ticket()
        self.test_get_user_tickets()
        self.test_admin_endpoints()
        self.test_notifications()
        self.test_unauthorized_access()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 SUPPORT TICKET TEST SUMMARY")
        print("=" * 60)
        total_tests = self.tests_passed + self.tests_failed
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_failed}")
        if total_tests > 0:
            print(f"Success Rate: {(self.tests_passed/total_tests)*100:.1f}%")
        
        return self.tests_failed == 0

if __name__ == "__main__":
    tester = SupportTicketTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)