from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class EmailUpdateRequest(BaseModel):
    current_password: str
    new_email: EmailStr


class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=72)


class AccountDeleteRequest(BaseModel):
    current_password: str
