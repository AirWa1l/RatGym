import json
from typing import Dict, Optional
from datetime import datetime

def handle_event(event: Dict) -> Optional[Dict]:
    """
    Punto único de entrada para eventos RabbitMQ.
    Transforma eventos de otros microservicios en notificaciones.
    
    Returns:
        Dict con datos para crear notificación, o None si el evento no es relevante
    """
    event_type = event.get("type")
    data = event.get("data", {})
    
    # === EVENTOS DE USUARIOS ===
    if event_type == "user.created":
        return {
            "user_id": data.get("user_id"),
            "title": "¡Bienvenido a RatGym! 🎉",
            "message": f"Hola {data.get('name', 'atleta')}, tu cuenta ha sido creada exitosamente. ¡Comienza tu transformación hoy!",
            "type": "SYSTEM_INFO",
            "priority": "MEDIUM",
            "metadata": data
        }
    
    # === EVENTOS DE RUTINAS ===
    if event_type == "routine.created":
        return {
            "user_id": data.get("user_id"),
            "title": "Nueva rutina asignada 💪",
            "message": f"Se ha creado tu rutina '{data.get('routine_name', 'personalizada')}' ({data.get('difficulty', 'intermedio')}) con {data.get('exercises_count', 0)} ejercicios. Duración estimada: {data.get('duration_minutes', 60)} minutos. ¡Es hora de entrenar!",
            "type": "ROUTINE_ASSIGNED",
            "priority": "HIGH",
            "metadata": data
        }
    
    if event_type == "routine.completed":
        return {
            "user_id": data.get("user_id"),
            "title": "¡Entrenamiento completado! 🎖️",
            "message": f"Excelente trabajo completando la rutina '{data.get('routine_name', '')}'. Has completado esta rutina {data.get('times_completed', 1)} veces. ¡Sigue así!",
            "type": "ROUTINE_COMPLETED",
            "priority": "MEDIUM",
            "metadata": data
        }
    
    if event_type == "routine.daily_reminder":
        return {
            "user_id": data.get("user_id"),
            "title": f"Entreno del día {data.get('day_number', 1)} 🏋️",
            "message": f"Esta es tu rutina de hoy: {data.get('exercises', 'Revisa tu plan de entrenamiento')}. ¡Dale con todo!",
            "type": "DAILY_ROUTINE",
            "priority": "HIGH",
            "metadata": data
        }
    
    if event_type == "routine.rest_day":
        return {
            "user_id": data.get("user_id"),
            "title": "Día de descanso 😴",
            "message": "Hoy es tu día de descanso. Recupérate bien para el próximo entrenamiento.",
            "type": "ROUTINE_REST",
            "priority": "LOW",
            "metadata": data
        }
    
    # === EVENTOS DE NUTRICIÓN ===
    if event_type == "nutrition.plan_created":
        return {
            "user_id": data.get("user_id"),
            "title": "Plan nutricional disponible 🥗",
            "message": f"Tu plan nutricional está listo: {data.get('calories', '2000')} calorías diarias ({data.get('protein', 0)}g proteína, {data.get('carbs', 0)}g carbohidratos, {data.get('fat', 0)}g grasas). Objetivo: {data.get('objective', 'mantener peso').replace('_', ' ').lower()}. ¡A comer saludable!",
            "type": "NUTRITION_PLAN",
            "priority": "HIGH",
            "metadata": data
        }
    
    if event_type == "nutrition.meal_reminder":
        return {
            "user_id": data.get("user_id"),
            "title": f"Hora de {data.get('meal_type', 'comer')} 🍽️",
            "message": f"Recuerda tu {data.get('meal_type', 'comida')}: {data.get('meal_description', 'revisa tu plan nutricional')}",
            "type": "MEAL_REMINDER",
            "priority": "MEDIUM",
            "metadata": data
        }
    
    if event_type == "nutrition.goal_achieved":
        return {
            "user_id": data.get("user_id"),
            "title": "¡Meta alcanzada! 🏆",
            "message": f"Has alcanzado tu meta de {data.get('goal_type', 'nutrición')}. ¡Felicitaciones!",
            "type": "GOAL_ACHIEVED",
            "priority": "HIGH",
            "metadata": data
        }
    
    # === EVENTOS DE CLASES ===
    # === EVENTOS DE CLASES ===
    if event_type == "class.scheduled":
        return {
            "user_id": data.get("user_id"),
            "title": "Nueva clase disponible 📅",
            "message": f"Clase de {data.get('class_name', 'fitness')} con {data.get('instructor', 'instructor')} programada para el {data.get('date', 'próximo día')} a las {data.get('start_time', 'hora asignada')}. Duración: {data.get('duration', 60)} minutos.",
            "type": "CLASS_SCHEDULED",
            "priority": "MEDIUM",
            "metadata": data
        }
    
    if event_type == "class.booked":
        return {
            "user_id": data.get("user_id"),
            "title": "Reserva confirmada ✅",
            "message": f"Has reservado tu lugar en la clase de {data.get('class_name', 'fitness')} con {data.get('instructor', 'instructor')} el {data.get('date', 'próximo día')} a las {data.get('start_time', 'hora programada')}. ¡Te esperamos!",
            "type": "CLASS_BOOKED",
            "priority": "HIGH",
            "metadata": data
        }
    
    if event_type == "class.cancelled":
        return {
            "user_id": data.get("user_id"),
            "title": "Reserva cancelada ❌",
            "message": f"Has cancelado tu reserva para la clase de {data.get('class_name')} del {data.get('date', 'día programado')} a las {data.get('start_time', 'hora')}.",
            "type": "CLASS_CANCELLED",
            "priority": "MEDIUM",
            "metadata": data
        }
    
    if event_type == "class.attended":
        return {
            "user_id": data.get("user_id"),
            "title": "¡Asistencia registrada! 🎉",
            "message": f"Excelente trabajo en la clase de {data.get('class_name', 'fitness')} con {data.get('instructor', 'instructor')}. Sigue así!",
            "type": "CLASS_ATTENDED",
            "priority": "MEDIUM",
            "metadata": data
        }
    
    if event_type == "class.reminder":
        return {
            "user_id": data.get("user_id"),
            "title": "Recordatorio de clase ⏰",
            "message": f"Tu clase de {data.get('class_name')} comienza en {data.get('minutes_before', 30)} minutos. ¡Prepárate!",
            "type": "CLASS_REMINDER",
            "priority": "HIGH",
            "metadata": data
        }
    
    # === EVENTOS GENERALES ===
    if event_type == "system.maintenance":
        return {
            "user_id": data.get("user_id", "all"),
            "title": "Mantenimiento del sistema 🔧",
            "message": f"El sistema estará en mantenimiento el {data.get('date', 'próximamente')}. {data.get('details', '')}",
            "type": "SYSTEM_INFO",
            "priority": "LOW",
            "metadata": data
        }
    
    # Evento no reconocido
    print(f"[!] Evento no manejado: {event_type}")
    return None

