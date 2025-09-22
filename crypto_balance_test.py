#!/usr/bin/env python3
"""
Focused test for the crypto balance system implementation
"""
import requests
import json
from datetime import datetime
import random
import string

class CryptoBalanceSystemTester:
    def __init__(self, base_url="https://trade-portal-dev.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.test_results = []
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def generate_test_email(self):
        """Generate unique test email"""
        timestamp = datetime.now().strftime('%H%M%S')
        random_str = ''.join(random.choices(string.ascii_lowercase, k=4))
        return f"crypto_test_{timestamp}_{random_str}@bitsecure.com"

    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            
            return response.status_code, response.json() if response.content else {}
        except Exception as e:
            return 500, {"error": str(e)}

    def test_crypto_balance_system(self):
        """Test the complete crypto balance system"""
        print("🚀 Testing Crypto Balance System")
        print("=" * 50)
        
        # Step 1: Register user and check crypto_balances initialization
        test_email = self.generate_test_email()
        user_data = {
            "name": "Crypto Test User",
            "email": test_email,
            "password": "CryptoTest123!"
        }
        
        print(f"\n📝 Step 1: Registering user {test_email}")
        status, response = self.make_request("POST", "auth/register", user_data)
        
        if status != 200:
            self.log_test("User Registration", False, f"Status {status}: {response}")
            return False
        
        self.log_test("User Registration", True)
        
        # Check crypto_balances structure
        user = response.get('user', {})
        crypto_balances = user.get('crypto_balances', {})
        expected_cryptos = ["BTC", "ETH", "USDT", "BNB", "ADA"]
        
        print(f"   User crypto_balances: {crypto_balances}")
        
        for crypto in expected_cryptos:
            if crypto in crypto_balances and crypto_balances[crypto] == 0.0:
                self.log_test(f"Crypto Balance Init - {crypto}", True)
            else:
                self.log_test(f"Crypto Balance Init - {crypto}", False, f"Expected 0.0, got {crypto_balances.get(crypto, 'missing')}")
        
        # Check UserResponse structure
        required_fields = ['id', 'name', 'email', 'balance', 'crypto_balances', 'is_admin', 'created_at']
        missing_fields = [field for field in required_fields if field not in user]
        
        if not missing_fields:
            self.log_test("UserResponse Structure", True)
        else:
            self.log_test("UserResponse Structure", False, f"Missing fields: {missing_fields}")
        
        token = response['access_token']
        user_id = user['id']
        is_admin = user.get('is_admin', False)
        
        print(f"   User ID: {user_id}")
        print(f"   Is Admin: {is_admin}")
        print(f"   Legacy Balance: {user.get('balance', 'N/A')}")
        
        # Step 2: Create BTC deposit
        print(f"\n💰 Step 2: Creating BTC deposit")
        deposit_data = {
            "crypto": "BTC",
            "amount": 100.0
        }
        
        headers = {'Authorization': f'Bearer {token}'}
        status, response = self.make_request("POST", "deposits/crypto", deposit_data, headers)
        
        if status != 200:
            self.log_test("BTC Deposit Creation", False, f"Status {status}: {response}")
            return False
        
        self.log_test("BTC Deposit Creation", True)
        transaction_id = response.get('transaction_id')
        print(f"   Transaction ID: {transaction_id}")
        print(f"   Admin Wallet: {response.get('admin_wallet', 'N/A')}")
        
        # Step 3: Check balance before approval
        print(f"\n🔍 Step 3: Checking balance before approval")
        status, response = self.make_request("GET", "auth/me", headers=headers)
        
        if status == 200:
            pre_balance = response.get('balance', -1)
            pre_crypto_balances = response.get('crypto_balances', {})
            
            print(f"   Legacy Balance: {pre_balance}")
            print(f"   BTC Balance: {pre_crypto_balances.get('BTC', 'N/A')}")
            
            if pre_balance == 0.0:
                self.log_test("Pre-Approval Legacy Balance", True)
            else:
                self.log_test("Pre-Approval Legacy Balance", False, f"Expected 0.0, got {pre_balance}")
            
            if pre_crypto_balances.get('BTC', -1) == 0.0:
                self.log_test("Pre-Approval BTC Balance", True)
            else:
                self.log_test("Pre-Approval BTC Balance", False, f"Expected 0.0, got {pre_crypto_balances.get('BTC')}")
        
        # Step 4: Admin approval (if user is admin)
        if is_admin and transaction_id:
            print(f"\n👑 Step 4: Admin approving transaction")
            status, response = self.make_request("PUT", f"admin/transactions/{transaction_id}/approve", headers=headers)
            
            if status != 200:
                self.log_test("Transaction Approval", False, f"Status {status}: {response}")
                return False
            
            self.log_test("Transaction Approval", True)
            crypto_type = response.get('crypto_type')
            print(f"   Detected Crypto Type: {crypto_type}")
            
            if crypto_type == 'BTC':
                self.log_test("Crypto Type Detection", True)
            else:
                self.log_test("Crypto Type Detection", False, f"Expected 'BTC', got '{crypto_type}'")
            
            # Step 5: Check balance after approval
            print(f"\n✅ Step 5: Checking balance after approval")
            status, response = self.make_request("GET", "auth/me", headers=headers)
            
            if status == 200:
                post_balance = response.get('balance', -1)
                post_crypto_balances = response.get('crypto_balances', {})
                
                print(f"   Legacy Balance: {post_balance}")
                print(f"   BTC Balance: {post_crypto_balances.get('BTC', 'N/A')}")
                print(f"   Full crypto_balances: {post_crypto_balances}")
                
                # Check legacy balance
                if post_balance == 100.0:
                    self.log_test("Post-Approval Legacy Balance", True)
                else:
                    self.log_test("Post-Approval Legacy Balance", False, f"Expected 100.0, got {post_balance}")
                
                # Check BTC-specific balance
                btc_balance = post_crypto_balances.get('BTC', -1)
                if btc_balance == 100.0:
                    self.log_test("Post-Approval BTC Balance", True)
                else:
                    self.log_test("Post-Approval BTC Balance", False, f"Expected 100.0, got {btc_balance}")
                
                # Check other crypto balances remain 0
                other_cryptos = ["ETH", "USDT", "BNB", "ADA"]
                for crypto in other_cryptos:
                    if post_crypto_balances.get(crypto, -1) == 0.0:
                        self.log_test(f"Post-Approval {crypto} Balance Unchanged", True)
                    else:
                        self.log_test(f"Post-Approval {crypto} Balance Unchanged", False, f"Expected 0.0, got {post_crypto_balances.get(crypto)}")
                
                # Test ETH deposit for multi-crypto functionality
                print(f"\n🔄 Step 6: Testing ETH deposit for multi-crypto")
                eth_deposit_data = {
                    "crypto": "ETH",
                    "amount": 50.0
                }
                
                status, response = self.make_request("POST", "deposits/crypto", eth_deposit_data, headers)
                
                if status == 200:
                    eth_transaction_id = response.get('transaction_id')
                    self.log_test("ETH Deposit Creation", True)
                    
                    # Approve ETH transaction
                    status, response = self.make_request("PUT", f"admin/transactions/{eth_transaction_id}/approve", headers=headers)
                    
                    if status == 200:
                        self.log_test("ETH Transaction Approval", True)
                        
                        # Check final balances
                        status, response = self.make_request("GET", "auth/me", headers=headers)
                        
                        if status == 200:
                            final_balance = response.get('balance', -1)
                            final_crypto_balances = response.get('crypto_balances', {})
                            
                            print(f"   Final Legacy Balance: {final_balance}")
                            print(f"   Final BTC Balance: {final_crypto_balances.get('BTC', 'N/A')}")
                            print(f"   Final ETH Balance: {final_crypto_balances.get('ETH', 'N/A')}")
                            
                            # Should have 150.0 total (100 BTC + 50 ETH)
                            if final_balance == 150.0:
                                self.log_test("Final Legacy Balance (Multi-Crypto)", True)
                            else:
                                self.log_test("Final Legacy Balance (Multi-Crypto)", False, f"Expected 150.0, got {final_balance}")
                            
                            # BTC should still be 100.0
                            if final_crypto_balances.get('BTC', -1) == 100.0:
                                self.log_test("Final BTC Balance", True)
                            else:
                                self.log_test("Final BTC Balance", False, f"Expected 100.0, got {final_crypto_balances.get('BTC')}")
                            
                            # ETH should be 50.0
                            if final_crypto_balances.get('ETH', -1) == 50.0:
                                self.log_test("Final ETH Balance", True)
                            else:
                                self.log_test("Final ETH Balance", False, f"Expected 50.0, got {final_crypto_balances.get('ETH')}")
                    else:
                        self.log_test("ETH Transaction Approval", False, f"Status {status}: {response}")
                else:
                    self.log_test("ETH Deposit Creation", False, f"Status {status}: {response}")
        else:
            print(f"\n⚠️  Step 4: Skipping admin approval (User is not admin or no transaction ID)")
            self.log_test("Admin Approval Flow", False, "User is not admin - cannot test full approval flow")
        
        return True

    def run_test(self):
        """Run the crypto balance system test"""
        success = self.test_crypto_balance_system()
        
        print("\n" + "=" * 50)
        print("📊 CRYPTO BALANCE TEST SUMMARY")
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
        
        return success

if __name__ == "__main__":
    tester = CryptoBalanceSystemTester()
    tester.run_test()