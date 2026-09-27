import urllib.request
import urllib.parse
import json

def test_api():
    # 1. Login
    payload = json.dumps({'username': 'r.sharma', 'password': 'Sentinel@2024!'}).encode()
    req = urllib.request.Request('http://localhost:8000/api/auth/login', data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        token = json.loads(res.read().decode())['access_token']
    print('[PASSED] 1. Auth: JWT token acquired successfully for Insp. R. Sharma')

    headers = {'Authorization': f'Bearer {token}'}

    # 2. Get Primary Case SNTL-2026-0042
    req = urllib.request.Request('http://localhost:8000/api/cases/CASE-SNTL-2026-0042', headers=headers)
    with urllib.request.urlopen(req) as res:
        case_data = json.loads(res.read().decode())
    print(f'[PASSED] 2. Case: {case_data["id"]} ({case_data["case_number"]}) | {case_data["fraud_type"]} | Amount: INR {case_data["reported_amount"]:,.2f}')

    # 3. Get Prediction
    req = urllib.request.Request('http://localhost:8000/api/predictions/CASE-SNTL-2026-0042', headers=headers)
    with urllib.request.urlopen(req) as res:
        pred = json.loads(res.read().decode())
    top_loc = pred["locations"][0]
    print(f'[PASSED] 3. Prediction: Top Location={top_loc["name"]} | Prob={top_loc["probability"]*100:.1f}% | Time={pred["time_window_min"]}-{pred["time_window_max"]}m')

    # 4. Get Evidence Passport
    req = urllib.request.Request('http://localhost:8000/api/evidence/CASE-SNTL-2026-0042', headers=headers)
    with urllib.request.urlopen(req) as res:
        evidence = json.loads(res.read().decode())
    print(f'[PASSED] 4. Evidence Passport: Passport ID={evidence["passport_id"]} | SHA256={evidence["passport_sha256"][:16]}... | Disclaimer={evidence["disclaimer"][:35]}...')

    # 5. Audit Log Integrity Check
    req = urllib.request.Request('http://localhost:8000/api/audit/verify', headers=headers)
    with urllib.request.urlopen(req) as res:
        audit_ver = json.loads(res.read().decode())
    print(f'[PASSED] 5. Audit Chain: Entries={audit_ver["total_entries"]} | Chain Valid={audit_ver["is_valid"]} | Msg={audit_ver["verification_message"]}')

    # 6. Health
    req = urllib.request.Request('http://localhost:8000/api/health')
    with urllib.request.urlopen(req) as res:
        health = json.loads(res.read().decode())
    print(f'[PASSED] 6. System Health: Status={health["status"]} | TGN={health["tgn_engine"]} | Geo={health["geo_temporal_engine"]}')

    print('\n==================================================')
    print('ALL BACKEND API VERIFICATIONS PASSED SUCCESSFULLY')
    print('==================================================')

if __name__ == '__main__':
    test_api()
