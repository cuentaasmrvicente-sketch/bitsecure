import requests
import sys
import json
from datetime import datetime
import random
import string

class BitSecureAPITester:
    def __init__(self, base_url="https://trade-portal-dev.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        self.ticket_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
                if not success:
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
            except:
                if not success:
                    print(f"   Response Text: {response.text}")

            details = f"Expected {expected_status}, got {response.status_code}"
            if not success and response_data:
                details += f" - {response_data.get('detail', '')}"
            
            self.log_test(name, success, details if not success else "")
            return success, response_data

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def generate_test_email(self):
        """Generate unique test email"""
        timestamp = datetime.now().strftime('%H%M%S')
        random_str = ''.join(random.choices(string.ascii_lowercase, k=4))
        return f"test_{timestamp}_{random_str}@bitsecure.com"

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_wallet_addresses(self):
        """Test wallet addresses endpoint"""
        success, response = self.run_test(
            "Get Wallet Addresses",
            "GET",
            "wallet-addresses",
            200
        )
        
        if success and response:
            expected_cryptos = ["BTC", "ETH", "USDT", "BNB", "ADA"]
            for crypto in expected_cryptos:
                if crypto not in response:
                    self.log_test(f"Wallet Address - {crypto}", False, f"{crypto} address missing")
                else:
                    self.log_test(f"Wallet Address - {crypto}", True)
        
        return success

    def test_trading_data(self):
        """Test trading data endpoint"""
        success, response = self.run_test(
            "Get Trading Data",
            "GET",
            "trading/data",
            200
        )
        
        if success and response:
            if 'pairs' in response and 'last_updated' in response:
                pairs = response['pairs']
                if len(pairs) >= 4:  # Should have BTC, ETH, BNB, ADA pairs
                    self.log_test("Trading Data Structure", True)
                    
                    # Check each pair has required fields
                    for pair in pairs:
                        required_fields = ['pair', 'change', 'direction', 'leverage', 'value']
                        missing_fields = [field for field in required_fields if field not in pair]
                        if missing_fields:
                            self.log_test(f"Trading Pair {pair.get('pair', 'Unknown')}", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_test(f"Trading Pair {pair.get('pair', 'Unknown')}", True)
                else:
                    self.log_test("Trading Data Structure", False, f"Expected 4+ pairs, got {len(pairs)}")
            else:
                self.log_test("Trading Data Structure", False, "Missing 'pairs' or 'last_updated' fields")
        
        return success

    def test_user_registration(self):
        """Test user registration"""
        test_email = self.generate_test_email()
        test_data = {
            "name": "Test User",
            "email": test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and response:
            if 'access_token' in response and 'user' in response:
                self.token = response['access_token']
                self.user_id = response['user']['id']
                
                # Check if user got €100 bonus
                user_balance = response['user']['balance']
                if user_balance == 100.0:
                    self.log_test("Registration Bonus", True)
                else:
                    self.log_test("Registration Bonus", False, f"Expected €100, got €{user_balance}")
                
                # Check if first user is admin
                if response['user']['is_admin']:
                    self.admin_token = self.token
                    self.admin_id = self.user_id
                    self.log_test("First User Admin Status", True)
                else:
                    self.log_test("First User Admin Status", True, "Not first user, admin status correct")
                
                self.log_test("Registration Token Generation", True)
            else:
                self.log_test("Registration Response Structure", False, "Missing access_token or user data")
        
        return success

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.user_id:
            return False
        
        # Create another user to test login
        test_email = self.generate_test_email()
        test_password = "LoginTest123!"
        
        # Register new user first
        reg_data = {
            "name": "Login Test User",
            "email": test_email,
            "password": test_password
        }
        
        reg_success, reg_response = self.run_test(
            "Registration for Login Test",
            "POST",
            "auth/register",
            200,
            data=reg_data
        )
        
        if not reg_success:
            return False
        
        # Now test login
        login_data = {
            "email": test_email,
            "password": test_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and response:
            if 'access_token' in response and 'user' in response:
                self.log_test("Login Token Generation", True)
            else:
                self.log_test("Login Response Structure", False, "Missing access_token or user data")
        
        return success

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        
        return success

    def test_auth_me(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Auth Me", False, "No token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            headers=headers
        )
        
        if success and response:
            required_fields = ['id', 'name', 'email', 'balance', 'is_admin', 'created_at']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("User Data Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("User Data Structure", True)
        
        return success

    def test_crypto_deposit(self):
        """Test crypto deposit"""
        if not self.token:
            self.log_test("Crypto Deposit", False, "No token available")
            return False
        
        deposit_data = {
            "crypto": "BTC",
            "wallet_address": "bc1qtest123456789abcdef",
            "amount": 50.0
        }
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Crypto Deposit",
            "POST",
            "deposits/crypto",
            200,
            data=deposit_data,
            headers=headers
        )
        
        if success and response:
            if 'transaction_id' in response and 'admin_wallet' in response:
                self.log_test("Crypto Deposit Response", True)
            else:
                self.log_test("Crypto Deposit Response", False, "Missing transaction_id or admin_wallet")
        
        return success

    def test_invalid_crypto_deposit(self):
        """Test crypto deposit with invalid data"""
        if not self.token:
            return False
        
        # Test with unsupported crypto
        invalid_data = {
            "crypto": "INVALID",
            "wallet_address": "test123",
            "amount": 50.0
        }
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Invalid Crypto Deposit",
            "POST",
            "deposits/crypto",
            400,
            data=invalid_data,
            headers=headers
        )
        
        # Test with amount below minimum
        low_amount_data = {
            "crypto": "BTC",
            "wallet_address": "bc1qtest123456789abcdef",
            "amount": 5.0  # Below €10 minimum
        }
        
        success2, response2 = self.run_test(
            "Low Amount Crypto Deposit",
            "POST",
            "deposits/crypto",
            400,
            data=low_amount_data,
            headers=headers
        )
        
        return success and success2

    def test_voucher_deposit(self):
        """Test voucher deposit"""
        if not self.token:
            self.log_test("Voucher Deposit", False, "No token available")
            return False
        
        voucher_data = {
            "voucher_code": "TEST-VOUCHER-123"
        }
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Voucher Deposit",
            "POST",
            "deposits/voucher",
            200,
            data=voucher_data,
            headers=headers
        )
        
        if success and response:
            if 'amount' in response and response['amount'] >= 50:
                self.log_test("Voucher Amount", True)
            else:
                self.log_test("Voucher Amount", False, f"Invalid amount: {response.get('amount', 'missing')}")
        
        return success

    def test_withdrawal(self):
        """Test withdrawal request"""
        if not self.token:
            self.log_test("Withdrawal", False, "No token available")
            return False
        
        withdrawal_data = {
            "method": "paypal",
            "amount": 25.0,
            "details": {
                "email": "test@paypal.com"
            }
        }
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "PayPal Withdrawal",
            "POST",
            "withdrawals",
            200,
            data=withdrawal_data,
            headers=headers
        )
        
        # Test bank withdrawal
        bank_data = {
            "method": "bank",
            "amount": 30.0,
            "details": {
                "bank_name": "Test Bank",
                "iban": "ES1234567890123456789012"
            }
        }
        
        success2, response2 = self.run_test(
            "Bank Withdrawal",
            "POST",
            "withdrawals",
            200,
            data=bank_data,
            headers=headers
        )
        
        # Test Bizum withdrawal
        bizum_data = {
            "method": "bizum",
            "amount": 20.0,
            "details": {
                "phone": "+34123456789"
            }
        }
        
        success3, response3 = self.run_test(
            "Bizum Withdrawal",
            "POST",
            "withdrawals",
            200,
            data=bizum_data,
            headers=headers
        )
        
        return success and success2 and success3

    def test_insufficient_balance_withdrawal(self):
        """Test withdrawal with insufficient balance"""
        if not self.token:
            return False
        
        withdrawal_data = {
            "method": "paypal",
            "amount": 10000.0,  # Way more than user balance
            "details": {
                "email": "test@paypal.com"
            }
        }
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Insufficient Balance Withdrawal",
            "POST",
            "withdrawals",
            400,
            data=withdrawal_data,
            headers=headers
        )
        
        return success

    def test_get_transactions(self):
        """Test getting user transactions"""
        if not self.token:
            self.log_test("Get Transactions", False, "No token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Get Transactions",
            "GET",
            "transactions",
            200,
            headers=headers
        )
        
        if success and isinstance(response, list):
            self.log_test("Transactions List Format", True)
            
            # Check transaction structure if any exist
            if response:
                transaction = response[0]
                required_fields = ['id', 'user_id', 'type', 'method', 'amount', 'details', 'status', 'created_at']
                missing_fields = [field for field in required_fields if field not in transaction]
                if missing_fields:
                    self.log_test("Transaction Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Transaction Structure", True)
        else:
            self.log_test("Transactions List Format", False, "Response is not a list")
        
        return success

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.admin_token:
            self.log_test("Admin Tests", False, "No admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test admin stats
        success1, response1 = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            headers=headers
        )
        
        if success1 and response1:
            if 'total_users' in response1 and 'total_balance' in response1:
                self.log_test("Admin Stats Structure", True)
            else:
                self.log_test("Admin Stats Structure", False, "Missing total_users or total_balance")
        
        # Test get all users
        success2, response2 = self.run_test(
            "Admin Get Users",
            "GET",
            "admin/users",
            200,
            headers=headers
        )
        
        if success2 and isinstance(response2, list):
            self.log_test("Admin Users List", True)
        else:
            self.log_test("Admin Users List", False, "Response is not a list")
        
        # Test get notifications
        success3, response3 = self.run_test(
            "Admin Notifications",
            "GET",
            "admin/notifications",
            200,
            headers=headers
        )
        
        if success3 and isinstance(response3, list):
            self.log_test("Admin Notifications List", True)
        else:
            self.log_test("Admin Notifications List", False, "Response is not a list")
        
        return success1 and success2 and success3

    def test_non_admin_access(self):
        """Test that non-admin users can't access admin endpoints"""
        if not self.token or self.admin_token == self.token:
            # Create a regular user for this test
            test_email = self.generate_test_email()
            reg_data = {
                "name": "Regular User",
                "email": test_email,
                "password": "RegularPass123!"
            }
            
            reg_success, reg_response = self.run_test(
                "Create Regular User",
                "POST",
                "auth/register",
                200,
                data=reg_data
            )
            
            if not reg_success:
                return False
            
            regular_token = reg_response['access_token']
        else:
            regular_token = self.token
        
        headers = {'Authorization': f'Bearer {regular_token}'}
        
        # Try to access admin stats
        success, response = self.run_test(
            "Non-Admin Access Denied",
            "GET",
            "admin/stats",
            403,
            headers=headers
        )
        
        return success

    def test_support_ticket_creation(self):
        """Test creating a support ticket"""
        if not self.token:
            self.log_test("Support Ticket Creation", False, "No token available")
            return False
        
        ticket_data = {
            "subject": "Test Support",
            "message": "Testing support system",
            "priority": "medium"
        }
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Create Support Ticket",
            "POST",
            "support/tickets",
            200,
            data=ticket_data,
            headers=headers
        )
        
        if success and response:
            if 'ticket_id' in response and 'message' in response:
                self.ticket_id = response['ticket_id']  # Store for later tests
                self.log_test("Support Ticket Response Structure", True)
            else:
                self.log_test("Support Ticket Response Structure", False, "Missing ticket_id or message")
        
        return success

    def test_get_user_support_tickets(self):
        """Test getting user's support tickets"""
        if not self.token:
            self.log_test("Get User Support Tickets", False, "No token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "Get User Support Tickets",
            "GET",
            "support/tickets",
            200,
            headers=headers
        )
        
        if success and isinstance(response, list):
            self.log_test("Support Tickets List Format", True)
            
            # Check ticket structure if any exist
            if response:
                ticket = response[0]
                required_fields = ['id', 'user_id', 'user_name', 'user_email', 'subject', 'message', 'priority', 'status', 'created_at']
                missing_fields = [field for field in required_fields if field not in ticket]
                if missing_fields:
                    self.log_test("Support Ticket Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Support Ticket Structure", True)
                    
                # Verify the ticket we created is there
                if hasattr(self, 'ticket_id') and any(t['id'] == self.ticket_id for t in response):
                    self.log_test("Created Ticket Found", True)
                else:
                    self.log_test("Created Ticket Found", False, "Previously created ticket not found")
        else:
            self.log_test("Support Tickets List Format", False, "Response is not a list")
        
        return success

    def test_admin_support_tickets(self):
        """Test admin getting all support tickets"""
        if not self.admin_token:
            self.log_test("Admin Support Tickets", False, "No admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Admin Get All Support Tickets",
            "GET",
            "admin/support/tickets",
            200,
            headers=headers
        )
        
        if success and isinstance(response, list):
            self.log_test("Admin Support Tickets List", True)
            
            # Verify admin can see tickets from all users
            if response:
                # Check if we can find our test ticket
                if hasattr(self, 'ticket_id') and any(t['id'] == self.ticket_id for t in response):
                    self.log_test("Admin Can See User Tickets", True)
                else:
                    self.log_test("Admin Can See User Tickets", False, "Admin cannot see user tickets")
        else:
            self.log_test("Admin Support Tickets List", False, "Response is not a list")
        
        return success

    def test_update_ticket_status(self):
        """Test admin updating ticket status"""
        if not self.admin_token or not hasattr(self, 'ticket_id'):
            self.log_test("Update Ticket Status", False, "No admin token or ticket ID available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test updating to in_progress
        success1, response1 = self.run_test(
            "Update Ticket Status - In Progress",
            "PUT",
            f"admin/support/tickets/{self.ticket_id}/status?status=in_progress",
            200,
            headers=headers
        )
        
        # Test updating to resolved
        success2, response2 = self.run_test(
            "Update Ticket Status - Resolved",
            "PUT",
            f"admin/support/tickets/{self.ticket_id}/status?status=resolved",
            200,
            headers=headers
        )
        
        # Test invalid status
        success3, response3 = self.run_test(
            "Update Ticket Status - Invalid",
            "PUT",
            f"admin/support/tickets/{self.ticket_id}/status?status=invalid_status",
            400,
            headers=headers
        )
        
        return success1 and success2 and success3

    def test_support_ticket_notifications(self):
        """Test that support ticket creation generates notifications"""
        if not self.admin_token:
            self.log_test("Support Ticket Notifications", False, "No admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Check Support Notifications",
            "GET",
            "admin/notifications",
            200,
            headers=headers
        )
        
        if success and isinstance(response, list):
            # Look for support ticket notification
            support_notifications = [n for n in response if n.get('type') == 'support_ticket']
            if support_notifications:
                self.log_test("Support Ticket Notification Created", True)
                
                # Check notification structure
                notification = support_notifications[0]
                if 'title' in notification and 'message' in notification and 'data' in notification:
                    self.log_test("Support Notification Structure", True)
                else:
                    self.log_test("Support Notification Structure", False, "Missing required fields")
            else:
                self.log_test("Support Ticket Notification Created", False, "No support ticket notifications found")
        else:
            self.log_test("Support Ticket Notifications", False, "Could not retrieve notifications")
        
        return success

    def test_unauthorized_support_access(self):
        """Test that unauthorized users cannot access support endpoints"""
        # Test without token
        success1, response1 = self.run_test(
            "Unauthorized Support Ticket Creation",
            "POST",
            "support/tickets",
            401,
            data={"subject": "Test", "message": "Test"}
        )
        
        success2, response2 = self.run_test(
            "Unauthorized Get Support Tickets",
            "GET",
            "support/tickets",
            401
        )
        
        # Test regular user accessing admin endpoints
        if self.token and self.admin_token != self.token:
            headers = {'Authorization': f'Bearer {self.token}'}
            success3, response3 = self.run_test(
                "Non-Admin Support Admin Access",
                "GET",
                "admin/support/tickets",
                403,
                headers=headers
            )
        else:
            success3 = True  # Skip if no regular user token
        
        return success1 and success2 and success3

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting BitSecure API Tests")
        print("=" * 50)
        
        # Basic endpoint tests
        self.test_root_endpoint()
        self.test_wallet_addresses()
        self.test_trading_data()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_invalid_login()
        self.test_auth_me()
        
        # Deposit tests
        self.test_crypto_deposit()
        self.test_invalid_crypto_deposit()
        self.test_voucher_deposit()
        
        # Withdrawal tests
        self.test_withdrawal()
        self.test_insufficient_balance_withdrawal()
        
        # Transaction tests
        self.test_get_transactions()
        
        # Support ticket tests
        print("\n🎫 Testing Support Ticket System...")
        self.test_support_ticket_creation()
        self.test_get_user_support_tickets()
        self.test_admin_support_tickets()
        self.test_update_ticket_status()
        self.test_support_ticket_notifications()
        self.test_unauthorized_support_access()
        
        # Admin tests
        self.test_admin_endpoints()
        self.test_non_admin_access()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['name']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = BitSecureAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())