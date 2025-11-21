# Teacher Timetable Manager

Backend API для управления расписанием преподавателей и системы бронирования встреч студентами.

## Технологии

- **FastAPI** - современный веб-фреймворк для создания API
- **SQLAlchemy** - ORM для работы с базой данных
- **Alembic** - инструмент для миграций базы данных
- **PostgreSQL** - реляционная база данных
- **JWT** - аутентификация с access и refresh токенами
- **Pydantic** - валидация данных

## Возможности

- ✅ Регистрация и аутентификация пользователей (JWT)
- ✅ Роли: student, teacher, admin
- ✅ Управление слотами доступности преподавателей
- ✅ Бронирование встреч студентами
- ✅ Подтверждение и отмена встреч
- ✅ Просмотр расписания и встреч
- ✅ Автоматическая документация API (Swagger/ReDoc)

## Структура проекта

```
app/
├── main.py                 # Точка входа FastAPI приложения
├── core/
│   ├── config.py          # Конфигурация и настройки
│   ├── security.py        # JWT и хеширование паролей
│   └── database.py        # Подключение к БД
├── models/                # SQLAlchemy модели
│   ├── user.py
│   ├── availability.py
│   └── booking.py
├── schemas/               # Pydantic схемы
│   ├── user.py
│   ├── availability.py
│   └── booking.py
├── api/
│   ├── routes/           # API эндпоинты
│   │   ├── auth.py
│   │   ├── teachers.py
│   │   ├── bookings.py
│   │   └── students.py
│   └── deps.py           # Зависимости (аутентификация)
├── services/             # Бизнес-логика
│   ├── auth_service.py
│   ├── booking_service.py
│   └── notification_service.py
└── utils/                # Утилиты
    ├── jwt.py
    └── email.py
```

## Установка и запуск

### Через Docker Compose (рекомендуется)

1. Убедитесь, что Docker и Docker Compose установлены
2. Клонируйте репозиторий
3. Запустите проект:

```bash
docker-compose up --build
```

API будет доступен по адресу: http://localhost:5000

### Локальный запуск

1. Установите зависимости:
```bash
pip install uv
uv sync
```

2. Настройте переменные окружения (скопируйте .env.example в .env):
```bash
cp .env.example .env
```

3. Запустите PostgreSQL (или используйте существующий)

4. Выполните миграции:
```bash
alembic upgrade head
```

5. Запустите сервер:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

## API эндпоинты

### Аутентификация

- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/refresh` - Обновление access токена
- `GET /api/auth/users/me` - Получить текущего пользователя

### Преподаватели

- `GET /api/teachers` - Список всех преподавателей
- `GET /api/teachers/{teacher_id}/availability` - Доступные слоты преподавателя
- `POST /api/teachers/{teacher_id}/availability` - Создать слот (только teacher)
- `PUT /api/teachers/availability/{id}` - Обновить слот (только teacher)
- `DELETE /api/teachers/availability/{id}` - Удалить слот (только teacher)

### Бронирование

- `POST /api/bookings` - Создать бронирование (только student)
- `GET /api/bookings` - Список своих бронирований
- `PUT /api/bookings/{id}/confirm` - Подтвердить бронирование (только teacher)
- `DELETE /api/bookings/{id}` - Отменить бронирование

### Студенты

- `GET /api/students/my-bookings` - Список бронирований студента

### Служебные

- `GET /health` - Проверка работоспособности API

## Документация API

После запуска проекта автоматическая документация доступна по адресам:

- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

## Переменные окружения

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/ttm
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Миграции базы данных

Создание новой миграции:
```bash
alembic revision --autogenerate -m "описание изменений"
```

Применение миграций:
```bash
alembic upgrade head
```

Откат миграции:
```bash
alembic downgrade -1
```

## Разработка

Проект следует PEP8 и использует type hints для всех функций.

### Пример использования API

1. Регистрация пользователя:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "full_name": "John Doe",
    "password": "secretpass",
    "role": "teacher"
  }'
```

2. Вход:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "secretpass"
  }'
```

3. Создание слота доступности (требуется токен):
```bash
curl -X POST http://localhost:5000/api/teachers/1/availability \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "2024-12-01T10:00:00",
    "end_time": "2024-12-01T11:00:00"
  }'
```

## Лицензия

MIT
