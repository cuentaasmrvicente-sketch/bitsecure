import requests
import json
import random
import string
from datetime import datetime

class ComprehensiveSupportTest:
    def __init__(self):
        self.base_url = "https://trade-portal-dev.preview.emergentagent.com/api"
        self.user_token = None
        self.admin_token = None
        self.ticket_id = None
        self.results = []

    def log_test(self, name, success, details="", critical=False):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        priority = "🔴 CRITICAL" if critical and not success else ""
        
        print(f"{status} {priority} {name}")
        if details:
            print(f"    {details}")
        
        self.results.append({
            "name": name,
            "success": success,
            "details": details,
            "critical": critical
        })

    def generate_test_email(self):
        """Generate unique test email"""
        timestamp = datetime.now().strftime('%H%M%S')
        random_str = ''.join(random.choices(string.ascii_lowercase, k=4))
        return f"support_test_{timestamp}_{random_str}@bitsecure.com"

    def setup_test_user(self):
        """Create test user and try to get admin access"""
        print("🔧 Setting up test environment...")
        
        # Create regular user
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
            
            self.log_test("User Registration", True, f"Created user: {user['name']}")
            
            # Check if this user is admin (unlikely but possible)
            if user['is_admin']:
                self.admin_token = self.user_token
                self.log_test("Admin Access Available", True, "First user is admin")
            else:
                self.log_test("Regular User Created", True, "User is not admin (expected)")
                
            return True
        else:
            self.log_test("User Registration", False, f"Status: {response.status_code}", critical=True)
            return False

    def test_support_ticket_creation(self):
        """Test creating support tickets with different priorities"""
        print("\n🎫 Testing Support Ticket Creation...")
        
        if not self.user_token:
            self.log_test("Support Ticket Creation", False, "No user token available", critical=True)
            return False
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # Test with the exact data from the request
        ticket_data = {
            "subject": "Test Support",
            "message": "Testing support system",
            "priority": "medium"
        }
        
        response = requests.post(f"{self.base_url}/support/tickets", json=ticket_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check response structure
            required_fields = ['ticket_id', 'message']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                self.ticket_id = data['ticket_id']
                self.log_test("Support Ticket Creation", True, f"Ticket ID: {self.ticket_id}")
                
                # Verify response message
                if 'exitosamente' in data['message'] or 'successfully' in data['message']:
                    self.log_test("Success Message Format", True)
                else:
                    self.log_test("Success Message Format", False, f"Unexpected message: {data['message']}")
                
                return True
            else:
                self.log_test("Support Ticket Response Structure", False, f"Missing fields: {missing_fields}", critical=True)
                return False
        else:
            self.log_test("Support Ticket Creation", False, f"Status: {response.status_code}", critical=True)
            try:
                error_data = response.json()
                print(f"    Error: {error_data}")
            except:
                print(f"    Raw response: {response.text}")
            return False

    def test_get_user_tickets(self):
        """Test retrieving user's support tickets"""
        print("\n📋 Testing User Ticket Retrieval...")
        
        if not self.user_token:
            self.log_test("Get User Tickets", False, "No user token available", critical=True)
            return False
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        response = requests.get(f"{self.base_url}/support/tickets", headers=headers)
        
        if response.status_code == 200:
            tickets = response.json()
            
            if isinstance(tickets, list):
                self.log_test("User Tickets List Format", True, f"Retrieved {len(tickets)} tickets")
                
                if tickets:
                    # Check ticket structure
                    ticket = tickets[0]
                    expected_fields = ['id', 'user_id', 'user_name', 'user_email', 'subject', 'message', 'priority', 'status', 'created_at']
                    missing_fields = [field for field in expected_fields if field not in ticket]
                    
                    if not missing_fields:
                        self.log_test("Ticket Structure", True, "All required fields present")
                        
                        # Verify our created ticket is present
                        if self.ticket_id and any(t['id'] == self.ticket_id for t in tickets):
                            created_ticket = next(t for t in tickets if t['id'] == self.ticket_id)
                            
                            # Verify ticket content matches what we sent
                            content_correct = (
                                created_ticket['subject'] == "Test Support" and
                                created_ticket['message'] == "Testing support system" and
                                created_ticket['priority'] == "medium" and
                                created_ticket['status'] == "open"
                            )
                            
                            if content_correct:
                                self.log_test("Ticket Content Verification", True, "Content matches creation request")
                            else:
                                self.log_test("Ticket Content Verification", False, "Content mismatch", critical=True)
                                print(f"    Expected: subject='Test Support', message='Testing support system', priority='medium', status='open'")
                                print(f"    Got: subject='{created_ticket['subject']}', message='{created_ticket['message']}', priority='{created_ticket['priority']}', status='{created_ticket['status']}'")
                            
                            self.log_test("Created Ticket Found", True, "Ticket successfully retrieved")
                        else:
                            self.log_test("Created Ticket Found", False, "Previously created ticket not found", critical=True)
                    else:
                        self.log_test("Ticket Structure", False, f"Missing fields: {missing_fields}", critical=True)
                else:
                    self.log_test("Tickets Available", False, "No tickets found despite creating one", critical=True)
                
                return True
            else:
                self.log_test("User Tickets List Format", False, "Response is not a list", critical=True)
                return False
        else:
            self.log_test("Get User Tickets", False, f"Status: {response.status_code}", critical=True)
            return False

    def test_admin_endpoints(self):
        """Test admin endpoints (will fail without admin access)"""
        print("\n👑 Testing Admin Endpoints...")
        
        if not self.admin_token:
            # Try to access admin endpoints without admin token to verify security
            headers = {'Authorization': f'Bearer {self.user_token}'} if self.user_token else {}
            
            # Test admin get all tickets
            response = requests.get(f"{self.base_url}/admin/support/tickets", headers=headers)
            if response.status_code == 403:
                self.log_test("Admin Access Control", True, "Non-admin correctly denied access")
            else:
                self.log_test("Admin Access Control", False, f"Expected 403, got {response.status_code}", critical=True)
            
            self.log_test("Admin Functionality", False, "No admin token available - admin tests skipped")
            return False
        
        # If we have admin token, test admin functionality
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test get all support tickets
        response = requests.get(f"{self.base_url}/admin/support/tickets", headers=headers)
        if response.status_code == 200:
            tickets = response.json()
            self.log_test("Admin Get All Tickets", True, f"Retrieved {len(tickets)} total tickets")
            
            # Verify admin can see user tickets
            if self.ticket_id and any(t['id'] == self.ticket_id for t in tickets):
                self.log_test("Admin Visibility", True, "Admin can see user tickets")
            else:
                self.log_test("Admin Visibility", False, "Admin cannot see user tickets", critical=True)
        else:
            self.log_test("Admin Get All Tickets", False, f"Status: {response.status_code}", critical=True)
        
        # Test update ticket status
        if self.ticket_id:
            response = requests.put(f"{self.base_url}/admin/support/tickets/{self.ticket_id}/status?status=in_progress", headers=headers)
            if response.status_code == 200:
                self.log_test("Admin Update Status", True, "Successfully updated ticket status")
            else:
                self.log_test("Admin Update Status", False, f"Status: {response.status_code}", critical=True)
        
        return True

    def test_notifications(self):
        """Test notification creation"""
        print("\n🔔 Testing Notification System...")
        
        if not self.admin_token:
            self.log_test("Notification Testing", False, "No admin token - cannot verify notifications")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        response = requests.get(f"{self.base_url}/admin/notifications", headers=headers)
        
        if response.status_code == 200:
            notifications = response.json()
            support_notifications = [n for n in notifications if n.get('type') == 'support_ticket']
            
            if support_notifications:
                self.log_test("Support Notifications", True, f"Found {len(support_notifications)} support notifications")
                
                # Check notification structure
                notification = support_notifications[0]
                required_fields = ['title', 'message', 'type', 'data']
                missing_fields = [field for field in required_fields if field not in notification]
                
                if not missing_fields:
                    self.log_test("Notification Structure", True, "Notification has all required fields")
                else:
                    self.log_test("Notification Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Support Notifications", False, "No support ticket notifications found")
        else:
            self.log_test("Notification Testing", False, f"Status: {response.status_code}")

    def test_security(self):
        """Test security aspects"""
        print("\n🔒 Testing Security...")
        
        # Test unauthorized access
        response = requests.post(f"{self.base_url}/support/tickets", json={"subject": "Test", "message": "Test"})
        if response.status_code == 403:
            self.log_test("Unauthorized Creation Blocked", True, "Correctly blocks unauthenticated requests")
        else:
            self.log_test("Unauthorized Creation Blocked", False, f"Expected 403, got {response.status_code}", critical=True)
        
        response = requests.get(f"{self.base_url}/support/tickets")
        if response.status_code == 403:
            self.log_test("Unauthorized Access Blocked", True, "Correctly blocks unauthenticated requests")
        else:
            self.log_test("Unauthorized Access Blocked", False, f"Expected 403, got {response.status_code}", critical=True)

    def run_comprehensive_test(self):
        """Run all support ticket tests"""
        print("🚀 COMPREHENSIVE SUPPORT TICKET SYSTEM TEST")
        print("=" * 70)
        print("Testing the new support endpoints as requested:")
        print("1. POST /api/support/tickets - Create ticket (requires auth)")
        print("2. GET /api/support/tickets - Get user tickets (requires auth)")
        print("3. GET /api/admin/support/tickets - Get all tickets (requires admin)")
        print("4. PUT /api/admin/support/tickets/{ticket_id}/status - Update status (requires admin)")
        print("5. Notification system verification")
        print("=" * 70)
        
        # Run all tests
        if not self.setup_test_user():
            print("❌ CRITICAL: Cannot proceed without user setup")
            return False
        
        self.test_support_ticket_creation()
        self.test_get_user_tickets()
        self.test_admin_endpoints()
        self.test_notifications()
        self.test_security()
        
        # Generate summary
        self.print_summary()
        
        # Return success if no critical failures
        critical_failures = [r for r in self.results if not r['success'] and r.get('critical', False)]
        return len(critical_failures) == 0

    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 70)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 70)
        
        passed = [r for r in self.results if r['success']]
        failed = [r for r in self.results if not r['success']]
        critical_failed = [r for r in failed if r.get('critical', False)]
        
        print(f"Total Tests: {len(self.results)}")
        print(f"Passed: {len(passed)}")
        print(f"Failed: {len(failed)}")
        print(f"Critical Failures: {len(critical_failed)}")
        
        if len(self.results) > 0:
            print(f"Success Rate: {(len(passed)/len(self.results))*100:.1f}%")
        
        # Core functionality assessment
        print("\n🎯 CORE FUNCTIONALITY ASSESSMENT:")
        
        core_tests = [
            "Support Ticket Creation",
            "User Tickets List Format", 
            "Ticket Structure",
            "Ticket Content Verification"
        ]
        
        core_passed = [r for r in self.results if r['name'] in core_tests and r['success']]
        core_total = [r for r in self.results if r['name'] in core_tests]
        
        if len(core_total) > 0:
            core_success_rate = (len(core_passed) / len(core_total)) * 100
            if core_success_rate == 100:
                print("✅ All core support ticket functionality is working correctly")
            elif core_success_rate >= 75:
                print("⚠️  Most core functionality working, minor issues present")
            else:
                print("❌ Critical issues with core functionality")
        
        # Admin functionality assessment
        admin_working = any(r['name'] == "Admin Get All Tickets" and r['success'] for r in self.results)
        if admin_working:
            print("✅ Admin functionality is working")
        else:
            print("⚠️  Admin functionality not tested (no admin access)")
        
        # Security assessment
        security_tests = ["Unauthorized Creation Blocked", "Unauthorized Access Blocked", "Admin Access Control"]
        security_passed = [r for r in self.results if r['name'] in security_tests and r['success']]
        security_total = [r for r in self.results if r['name'] in security_tests]
        
        if len(security_total) > 0 and len(security_passed) == len(security_total):
            print("✅ Security controls are working correctly")
        else:
            print("⚠️  Some security issues detected")
        
        # Failed tests details
        if failed:
            print(f"\n❌ FAILED TESTS ({len(failed)}):")
            for test in failed:
                priority = "🔴 CRITICAL" if test.get('critical', False) else "⚠️ "
                print(f"   {priority} {test['name']}: {test['details']}")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS:")
        if critical_failed:
            print("   🔴 Address critical failures immediately")
        if not admin_working:
            print("   ⚠️  Set up admin user to test full admin functionality")
        if len(passed) == len(self.results):
            print("   ✅ All tests passed - system is working correctly!")

if __name__ == "__main__":
    tester = ComprehensiveSupportTest()
    success = tester.run_comprehensive_test()
    exit(0 if success else 1)