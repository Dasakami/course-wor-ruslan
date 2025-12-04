from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User, UserRole
from app.models.availability import Availability
from app.models.booking import Booking, BookingStatus
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  
)

Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

if not db.query(User).filter_by(email="dan@gmail.com").first():
    user = User(
        email="dan@gmail.com",
        full_name="Dan Example",
        hashed_password="fakehashedpassword",
        role=UserRole.student
    )
    db.add(user)
    db.commit()
    print("Тестовый пользователь создан!")

db.close()
print("Все таблицы созданы успешно!")
