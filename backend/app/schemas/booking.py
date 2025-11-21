from pydantic import BaseModel
from datetime import datetime
from app.models.booking import BookingStatus


class BookingBase(BaseModel):
    availability_id: int


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: int
    student_id: int
    teacher_id: int
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True


class BookingWithDetails(BookingResponse):
    start_time: datetime
    end_time: datetime
    teacher_name: str
    student_name: str
