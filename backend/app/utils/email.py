async def send_email(to_email: str, subject: str, body: str) -> bool:
    print(f"Отправка электронного письма по адресу {to_email}")
    print(f"Предмет: {subject}")
    print(f"Контент: {body}")
    return True
