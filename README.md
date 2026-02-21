# SHM Remnawave Agent

Легковесный агент для интеграции SHM биллинга с Remnawave API.

## Особенности

- **Использует @remnawave/backend-contract** — типобезопасные API вызовы
- **Последовательная обработка** — запросы выполняются по очереди через семафор
- **Credentials в заголовках** — `apiHost` и `token` передаются через HTTP-заголовки

## Запуск

### Docker Compose

```bash
git clone https://github.com/bkeenke/shm-remnawave-agent
cd shm-remnawave-agent

# Сборка с нужной версией @remnawave/backend-contract
docker build --build-arg REMNAWAVE_VERSION=2.6.1 -t shm-remnawave-agent .

docker compose up -d
```

## API

### Аутентификация

Все запросы требуют заголовков:

| Заголовок | Описание |
|-----------|----------|
| `X-Api-Host` | URL Remnawave API (например, `https://panel.example.com`) |
| `X-Api-Token` | Bearer токен для авторизации |

### GET /health

Health check endpoint.

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T21:00:00.000Z",
  "service": "shm-remnawave-agent"
}
```

### GET /api/status

Статус очереди агента.

```json
{
  "success": true,
  "response": {
    "service": "shm-remnawave-agent",
    "queue": {
      "isProcessing": false,
      "queueLength": 0
    }
  }
}
```

### POST /api/create

Создание нового пользователя.

```json
{
  "username": "user123",
  "expireAt": "2026-12-31T23:59:59.000Z",
  "trafficLimitBytes": 268435456000,
  "trafficLimitStrategy": "MONTH",
  "hwidDeviceLimit": 2,
  "tag": "SHM",
  "activeInternalSquads": ["uuid1", "uuid2"],
  "externalSquadUuid": "uuid"
}
```

### POST /api/activate

Активация (разблокировка) пользователя.

```json
{
  "uuid": "user-uuid",
  "expireAt": "2026-12-31T23:59:59.000Z"
}
```

### POST /api/block

Блокировка пользователя.

```json
{
  "uuid": "user-uuid"
}
```

### POST /api/remove

Удаление пользователя.

```json
{
  "uuid": "user-uuid"
}
```

### POST /api/prolongate

Продление подписки.

```json
{
  "uuid": "user-uuid",
  "expireAt": "2026-12-31T23:59:59.000Z",
  "resetTraffic": true
}
```

### POST /api/user

Получение информации о пользователе.

```json
{
  "uuid": "user-uuid"
}
```

**Ответ:**

```json
{
  "success": true,
  "response": { ... }
}
```

## Интеграция с SHM

Пример вызова из SHM шаблона:

```bash
# CREATE
curl -sk -XPOST "http://shm-agent:3100/api/create" \
  -H "Content-Type: application/json" \
  -H "X-Api-Host: $REMNAWAVE_HOST" \
  -H "X-Api-Token: $TOKEN" \
  -d '{
    "username": "shm_{{ us.id }}",
    "expireAt": "{{ new_expire }}",
    "trafficLimitBytes": {{ data_limit }},
    "trafficLimitStrategy": "{{ reset_strategy }}",
    "hwidDeviceLimit": {{ HWID_LIMIT }},
    "tag": "SHM"
  }'

# BLOCK
curl -sk -XPOST "http://shm-agent:3100/api/block" \
  -H "Content-Type: application/json" \
  -H "X-Api-Host: $REMNAWAVE_HOST" \
  -H "X-Api-Token: $TOKEN" \
  -d '{"uuid": "{{ uuid }}"}'

# PROLONGATE
curl -sk -XPOST "http://shm-agent:3100/api/prolongate" \
  -H "Content-Type: application/json" \
  -H "X-Api-Host: $REMNAWAVE_HOST" \
  -H "X-Api-Token: $TOKEN" \
  -d '{
    "uuid": "{{ uuid }}",
    "expireAt": "{{ new_expire }}",
    "resetTraffic": true
  }'
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервиса | `3100` |
| `NODE_ENV` | Окружение | `production` |

## Лицензия

AGPL-3.0-only
