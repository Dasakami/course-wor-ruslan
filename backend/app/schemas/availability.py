from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AvailabilityBase(BaseModel):
    start_time: datetime
    end_time: datetime


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class AvailabilityResponse(AvailabilityBase):
    id: int
    teacher_id: int
    is_booked: bool

    class Config:
        from_attributes = True
