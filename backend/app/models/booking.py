from sqlalchemy import Column, Integer,  DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    availability_id = Column(Integer, ForeignKey("availabilities.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.pending, nullable=False)
    created_at = Column(DateTime, nullable=False)

    availability = relationship("Availability", back_populates="booking")
    student = relationship("User", foreign_keys=[student_id], back_populates="student_bookings")
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="teacher_bookings")
