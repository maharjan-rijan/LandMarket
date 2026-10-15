#!/usr/bin/env bash
# Checks the whole LandMarket API end to end, using the seeded accounts.
#
#   php artisan migrate && php artisan db:seed
#   php artisan serve            (in another terminal)
#   bash smoke-test.sh           (or: bash smoke-test.sh http://landmarket.test/api)
#
# It creates one listing and one user, then deletes the listing again.

API="${1:-http://127.0.0.1:8000/api}"
pass=0; fail=0; TMP="$(mktemp)"

token() {
  curl -s -X POST "$API/auth/login" -H "Accept: application/json" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"password\"}" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4
}

# check <label> <expected status> <METHOD> <path> [token] [json body]
check() {
  local label="$1" expect="$2" method="$3" path="$4" tok="$5" body="$6"
  local args=(-s -o "$TMP" -w "%{http_code}" -X "$method" "$API$path" -H "Accept: application/json")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$body" ] && args+=(-H "Content-Type: application/json" -d "$body")
  local code; code=$(curl "${args[@]}")
  if [ "$code" = "$expect" ]; then
    printf "  ok    %-58s %s\n" "$label" "$code"; pass=$((pass+1))
  else
    printf "  FAIL  %-58s got %s, expected %s\n" "$label" "$code" "$expect"
    head -c 400 "$TMP"; echo; fail=$((fail+1))
  fi
}

# has <label> <text>: the last response must contain the text
has() {
  if grep -q -- "$2" "$TMP"; then printf "  ok    %s\n" "$1"; pass=$((pass+1))
  else printf "  FAIL  %s\n" "$1"; head -c 300 "$TMP"; echo; fail=$((fail+1)); fi
}

echo "API: $API"
echo; echo "Logging in the seeded accounts"
ADMIN=$(token admin@landmarket.test); SELLER=$(token himal@landmarket.test); BUYER=$(token ram@landmarket.test)
for who in ADMIN SELLER BUYER; do
  if [ -z "${!who}" ]; then echo "  FAIL  could not log in as $who. Did you run: php artisan db:seed ?"; exit 1; fi
done
echo "  ok    admin, seller and buyer logged in"

echo; echo "Public"
check "GET /lands" 200 GET /lands
check "GET /lands?sort=area-asc" 200 GET "/lands?sort=area-asc"
check "GET /stores" 200 GET /stores

echo; echo "Seller adds a listing (no review step)"
check "POST /seller/lands" 201 POST /seller/lands "$SELLER" \
  '{"title":"Smoke test plot","district":"Kathmandu","municipality":"Kirtipur","ward":4,"area_aana":4,"price_per_aana":3000000,"road_ft":13,"facing":"East","description":"Created by the smoke test","documents":["Lalpurja","Trace map"]}'
has "the listing is active straight away" '"status":"active"'
LAND=$(grep -o '"id":"[^"]*"' "$TMP" | head -1 | cut -d'"' -f4)
check "the listing is public immediately" 200 GET "/lands/$LAND"
check "GET /lands?q=Smoke" 200 GET "/lands?q=Smoke"
has "search finds it" "Smoke test plot"
check "seller can close it" 200 PATCH "/seller/lands/$LAND/status" "$SELLER" '{"status":"closed"}'
check "a closed listing cannot be sold" 422 PATCH "/seller/lands/$LAND/status" "$SELLER" '{"status":"sold"}'
check "seller can reopen it" 200 PATCH "/seller/lands/$LAND/status" "$SELLER" '{"status":"active"}'

echo; echo "Admin sees it"
check "GET /admin/lands" 200 GET /admin/lands "$ADMIN"
has "the new listing is in the admin's list" "$LAND"

echo; echo "Buyer"
check "POST /lands/{id}/inquiries" 201 POST "/lands/$LAND/inquiries" "$BUYER" '{"message":"Is this plot still available?"}'
check "GET /buyer/inquiries" 200 GET /buyer/inquiries "$BUYER"
check "POST /buyer/saved/{id}" 201 POST "/buyer/saved/$LAND" "$BUYER"
check "GET /buyer/saved" 200 GET /buyer/saved "$BUYER"
check "DELETE /buyer/saved/{id}" 200 DELETE "/buyer/saved/$LAND" "$BUYER"
check "GET /buyer/demands" 200 GET /buyer/demands "$BUYER"
check "GET /buyer/purchases" 200 GET /buyer/purchases "$BUYER"

echo; echo "Seller sees the inquiry"
check "GET /seller/inquiries" 200 GET /seller/inquiries "$SELLER"
has "the buyer's inquiry is in the seller's inbox" "Is this plot still available"
check "GET /seller/store" 200 GET /seller/store "$SELLER"
check "GET /seller/demands" 200 GET /seller/demands "$SELLER"

echo; echo "A new registration shows up for the admin"
EMAIL="smoke$(date +%s)@example.com"
check "POST /auth/register (role: user)" 201 POST /auth/register "" \
  "{\"name\":\"Smoke User\",\"email\":\"$EMAIL\",\"password\":\"password123\",\"password_confirmation\":\"password123\",\"role\":\"user\"}"
check "GET /admin/users?q=<new email>" 200 GET "/admin/users?q=$EMAIL" "$ADMIN"
has "admin's user list contains the new account" "$EMAIL"
check "GET /admin/summary" 200 GET /admin/summary "$ADMIN"

echo; echo "Roles are kept apart"
check "no token: GET /seller/lands" 401 GET /seller/lands
check "buyer cannot open /admin/users" 403 GET /admin/users "$BUYER"
check "buyer cannot open /seller/lands" 403 GET /seller/lands "$BUYER"
check "seller cannot open /admin/lands" 403 GET /admin/lands "$SELLER"
check "seller cannot send an inquiry" 403 POST "/lands/$LAND/inquiries" "$SELLER" '{"message":"Trying as a seller"}'

echo; echo "Clean up"
check "DELETE /admin/lands/{id}" 204 DELETE "/admin/lands/$LAND" "$ADMIN"

rm -f "$TMP"
echo; echo "passed: $pass   failed: $fail"
[ "$fail" -eq 0 ]
