"""
Servicio de recordatorios personalizados para RatGym.
Genera recordatorios automáticos de clases y rutinas.
"""

from datetime import datetime
from typing import Dict, List, Optional
import random

from src.models.notification_models import NotificationCreate
from src.services.notification_service import NotificationService


class ReminderService:
    """Servicio para generar recordatorios personalizados."""
    
    def __init__(self):
        self.notification_service = NotificationService()
        
        # Mensajes motivacionales para rutinas
        self.routine_messages = [
            "💪 ¡Es hora de entrenar! Tu cuerpo te lo agradecerá.",
            "🏋️ No olvides tu rutina de hoy. ¡Cada repetición cuenta!",
            "⚡ Tu entrenamiento te espera. ¡Activa ese modo bestia!",
            "🔥 ¿Listo para quemar calorías? Tu rutina está esperándote.",
            "💥 ¡Vamos! Es momento de superar tus límites.",
            "🎯 Recuerda: la constancia es la clave del éxito. ¡A entrenar!",
            "🚀 Tu mejor versión te espera en el gimnasio. ¡Dale!",
        ]
        
        # Mensajes para clases
        self.class_messages = [
            "🎯 Tu clase grupal empieza pronto. ¡No te la pierdas!",
            "👥 La energía del grupo te espera. ¡Únete a la clase!",
            "🏃 Es hora de la clase. ¡Prepárate para dar lo mejor!",
            "⏰ Recordatorio: tu clase está por comenzar. ¡Corre!",
            "🌟 La clase de hoy será increíble. ¡Te esperamos!",
        ]
        
        # Mensajes de nutrición
        self.nutrition_messages = [
            "🥗 ¿Ya planificaste tus comidas de hoy? ¡Come saludable!",
            "🍎 Recuerda mantener tu alimentación balanceada.",
            "💧 No olvides hidratarte. El agua es esencial.",
            "🥤 ¿Has tomado suficiente agua hoy? ¡Hidrátate!",
        ]

    def generate_routine_reminder(self, user_id: str, routine_name: str = None) -> Dict:
        """Genera un recordatorio de rutina personalizado."""
        message = random.choice(self.routine_messages)
        
        if routine_name:
            message = f"{message}\n📋 Tu rutina: {routine_name}"
        
        return {
            "user_id": user_id,
            "title": "🏋️ Recordatorio de Entrenamiento",
            "message": message,
            "type": "DAILY_ROUTINE",
            "priority": "HIGH",
            "metadata": {
                "reminder_type": "routine",
                "routine_name": routine_name,
                "generated_at": datetime.now().isoformat()
            }
        }

    def generate_class_reminder(self, user_id: str, class_name: str, 
                                 start_time: str, minutes_before: int = 30) -> Dict:
        """Genera un recordatorio de clase."""
        base_message = random.choice(self.class_messages)
        
        return {
            "user_id": user_id,
            "title": f"⏰ Clase en {minutes_before} minutos",
            "message": f"{base_message}\n📍 {class_name} a las {start_time}",
            "type": "CLASS_REMINDER",
            "priority": "HIGH",
            "metadata": {
                "reminder_type": "class",
                "class_name": class_name,
                "start_time": start_time,
                "minutes_before": minutes_before,
                "generated_at": datetime.now().isoformat()
            }
        }

    def generate_nutrition_reminder(self, user_id: str, meal_type: str = None) -> Dict:
        """Genera un recordatorio de nutrición."""
        message = random.choice(self.nutrition_messages)
        
        meal_times = {
            "breakfast": "Desayuno",
            "lunch": "Almuerzo", 
            "dinner": "Cena",
            "snack": "Snack"
        }
        
        title = "🥗 Recordatorio de Nutrición"
        if meal_type and meal_type in meal_times:
            title = f"🍽️ Hora del {meal_times[meal_type]}"
        
        return {
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": "MEAL_REMINDER",
            "priority": "MEDIUM",
            "metadata": {
                "reminder_type": "nutrition",
                "meal_type": meal_type,
                "generated_at": datetime.now().isoformat()
            }
        }

    def generate_streak_reminder(self, user_id: str, streak_days: int) -> Dict:
        """Genera un recordatorio de racha de entrenamientos."""
        if streak_days >= 30:
            message = f"🔥 ¡INCREÍBLE! Llevas {streak_days} días consecutivos. ¡Eres imparable!"
            title = "🏆 Racha Legendaria"
        elif streak_days >= 7:
            message = f"⚡ ¡{streak_days} días seguidos! Tu constancia es admirable."
            title = "🔥 Racha en Fuego"
        elif streak_days >= 3:
            message = f"💪 Llevas {streak_days} días entrenando. ¡Mantén el ritmo!"
            title = "✨ Buena Racha"
        else:
            message = f"🌱 {streak_days} días de entrenamiento. ¡El inicio de algo grande!"
            title = "🚀 Comenzando Fuerte"
        
        return {
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": "STREAK_UPDATE",
            "priority": "MEDIUM",
            "metadata": {
                "reminder_type": "streak",
                "streak_days": streak_days,
                "generated_at": datetime.now().isoformat()
            }
        }

    def create_reminder_notification(self, reminder_data: Dict) -> bool:
        """Crea una notificación a partir de datos de recordatorio."""
        try:
            notification = NotificationCreate(**reminder_data)
            created = self.notification_service.create_notification(notification)
            print(f"✅ Recordatorio creado: {created.id} para {created.user_id}")
            return True
        except Exception as e:
            print(f"❌ Error creando recordatorio: {e}")
            return False

    def send_daily_reminders(self, user_ids: List[str]):
        """Envía recordatorios diarios a una lista de usuarios."""
        for user_id in user_ids:
            routine_reminder = self.generate_routine_reminder(user_id)
            self.create_reminder_notification(routine_reminder)
            
            nutrition_reminder = self.generate_nutrition_reminder(user_id)
            self.create_reminder_notification(nutrition_reminder)


# Singleton
reminder_service = ReminderService()
