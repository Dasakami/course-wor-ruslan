from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.availability import Availability
from app.schemas.availability import AvailabilityCreate, AvailabilityUpdate, AvailabilityResponse
from app.schemas.user import UserResponse
from app.api.deps import get_current_user, get_teacher
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/api/teachers", tags=["teachers"])


@router.get("", response_model=List[UserResponse])
def get_teachers(db: Session = Depends(get_db)):
    teachers = db.query(User).filter(User.role == UserRole.teacher).all()
    return teachers


@router.get("/{teacher_id}/availability", response_model=List[AvailabilityResponse])
def get_teacher_availability(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == UserRole.teacher).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    availabilities = db.query(Availability).filter(
        Availability.teacher_id == teacher_id,
        Availability.is_booked == False,
        Availability.start_time > datetime.utcnow()
    ).all()
    return availabilities


from datetime import datetime, timezone

@router.post("/{teacher_id}/availability", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
def create_availability(
    teacher_id: int,
    availability_data: AvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher)
):
    if current_user.id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create availability for another teacher"
        )

    if availability_data.start_time >= availability_data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )

    # Преобразуем naive datetime в UTC-aware
    start_time_utc = availability_data.start_time.replace(tzinfo=timezone.utc)
    end_time_utc = availability_data.end_time.replace(tzinfo=timezone.utc)
    now_utc = datetime.now(timezone.utc)

    if start_time_utc < now_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create availability in the past"
        )

    availability = Availability(
        teacher_id=teacher_id,
        start_time=start_time_utc,
        end_time=end_time_utc,
        is_booked=False
    )
    db.add(availability)
    db.commit()
    db.refresh(availability)
    return availability


@router.put("/availability/{availability_id}", response_model=AvailabilityResponse)
def update_availability(
    availability_id: int,
    availability_data: AvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher)
):
    availability = db.query(Availability).filter(Availability.id == availability_id).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    
    if availability.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update another teacher's availability"
        )
    
    if availability.is_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a booked slot"
        )
    
    if availability_data.start_time:
        availability.start_time = availability_data.start_time
    if availability_data.end_time:
        availability.end_time = availability_data.end_time
    
    if availability.start_time >= availability.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )
    
    db.commit()
    db.refresh(availability)
    return availability


@router.delete("/availability/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_teacher)
):
    availability = db.query(Availability).filter(Availability.id == availability_id).first()
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    
    if availability.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another teacher's availability"
        )
    
    if availability.is_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a booked slot"
        )
    
    db.delete(availability)
    db.commit()
