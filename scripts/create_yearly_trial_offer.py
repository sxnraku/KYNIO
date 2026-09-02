import json, re, sys, urllib.request

from google.oauth2 import service_account
from google.auth.transport.requests import Request

creds = service_account.Credentials.from_service_account_file(
    sys.argv[1], scopes=["https://www.googleapis.com/auth/androidpublisher"])
creds.refresh(Request())
tok = creds.token
pkg = "com.kynio.app"

def req_(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method,
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:600]

base = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{pkg}"

url = (f"{base}/subscriptions/kynio_pro_yearly/basePlans/yearlytrue/offers"
       f"?offerId=yearly-trial-7d&regionsVersion.version=2022%2F02")
offer = {
    "packageName": pkg, "productId": "kynio_pro_yearly",
    "basePlanId": "yearlytrue", "offerId": "yearly-trial-7d",
    "otherRegionsConfig": {"otherRegionsNewSubscriberAvailability": True},
    "phases": [{
        "recurrenceCount": 1,
        "duration": "P7D",
        "otherRegionsConfig": {"free": {}},
    }],
}
s, b = req_("POST", url, offer)
print("create", s, b[:500], flush=True)

if s == 200:
    s2, b2 = req_("POST", f"{base}/subscriptions/kynio_pro_yearly/basePlans/yearlytrue/offers/yearly-trial-7d:activate")
    print("activate", s2, b2[:300], flush=True)
