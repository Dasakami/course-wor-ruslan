from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.student)

    availabilities = relationship("Availability", back_populates="teacher", cascade="all, delete-orphan")
    teacher_bookings = relationship("Booking", foreign_keys="Booking.teacher_id", back_populates="teacher")
    student_bookings = relationship("Booking", foreign_keys="Booking.student_id", back_populates="student")
