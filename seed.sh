#!/bin/sh
API="https://sen320-hash-ctf.ryantratajczak.workers.dev"

USERS="
admin:admin123
alice:password
bob:letmein1
charlie:qwerty12
dave:12345678
eve:sunshine
frank:football
grace:monkey12
heidi:iloveyou
ivan:dragon12
judy:master12
mallory:welcome1
oscar:shadow12
peggy:12312312
trent:trustno1
"

echo "Seeding users..."
echo "$USERS" | while IFS=: read -r username password; do
  echo "Registering $username..."
  curl -s "$API/register" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$username\",\"password\":\"$password\"}"
  echo
done