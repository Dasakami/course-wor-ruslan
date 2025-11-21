from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.booking import BookingWithDetails
from app.services.booking_service import BookingService
from app.api.deps import get_student
from typing import List

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("/my-bookings", response_model=List[BookingWithDetails])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student)
):
    bookings = BookingService.get_user_bookings(db, current_user.id, current_user.role.value)
    return bookings
