from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .config import settings
from .database import Base, engine, get_db
from .models import Attendance, Employee
from .schemas import AttendanceCreate, AttendanceOut, AttendanceWithEmployee, DashboardSummary, EmployeeCreate, EmployeeOut

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

allowed_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "HRMS Lite API is running"}


@app.get(f"{settings.api_prefix}/health")
def health_check():
    return {"status": "ok"}


@app.post(f"{settings.api_prefix}/employees", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    employee = Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    db.add(employee)
    try:
        db.commit()
        db.refresh(employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Employee ID or email already exists")
    return employee


@app.get(f"{settings.api_prefix}/employees", response_model=list[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return db.query(Employee).order_by(Employee.created_at.desc()).all()


@app.delete(f"{settings.api_prefix}/employees/{{employee_id}}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()


@app.post(f"{settings.api_prefix}/attendance", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    attendance = Attendance(employee_id=payload.employee_id, date=payload.date, status=payload.status)
    db.add(attendance)
    try:
        db.commit()
        db.refresh(attendance)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Attendance for this employee and date already exists")
    return attendance


@app.get(f"{settings.api_prefix}/attendance", response_model=list[AttendanceWithEmployee])
def list_attendance(
    employee_id: int | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance, Employee.full_name).join(Employee, Attendance.employee_id == Employee.id)

    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    rows = query.order_by(Attendance.date.desc(), Attendance.created_at.desc()).all()
    return [
        AttendanceWithEmployee(
            id=attendance.id,
            employee_id=attendance.employee_id,
            date=attendance.date,
            status=attendance.status,
            created_at=attendance.created_at,
            employee_name=employee_name,
        )
        for attendance, employee_name in rows
    ]


@app.get(f"{settings.api_prefix}/employees/{{employee_id}}/attendance", response_model=list[AttendanceOut])
def get_employee_attendance(employee_id: int, db: Session = Depends(get_db)):
    employee = db.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id)
        .order_by(Attendance.date.desc(), Attendance.created_at.desc())
        .all()
    )


@app.get(f"{settings.api_prefix}/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    today = date.today()

    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    total_attendance_records = db.query(func.count(Attendance.id)).scalar() or 0
    present_today = (
        db.query(func.count(Attendance.id))
        .filter(Attendance.date == today, Attendance.status == "Present")
        .scalar()
        or 0
    )
    absent_today = (
        db.query(func.count(Attendance.id))
        .filter(Attendance.date == today, Attendance.status == "Absent")
        .scalar()
        or 0
    )

    return DashboardSummary(
        total_employees=total_employees,
        total_attendance_records=total_attendance_records,
        present_today=present_today,
        absent_today=absent_today,
    )
