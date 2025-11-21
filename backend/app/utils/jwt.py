from typing import Optional
from app.core.security import decode_token
from app.schemas.user import TokenPayload


def verify_token(token: str, token_type: str = "access") -> Optional[TokenPayload]:
    payload = decode_token(token)
    if not payload:
        return None
    
    if payload.get("type") != token_type:
        return None
    
    token_data = TokenPayload(**payload)
    return token_data
