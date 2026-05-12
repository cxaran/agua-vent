import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class SubscriptionCreate(BaseModel):
    user_id: uuid.UUID
    is_active: bool = False
    starts_at: Optional[datetime] = None
    cutoff_date: Optional[date] = None
    last_payment_at: Optional[date] = None
    max_users: int = 1


class SubscriptionUpdate(BaseModel):
    is_active: Optional[bool] = None
    starts_at: Optional[datetime] = None
    cutoff_date: Optional[date] = None
    last_payment_at: Optional[date] = None
    max_users: Optional[int] = None


class PaymentRegister(BaseModel):
    paid_at: date
    new_cutoff_date: date


class SubscriptionRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    is_active: bool
    starts_at: Optional[datetime] = None
    cutoff_date: Optional[date] = None
    last_payment_at: Optional[date] = None
    max_users: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SubscriptionListItem(SubscriptionRead):
    owner_name: str
    owner_last_name: str
    owner_email: EmailStr
    days_to_cutoff: Optional[int] = None
    status: str


class SubscriptionStats(BaseModel):
    total: int
    active: int
    inactive: int
    expired: int
    due_soon: int
    without_cutoff_date: int


class UserSearchResult(BaseModel):
    id: uuid.UUID
    name: str
    last_name: str
    email: EmailStr
    is_active: bool
    has_subscription: bool

    model_config = ConfigDict(from_attributes=True)
