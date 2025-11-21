from app.utils.email import send_email


class NotificationService:
    @staticmethod
    async def notify_booking_created(teacher_email: str, student_name: str, start_time: str):
        subject = "Новый запрос на бронирование"
        body = f"{student_name} запросил бронирование на  {start_time}. Пожалуйста, подтвердите или отмените заказ."
        await send_email(teacher_email, subject, body)

    @staticmethod
    async def notify_booking_confirmed(student_email: str, teacher_name: str, start_time: str):
        subject = "Бронирование подтверждено"
        body = f"Ваше бронирование с помощью {teacher_name} на {start_time} подтверждено."
        await send_email(student_email, subject, body)

    @staticmethod
    async def notify_booking_cancelled(email: str, start_time: str):
        subject = "Бронирование отменено"
        body = f"Бронирование на {start_time} было отменено."
        await send_email(email, subject, body)
