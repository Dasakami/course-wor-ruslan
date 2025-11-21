from fastapi import APIRouter, Depends,  status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, BookingWithDetails
from app.services.booking_service import BookingService
from app.api.deps import get_current_user, get_student, get_teacher
from typing import List

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student)
):
    booking = BookingService.create_booking(db, booking_data, current_user.id)
    return booking


@router.get("", response_model=List[BookingWithDetails])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = BookingService.get_user_bookings(db, current_user.id, current_user.role.value)
    return bookings


@router.put("/{booking_id}/confirm", response_model=BookingResponse)
def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher)
):
    booking = BookingService.confirm_booking(db, booking_id, current_user.id)
    return booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    BookingService.cancel_booking(db, booking_id, current_user.id)
