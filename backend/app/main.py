from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, teachers, bookings, students

app = FastAPI(
    title="Менеджер по расписанию учителей",
    description="API для управления расписаниями преподавателей и бронированием мест для студентов",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(teachers.router)
app.include_router(bookings.router)
app.include_router(students.router)


@app.get("/health")
def health_check():
    return {"status": "OK"}
