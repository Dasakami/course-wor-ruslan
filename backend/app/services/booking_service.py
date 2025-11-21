from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.booking import Booking, BookingStatus
from app.models.availability import Availability
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingWithDetails
from datetime import datetime
from typing import List


class BookingService:
    @staticmethod
    def create_booking(db: Session, booking_data: BookingCreate, student_id: int) -> Booking:
        availability = db.query(Availability).filter(
            Availability.id == booking_data.availability_id
        ).first()
        
        if not availability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Свободный слот не найден"
            )
        
        if availability.is_booked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Это место уже забронировано"
            )
        
        if availability.start_time < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удается забронировать прошедший временной интервал"
            )
        
        booking = Booking(
            availability_id=booking_data.availability_id,
            student_id=student_id,
            teacher_id=availability.teacher_id,
            status=BookingStatus.pending,
            created_at=datetime.utcnow()
        )
        
        availability.is_booked = True
        
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def confirm_booking(db: Session, booking_id: int, teacher_id: int) -> Booking:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Бронирование не найдено"
            )
        
        if booking.teacher_id != teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Не авторизован для подтверждения этого бронирования"
            )
        
        booking.status = BookingStatus.confirmed
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def cancel_booking(db: Session, booking_id: int, user_id: int) -> Booking:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Бронирование не найдено"
            )
        
        if booking.student_id != user_id and booking.teacher_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Мы не уполномочены отменять это бронирование"
            )
        
        booking.status = BookingStatus.cancelled
        availability = db.query(Availability).filter(
            Availability.id == booking.availability_id
        ).first()
        
        if availability:
            availability.is_booked = False
        
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def get_user_bookings(db: Session, user_id: int, role: str) -> List[BookingWithDetails]:
        if role == "teacher":
            bookings = db.query(Booking).filter(Booking.teacher_id == user_id).all()
        else:
            bookings = db.query(Booking).filter(Booking.student_id == user_id).all()
        
        result = []
        for booking in bookings:
            availability = db.query(Availability).filter(
                Availability.id == booking.availability_id
            ).first()
            teacher = db.query(User).filter(User.id == booking.teacher_id).first()
            student = db.query(User).filter(User.id == booking.student_id).first()
            
            result.append(BookingWithDetails(
                id=booking.id,
                availability_id=booking.availability_id,
                student_id=booking.student_id,
                teacher_id=booking.teacher_id,
                status=booking.status,
                created_at=booking.created_at,
                start_time=availability.start_time,
                end_time=availability.end_time,
                teacher_name=teacher.full_name,
                student_name=student.full_name
            ))
        
        return result
