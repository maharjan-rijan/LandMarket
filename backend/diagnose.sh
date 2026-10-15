#!/usr/bin/env bash
# Finds out why the admin dashboard cannot load its data.
#
#   bash diagnose.sh                          (API at http://127.0.0.1:8000/api)
#   bash diagnose.sh http://landmarket.test/api
#
# Needs the seeded admin account (php artisan db:seed).

API="${1:-http://127.0.0.1:8000/api}"
PATHS=(/lands /stores /admin/lands /admin/users /admin/stores /admin/summary)

TOKEN=$(curl -s -X POST "$API/auth/login" -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{"email":"admin@landmarket.test","password":"password"}' | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Could not log in as admin@landmarket.test at $API"
  echo "  - Is the server running?   php artisan serve"
  echo "  - Is the data seeded?      php artisan db:seed"
  exit 1
fi
echo "Logged in as admin at $API"

echo
echo "1) One request at a time"
bad=0
for p in "${PATHS[@]}"; do
  code=$(curl -s -o /tmp/diag_body -w "%{http_code}" "$API$p" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN")
  printf "   %-16s %s\n" "$p" "$code"
  if [ "$code" != "200" ]; then
    bad=1
    echo "      reply: $(head -c 350 /tmp/diag_body | tr '\n' ' ')"
  fi
done

echo
echo "2) All six at the same time (what a browser does)"
for p in "${PATHS[@]}"; do
  ( code=$(curl -s -o /dev/null -w "%{http_code}" "$API$p" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN")
    printf "   %-16s %s\n" "$p" "$code" ) &
done
wait

echo
echo "How to read this"
echo "  000   no answer at all (the connection was dropped)"
echo "  500   Laravel crashed. The reason is the last lines of storage/logs/laravel.log:"
echo "          tail -n 40 storage/logs/laravel.log"
echo "  403   the 'role' middleware alias is registered but this user is not an admin"
echo "  1) all 200 but 2) shows 000   php artisan serve is single-threaded. Restart it with:"
echo "          PHP_CLI_SERVER_WORKERS=4 php artisan serve"
[ "$bad" -eq 0 ]
