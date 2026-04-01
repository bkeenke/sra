#!/bin/bash

# Load test: создание 500 пользователей через SRA

SRA_URL="http://localhost:3100"
API_HOST=""
API_TOKEN=""
COUNT="500"
CONCURRENCY="4"

SUCCEEDED=0
FAILED=0
TOTAL_TIME=0
START=$(date +%s)

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "=== SRA Load Test ==="
echo "Target: $SRA_URL"
echo "Users: $COUNT, Concurrency: $CONCURRENCY"
echo ""

create_user() {
    local i=$1
    local username="loadtest_$(printf '%04d' $i)_$(date +%s%N | tail -c 6)"
    local expire=$(date -u -v+30d '+%Y-%m-%dT%H:%M:%S.000Z' 2>/dev/null || date -u -d '+30 days' '+%Y-%m-%dT%H:%M:%S.000Z')

    local start_ms=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time()*1000')

    local http_code
    http_code=$(curl -s -o "$TMPDIR/resp_$i" -w "%{http_code}" \
        -XPOST "$SRA_URL/api/create" \
        -H "Content-Type: application/json" \
        -H "X-Api-Host: $API_HOST" \
        -H "X-Api-Token: $API_TOKEN" \
        -d "{
            \"username\": \"$username\",
            \"expireAt\": \"$expire\",
            \"trafficLimitBytes\": 10737418240,
            \"trafficLimitStrategy\": \"MONTH\",
            \"activeInternalSquads\": [ \"7911d081-e697-4d2b-b10a-25ffcfd53cde\" ]
        }")

    local end_ms=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time()*1000')
    local duration=$((end_ms - start_ms))

    if [ "$http_code" = "200" ]; then
        echo "$duration OK" > "$TMPDIR/result_$i"
    else
        echo "$duration FAIL:$http_code" > "$TMPDIR/result_$i"
    fi
}

# Запуск с ограничением параллельности
active=0
for i in $(seq 1 $COUNT); do
    create_user $i &
    active=$((active + 1))

    if [ $active -ge $CONCURRENCY ]; then
        wait -n 2>/dev/null || wait
        active=$((active - 1))
    fi

    if [ $((i % 50)) -eq 0 ]; then
        echo "  Отправлено: $i/$COUNT"
    fi
done

wait
END=$(date +%s)

echo ""
echo "=== Результаты ==="

ok=0
fail=0
min_ms=999999
max_ms=0
sum_ms=0

for f in "$TMPDIR"/result_*; do
    [ -f "$f" ] || continue
    read -r ms status < "$f"

    sum_ms=$((sum_ms + ms))
    [ $ms -lt $min_ms ] && min_ms=$ms
    [ $ms -gt $max_ms ] && max_ms=$ms

    if [[ "$status" == "OK" ]]; then
        ok=$((ok + 1))
    else
        fail=$((fail + 1))
    fi
done

total=$((ok + fail))
elapsed=$((END - START))
avg_ms=$((total > 0 ? sum_ms / total : 0))
rps=$((elapsed > 0 ? total / elapsed : 0))

echo "Всего:     $total"
echo "Успешно:   $ok"
echo "Ошибки:    $fail"
echo "Время:     ${elapsed}s"
echo "RPS:       ~$rps"
echo "Latency:   min=${min_ms}ms avg=${avg_ms}ms max=${max_ms}ms"

if [ $fail -gt 0 ]; then
    echo ""
    echo "Примеры ошибок:"
    grep "FAIL" "$TMPDIR"/result_* | head -5 | while read -r line; do
        echo "  $line"
    done
fi

# Статус очереди после теста
echo ""
echo "=== Статус агента ==="
curl -s "$SRA_URL/api/status" | python3 -m json.tool 2>/dev/null || curl -s "$SRA_URL/api/status"
