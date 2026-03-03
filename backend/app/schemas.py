from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class EmployeeCreate(BaseModel):
    employee_id: str = Field(min_length=2, max_length=50)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    department: str = Field(min_length=2, max_length=80)

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def strip_and_validate(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be blank")
        return cleaned


class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: Literal["Present", "Absent"]


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: Literal["Present", "Absent"]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttendanceWithEmployee(AttendanceOut):
    employee_name: str


class DashboardSummary(BaseModel):
    total_employees: int
    total_attendance_records: int
    present_today: int
    absent_today: int
