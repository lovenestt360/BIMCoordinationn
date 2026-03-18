import requests
import sys
import json
from datetime import datetime, timedelta

class KlyronAPITester:
    def __init__(self, base_url="https://bim-clash-detection.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.text:
                    try:
                        response_data = response.json()
                        print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    except:
                        print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:500]}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:500]
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_contact_form(self):
        """Test contact form submission"""
        test_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@example.com",
            "company": "Test Company",
            "message": "This is a test message for the contact form."
        }
        
        success, response = self.run_test(
            "Contact Form Submission",
            "POST",
            "contact",
            200,
            data=test_data
        )
        
        if success and response.get('success'):
            print(f"   Contact ID: {response.get('id')}")
            return True, response.get('id')
        return False, None

    def test_get_contact_messages(self):
        """Test getting contact messages"""
        success, response = self.run_test(
            "Get Contact Messages",
            "GET",
            "contact",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} contact messages")
            return True
        return False

    def test_available_slots(self):
        """Test available slots endpoint"""
        # Test with tomorrow's date
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        success, response = self.run_test(
            "Get Available Slots",
            "GET",
            "available-slots",
            200,
            params={"date": tomorrow}
        )
        
        if success and 'available_slots' in response:
            print(f"   Available slots: {response['available_slots']}")
            return True, response['available_slots']
        return False, []

    def test_meeting_scheduling(self):
        """Test meeting scheduling"""
        # First get available slots for tomorrow
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        slot_success, slots = self.test_available_slots()
        
        if not slot_success or not slots:
            print("❌ Cannot test meeting scheduling - no available slots")
            return False, None
            
        # Schedule a meeting
        test_data = {
            "name": f"Test Scheduler {datetime.now().strftime('%H%M%S')}",
            "email": f"scheduler{datetime.now().strftime('%H%M%S')}@example.com",
            "company": "Test Scheduling Co",
            "date": tomorrow,
            "time": slots[0],  # Use first available slot
            "timezone": "UTC",
            "notes": "This is a test meeting booking."
        }
        
        success, response = self.run_test(
            "Meeting Scheduling",
            "POST",
            "meetings",
            200,
            data=test_data
        )
        
        if success and response.get('success'):
            meeting_id = response.get('id')
            print(f"   Meeting ID: {meeting_id}")
            return True, meeting_id
        return False, None

    def test_get_meetings(self):
        """Test getting all meetings"""
        success, response = self.run_test(
            "Get All Meetings",
            "GET",
            "meetings",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} meetings")
            return True
        return False

    def test_get_single_meeting(self, meeting_id):
        """Test getting a single meeting by ID"""
        if not meeting_id:
            print("⚠️ Skipping single meeting test - no meeting ID")
            return True
            
        success, response = self.run_test(
            "Get Single Meeting",
            "GET",
            f"meetings/{meeting_id}",
            200
        )
        
        if success and response.get('id') == meeting_id:
            print(f"   Meeting name: {response.get('name')}")
            return True
        return False

    def test_update_meeting_status(self, meeting_id):
        """Test updating meeting status"""
        if not meeting_id:
            print("⚠️ Skipping meeting status update - no meeting ID")
            return True
            
        success, response = self.run_test(
            "Update Meeting Status",
            "PATCH",
            f"meetings/{meeting_id}/status?status=confirmed",
            200
        )
        
        if success and response.get('success'):
            return True
        return False

    def test_calendar_oauth_status(self):
        """Test Google Calendar OAuth status"""
        success, response = self.run_test(
            "Calendar OAuth Status",
            "GET",
            "oauth/calendar/status",
            200
        )
        
        if success and 'configured' in response:
            print(f"   Calendar configured: {response.get('configured')}")
            return True
        return False

def main():
    print("🚀 Starting Klyron Consulting API Tests")
    print("=" * 50)
    
    # Setup
    tester = KlyronAPITester()
    
    # Core API tests
    tester.test_health_check()
    tester.test_api_root()
    tester.test_calendar_oauth_status()
    
    # Contact form tests
    contact_success, contact_id = tester.test_contact_form()
    tester.test_get_contact_messages()
    
    # Meeting scheduling tests
    meeting_success, meeting_id = tester.test_meeting_scheduling()
    tester.test_get_meetings()
    tester.test_get_single_meeting(meeting_id)
    tester.test_update_meeting_status(meeting_id)
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 TEST RESULTS")
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['test']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())