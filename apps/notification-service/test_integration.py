"""
Script de prueba para validar la integración de notification-service con otros servicios.
Emite eventos de prueba para cada tipo de servicio integrado.
"""
import pika
import json
from datetime import datetime
import time

def publish_test_events():
    """Publica eventos de prueba para cada servicio"""
    
    rabbitmq_url = 'amqp://guest:guest@localhost:5672/'
    
    try:
        connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
        channel = connection.channel()
        
        # Asegurar que la cola existe
        channel.queue_declare(queue='notifications_queue', durable=False)
        
        print("🎯 Iniciando pruebas de integración con notification-service\n")
        
        # === EVENTOS DE CLASS SERVICE ===
        print("📚 CLASS SERVICE")
        
        # 1. Clase reservada
        event1 = {
            "type": "class.booked",
            "data": {
                "user_id": "test-user-123",
                "user_name": "Juan Pérez",
                "class_id": "class-456",
                "class_name": "Yoga Matutino",
                "instructor": "María González",
                "date": datetime.now().isoformat(),
                "start_time": "07:00",
                "category": "YOGA"
            }
        }
        channel.basic_publish(
            exchange='classes',
            routing_key='class_booked',
            body=json.dumps(event1)
        )
        print("  ✅ Evento: class.booked")
        time.sleep(0.5)
        
        # 2. Clase asistida
        event2 = {
            "type": "class.attended",
            "data": {
                "user_id": "test-user-123",
                "class_id": "class-456",
                "class_name": "CrossFit WOD",
                "instructor": "Pedro Martínez",
                "category": "CROSSFIT",
                "date": datetime.now().isoformat()
            }
        }
        channel.basic_publish(
            exchange='classes',
            routing_key='class_attended',
            body=json.dumps(event2)
        )
        print("  ✅ Evento: class.attended")
        time.sleep(0.5)
        
        # === EVENTOS DE NUTRITION SERVICE ===
        print("\n🥗 NUTRITION SERVICE")
        
        event3 = {
            "type": "nutrition.plan_created",
            "data": {
                "user_id": "test-user-123",
                "calories": 2200,
                "protein": 165,
                "carbs": 220,
                "fat": 61,
                "objective": "GAIN_MUSCLE",
                "weight": 75,
                "height": 175,
                "age": 28
            }
        }
        channel.basic_publish(
            exchange='nutrition',
            routing_key='nutrition_plan_created',
            body=json.dumps(event3)
        )
        print("  ✅ Evento: nutrition.plan_created")
        time.sleep(0.5)
        
        # === EVENTOS DE ROUTINE SERVICE ===
        print("\n💪 ROUTINE SERVICE")
        
        # 1. Rutina creada
        event4 = {
            "type": "routine.created",
            "data": {
                "user_id": "test-user-123",
                "routine_id": "routine-789",
                "routine_name": "Rutina Full Body",
                "difficulty": "intermedio",
                "category": "fuerza",
                "duration_minutes": 60,
                "exercises_count": 8
            }
        }
        channel.basic_publish(
            exchange='routines',
            routing_key='routine_created',
            body=json.dumps(event4)
        )
        print("  ✅ Evento: routine.created")
        time.sleep(0.5)
        
        # 2. Rutina completada
        event5 = {
            "type": "routine.completed",
            "data": {
                "user_id": "test-user-123",
                "routine_id": "routine-789",
                "routine_name": "Rutina Full Body",
                "difficulty": "intermedio",
                "category": "fuerza",
                "times_completed": 5,
                "exercises_count": 8
            }
        }
        channel.basic_publish(
            exchange='routines',
            routing_key='routine_completed',
            body=json.dumps(event5)
        )
        print("  ✅ Evento: routine.completed")
        
        connection.close()
        
        print("\n" + "="*60)
        print("✅ Todos los eventos de prueba han sido publicados")
        print("="*60)
        print("\n📋 Verifica las notificaciones creadas:")
        print("   GET http://localhost:3006/notifications/user/test-user-123")
        print("\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  PRUEBA DE INTEGRACIÓN - NOTIFICATION SERVICE")
    print("="*60 + "\n")
    
    print("⚠️  Asegúrate de que:")
    print("  1. RabbitMQ está corriendo (puerto 5672)")
    print("  2. notification-service está corriendo (puerto 3006)")
    print("\nPresiona ENTER para continuar o Ctrl+C para cancelar...")
    input()
    
    publish_test_events()
