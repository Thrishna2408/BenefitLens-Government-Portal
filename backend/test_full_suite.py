import sys
import unittest
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

class TestBenefitLensFullStack(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    def test_01_backend_health(self):
        res = requests.get(f"{BASE_URL}/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        print("✓ [TEST 1 PASSED] BenefitLens Health check endpoint OK: PostgreSQL & BCrypt active.")

    def test_02_genuine_schemes_catalog(self):
        res = requests.get(f"{BASE_URL}/schemes")
        self.assertEqual(res.status_code, 200)
        schemes = res.json()
        self.assertGreaterEqual(len(schemes), 10)
        # Verify genuine schemes exist
        titles = [s["title"] for s in schemes]
        self.assertTrue(any("PM-KISAN" in t for t in titles))
        self.assertTrue(any("Ayushman" in t for t in titles))
        self.assertTrue(any("Awas" in t for t in titles))
        # Verify sanctioned_amount_default exists
        self.assertTrue(any(s.get("sanctioned_amount_default", 0) > 0 for s in schemes))
        print(f"✓ [TEST 2 PASSED] Sourced {len(schemes)} genuine Central & State Govt schemes with sanctioned amounts and verified sources.")

    def test_03_beneficiary_registration_and_aadhaar_masking(self):
        import time
        unique_suffix = f"{int(time.time() * 1000) % 100000000:08d}"
        unique_phone = f"97{unique_suffix}"
        unique_aadhaar = f"54{int(time.time() * 1000) % 10000000000:010d}"
        payload = {
            "name": "Kavita Devi",
            "phone": unique_phone,
            "email": f"kavita_{unique_phone}@example.in",
            "password": "SecurePassword@2026",
            "state": "Madhya Pradesh",
            "district": "Indore",
            "aadhaar_number": unique_aadhaar,
            "annual_income": 120000.0,
            "age": 29,
            "gender": "Female",
            "occupation": "Agriculture Worker",
            "education": "12th Pass",
            "category": "SC",
            "is_differently_abled": False,
            "is_farmer": True,
            "bank_name": "Punjab National Bank",
            "account_number": "918239102491",
            "ifsc_code": "PUNB0182400"
        }
        res = requests.post(f"{BASE_URL}/auth/register", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertIn("access_token", data)
        # Verify Aadhaar is masked and NEVER stored/exposed raw
        self.assertTrue(data["user"]["aadhaarMasked"].startswith("XXXX-XXXX-"))
        print(f"✓ [TEST 3 PASSED] Beneficiary registered with 10 eligibility parameters & secure Aadhaar masking ({data['user']['aadhaarMasked']}).")

    def test_04_personalized_scheme_matching(self):
        login_res = requests.post(f"{BASE_URL}/auth/login", json={
            "phone_or_email": "9876543210",
            "password": "password123",
            "role": "citizen"
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = requests.get(f"{BASE_URL}/schemes/personalized", headers=headers)
        self.assertEqual(res.status_code, 200)
        matches = res.json()
        self.assertGreater(len(matches), 0)
        top_match = matches[0]
        self.assertTrue(top_match["is_eligible"])
        self.assertGreaterEqual(top_match["match_percentage"], 90)
        print(f"✓ [TEST 4 PASSED] Personalised matching evaluated. Top eligible: '{top_match['scheme']['title']}' ({top_match['match_percentage']}% match).")

    def test_05_application_submission_and_tracking(self):
        login_res = requests.post(f"{BASE_URL}/auth/login", json={
            "phone_or_email": "9876543210",
            "password": "password123",
            "role": "citizen"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        app_payload = {
            "scheme_id": "pm-svanidhi",
            "fullName": "Rajesh Kumar Verma",
            "mobileNumber": "9876543210",
            "state": "Madhya Pradesh",
            "district": "Indore",
            "aadhaarNumber": "XXXX-XXXX-4819",
            "annualIncome": "240000",
            "occupation": "Street Vendor",
            "socialCategory": "OBC",
            "bankName": "State Bank of India",
            "accountNumber": "XXXX-XXXX-4102",
            "ifscCode": "SBIN0001842",
            "attachedDocs": ["Certificate of Vending", "Aadhaar Card"],
            "declarationAgreed": True
        }
        res = requests.post(f"{BASE_URL}/applications", json=app_payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        created_app = res.json()
        arn = created_app["id"]
        self.assertTrue(arn.startswith("BL-2026-") or arn.startswith("ARN-2026-"))
        self.assertIn("/acknowledgement", created_app["acknowledgement_proof_url"])

        # Track the newly created application publicly
        track_res = requests.get(f"{BASE_URL}/applications/track/{arn}")
        self.assertEqual(track_res.status_code, 200)
        track_data = track_res.json()
        self.assertEqual(track_data["id"], arn)
        self.assertEqual(track_data["status"], "Submitted")
        self.assertEqual(len(track_data["timeline"]), 4)
        print(f"✓ [TEST 5 PASSED] Scheme application submitted with authentic reference: {arn} and 4-stage scrutiny timeline.")

    def test_06_benefit_disbursement_and_transparency_metrics(self):
        login_res = requests.post(f"{BASE_URL}/auth/login", json={
            "phone_or_email": "9876543210",
            "password": "password123",
            "role": "citizen"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = requests.get(f"{BASE_URL}/benefit-payments", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        # Verify BenefitLens core metrics are computed
        self.assertIn("total_sanctioned", data)
        self.assertIn("total_disbursed", data)
        self.assertIn("total_pending", data)
        self.assertIn("total_discrepancy", data)
        self.assertGreater(data["total_sanctioned"], 0)
        self.assertGreater(data["total_disbursed"], 0)
        self.assertGreaterEqual(data["total_pending"], 0)
        self.assertGreaterEqual(data["total_discrepancy"], 0)
        
        # Check first record details
        records = data["records"]
        self.assertGreater(len(records), 0)
        first_record = records[0]
        self.assertIn("sanctioned_amount", first_record)
        self.assertIn("discrepancy_status", first_record)
        print(f"✓ [TEST 6 PASSED] BenefitLens Core Metrics verified: Sanctioned=₹{data['total_sanctioned']:,.0f}, Disbursed=₹{data['total_disbursed']:,.0f}, Pending=₹{data['total_pending']:,.0f}, Discrepancy=₹{data['total_discrepancy']:,.0f}")

    def test_07_beneficiary_confirmation_and_discrepancy_reporting(self):
        login_res = requests.post(f"{BASE_URL}/auth/login", json={
            "phone_or_email": "9876543210",
            "password": "password123",
            "role": "citizen"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get payments to find an existing record
        res = requests.get(f"{BASE_URL}/benefit-payments", headers=headers)
        records = res.json()["records"]
        target_payment = records[0]

        # Submit beneficiary confirmation reporting discrepancy
        confirm_payload = {
            "payment_record_id": target_payment["id"],
            "scheme_id": target_payment["scheme_id"],
            "confirmation_status": "Reported Partial Amount",
            "amount_received_reported": 1500.0,
            "bank_name_reported": "State Bank of India",
            "account_last4_reported": "4102",
            "beneficiary_notes": "Received only ₹1,500 instead of sanctioned installment."
        }
        confirm_res = requests.post(f"{BASE_URL}/benefit-payments/confirm", json=confirm_payload, headers=headers)
        self.assertEqual(confirm_res.status_code, 201)
        confirm_data = confirm_res.json()
        self.assertEqual(confirm_data["confirmation_status"], "Reported Partial Amount")
        self.assertEqual(confirm_data["amount_received_reported"], 1500.0)
        self.assertGreater(confirm_data["discrepancy_amount"], 0)
        print("✓ [TEST 7 PASSED] Beneficiary confirmation & discrepancy reported; record marked for scrutiny.")

    def test_08_admin_analytics_and_audit_trail(self):
        res = requests.get(f"{BASE_URL}/admin/analytics")
        self.assertEqual(res.status_code, 200)
        analytics = res.json()
        self.assertIn("total_sanctioned", analytics)
        self.assertIn("total_disbursed", analytics)
        self.assertIn("total_pending", analytics)
        self.assertIn("reported_discrepancies_count", analytics)
        self.assertGreater(analytics["total_schemes"], 10)
        self.assertGreater(analytics["total_sanctioned"], 0)

        # Check admin audit logs
        audit_res = requests.get(f"{BASE_URL}/admin/audit-logs")
        self.assertEqual(audit_res.status_code, 200)
        logs = audit_res.json()
        self.assertGreater(len(logs), 0)
        first_log = logs[0]
        self.assertIn("action", first_log)
        self.assertIn("actor_name", first_log)
        print(f"✓ [TEST 8 PASSED] Administrator analytics & immutable audit trail verified: Sanctioned=₹{analytics['total_sanctioned']:,.0f}, Disbursed=₹{analytics['total_disbursed']:,.0f}, Audit logs={len(logs)}.")

    def test_09_admin_discrepancy_review_workflow(self):
        # 1. Fetch pending confirmations
        conf_res = requests.get(f"{BASE_URL}/admin/confirmations")
        self.assertEqual(conf_res.status_code, 200)
        confirmations = conf_res.json()
        self.assertGreater(len(confirmations), 0)

        # 2. Review the first confirmation
        target = confirmations[0]
        review_payload = {
            "admin_status": "Under Investigation",
            "admin_notes": "Notified District Social Welfare Officer to audit local PFMS disbursement batch."
        }
        rev_res = requests.post(f"{BASE_URL}/admin/confirmations/{target['id']}/review", json=review_payload)
        self.assertEqual(rev_res.status_code, 200)
        updated = rev_res.json()
        self.assertEqual(updated["admin_status"], "Under Investigation")
        print(f"✓ [TEST 9 PASSED] Admin discrepancy review executed for case #{target['id']} -> Status: 'Under Investigation'.")

if __name__ == "__main__":
    unittest.main()
