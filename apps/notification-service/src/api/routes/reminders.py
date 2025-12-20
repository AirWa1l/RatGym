"""
Rutas de API para recordatorios personalizados.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from src.services.reminder_service import reminder_service

router = APIRouter(prefix="/reminders", tags=["Reminders"])


class RoutineReminderRequest(BaseModel):
    user_id: str
    routine_name: Optional[str] = None


class ClassReminderRequest(BaseModel):
    user_id: str
    class_name: str
    start_time: str
    minutes_before: int = 30


class NutritionReminderRequest(BaseModel):
    user_id: str
    meal_type: Optional[str] = None


class StreakReminderRequest(BaseModel):
    user_id: str
    streak_days: int


class BulkRemindersRequest(BaseModel):
    user_ids: List[str]


@router.post("/routine")
async def create_routine_reminder(request: RoutineReminderRequest):
    """Crea un recordatorio de rutina personalizado."""
    reminder_data = reminder_service.generate_routine_reminder(
        user_id=request.user_id,
        routine_name=request.routine_name
    )
    success = reminder_service.create_reminder_notification(reminder_data)
    
    if success:
        return {"success": True, "message": "Recordatorio de rutina creado"}
    raise HTTPException(status_code=500, detail="Error creando recordatorio")


@router.post("/class")
async def create_class_reminder(request: ClassReminderRequest):
    """Crea un recordatorio de clase."""
    reminder_data = reminder_service.generate_class_reminder(
        user_id=request.user_id,
        class_name=request.class_name,
        start_time=request.start_time,
        minutes_before=request.minutes_before
    )
    success = reminder_service.create_reminder_notification(reminder_data)
    
    if success:
        return {"success": True, "message": "Recordatorio de clase creado"}
    raise HTTPException(status_code=500, detail="Error creando recordatorio")


@router.post("/nutrition")
async def create_nutrition_reminder(request: NutritionReminderRequest):
    """Crea un recordatorio de nutrición."""
    reminder_data = reminder_service.generate_nutrition_reminder(
        user_id=request.user_id,
        meal_type=request.meal_type
    )
    success = reminder_service.create_reminder_notification(reminder_data)
    
    if success:
        return {"success": True, "message": "Recordatorio de nutrición creado"}
    raise HTTPException(status_code=500, detail="Error creando recordatorio")


@router.post("/streak")
async def create_streak_reminder(request: StreakReminderRequest):
    """Crea un recordatorio de racha."""
    reminder_data = reminder_service.generate_streak_reminder(
        user_id=request.user_id,
        streak_days=request.streak_days
    )
    success = reminder_service.create_reminder_notification(reminder_data)
    
    if success:
        return {"success": True, "message": "Recordatorio de racha creado"}
    raise HTTPException(status_code=500, detail="Error creando recordatorio")


@router.post("/daily-batch")
async def send_daily_reminders_batch(request: BulkRemindersRequest):
    """Envía recordatorios diarios a múltiples usuarios."""
    reminder_service.send_daily_reminders(request.user_ids)
    return {
        "success": True, 
        "message": f"Recordatorios enviados a {len(request.user_ids)} usuarios"
    }


@router.post("/welcome/{user_id}")
async def send_welcome_reminders(user_id: str):
    """Envía recordatorios de bienvenida a un nuevo usuario."""
    reminders_sent = []
    
    routine_data = reminder_service.generate_routine_reminder(user_id)
    if reminder_service.create_reminder_notification(routine_data):
        reminders_sent.append("routine")
    
    nutrition_data = reminder_service.generate_nutrition_reminder(user_id)
    if reminder_service.create_reminder_notification(nutrition_data):
        reminders_sent.append("nutrition")
    
    return {
        "success": True,
        "message": f"Recordatorios enviados: {', '.join(reminders_sent)}"
    }
