import React, { useState, useEffect } from 'react';

interface ClassItem {
  id: string;
  name: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: string;
  duration: number;
  capacity: number;
  currentBookings: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  imageUrl?: string;
}

interface Booking {
  id: string;
  classId: string;
  userId: string;
  userName: string;
  bookedAt: string;
  attended: boolean;
  class: ClassItem;
}

interface UserStats {
  totalBookings: number;
  totalAttended: number;
  totalCancelled: number;
  favoriteCategory: string;
  upcomingClasses: number;
}

interface ClassWidgetProps {
  userId: string;
  compact?: boolean;
}

const CLASS_SERVICE_URL = 'http://localhost:3003';

const categoryEmojis: Record<string, string> = {
  yoga: '🧘',
  spinning: '🚴',
  crossfit: '🏋️',
  pilates: '🤸',
  zumba: '💃',
  boxing: '🥊',
  hiit: '⚡',
  funcional: '🏃',
};

const difficultyColors: Record<string, string> = {
  principiante: '#22c55e',
  intermedio: '#f59e0b',
  avanzado: '#ef4444',
};

export const ClassWidget: React.FC<ClassWidgetProps> = ({ userId, compact = false }) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'my-bookings' | 'all'>('today');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener clases disponibles del día
      const todayRes = await fetch(`${CLASS_SERVICE_URL}/classes/available/today`);
      const todayData = await todayRes.json();
      if (todayData.success) {
        setClasses(todayData.data);
      }

      // Obtener reservas del usuario
      const bookingsRes = await fetch(`${CLASS_SERVICE_URL}/classes/user/${userId}/bookings`);
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setUserBookings(bookingsData.data);
      }

      // Obtener estadísticas
      const statsRes = await fetch(`${CLASS_SERVICE_URL}/classes/user/${userId}/stats`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (err) {
      console.error('Error fetching class data:', err);
      setError('No se pudo conectar con el servicio de clases');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (classId: string) => {
    setBooking(true);
    try {
      const res = await fetch(`${CLASS_SERVICE_URL}/classes/${classId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName: userId }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchData();
        setSelectedClass(null);
        alert('¡Clase reservada exitosamente!');
      } else {
        alert(data.message || 'Error al reservar la clase');
      }
    } catch (err) {
      console.error('Error booking class:', err);
      alert('Error al reservar la clase');
    } finally {
      setBooking(false);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      const res = await fetch(`${CLASS_SERVICE_URL}/classes/${classId}/cancel`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchData();
        alert('Reserva cancelada exitosamente');
      } else {
        alert(data.message || 'Error al cancelar la reserva');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Error al cancelar la reserva');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isClassBooked = (classId: string) => {
    return userBookings.some((b) => b.classId === classId);
  };

  const getTodayBookings = () => {
    const today = new Date().toDateString();
    return userBookings.filter((b) => {
      const classDate = new Date(b.class.date).toDateString();
      return classDate === today;
    });
  };

  if (loading) {
    return (
      <div style={{ padding: compact ? '20px' : '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#666' }}>Cargando clases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: compact ? '20px' : '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#ef4444', marginBottom: '12px' }}>{error}</p>
        <button
          onClick={fetchData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Vista compacta para el dashboard
  if (compact) {
    const todayBookings = getTodayBookings();

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px' }}>🎯</div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#000' }}>
              Mis Clases Hoy
            </h3>
            <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
              {todayBookings.length} clase{todayBookings.length !== 1 ? 's' : ''} reservada
              {todayBookings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {todayBookings.length === 0 ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📅</div>
            <p style={{ color: '#666', margin: 0 }}>No tienes clases reservadas hoy</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todayBookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{ fontSize: '28px', flexShrink: 0 }}>
                    {categoryEmojis[booking.class.category] || '🏃'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                        color: '#000',
                      }}
                    >
                      {booking.class.name}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>
                      Con {booking.class.instructor}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#000',
                        }}
                      >
                        ⏰ {booking.class.startTime} - {booking.class.endTime}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          backgroundColor: '#fff',
                          borderRadius: '4px',
                          color: '#666',
                        }}
                      >
                        {booking.class.duration} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {stats && (
          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>
                {stats.totalBookings}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Reservas totales</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>
                {stats.upcomingClasses}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Próximas clases</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista completa
  return (
    <div style={{ padding: '32px' }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          borderBottom: '2px solid #e5e7eb',
        }}
      >
        {[
          { key: 'today', label: 'Clases de Hoy', icon: '📅' },
          { key: 'my-bookings', label: 'Mis Reservas', icon: '🎫' },
          { key: 'all', label: 'Todas las Clases', icon: '🔍' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 20px',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === tab.key ? '#000' : '#666',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #000' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Estadísticas */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <StatCard icon="📊" value={stats.totalBookings.toString()} label="Reservas" />
          <StatCard icon="✅" value={stats.totalAttended.toString()} label="Asistidas" />
          <StatCard icon="🔜" value={stats.upcomingClasses.toString()} label="Próximas" />
          <StatCard
            icon="⭐"
            value={stats.favoriteCategory || 'N/A'}
            label="Favorita"
            small
          />
        </div>
      )}

      {/* Contenido según tab */}
      {activeTab === 'today' && (
        <>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000' }}>
            Clases Disponibles Hoy
          </h3>
          {classes.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No hay clases disponibles hoy"
              description="Vuelve mañana para ver las nuevas clases"
            />
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  isBooked={isClassBooked(classItem.id)}
                  onBook={() => setSelectedClass(classItem)}
                  onCancel={() => handleCancelBooking(classItem.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'my-bookings' && (
        <>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000' }}>
            Mis Reservas
          </h3>
          {userBookings.length === 0 ? (
            <EmptyState
              icon="🎫"
              title="No tienes reservas"
              description="Reserva tu primera clase para comenzar"
            />
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {userBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={() => handleCancelBooking(booking.classId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'all' && (
        <>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#000' }}>
            Todas las Clases
          </h3>
          <AllClassesView
            userId={userId}
            onBook={(classItem) => setSelectedClass(classItem)}
            onCancel={handleCancelBooking}
          />
        </>
      )}

      {/* Modal de confirmación de reserva */}
      {selectedClass && (
        <BookingModal
          classItem={selectedClass}
          onConfirm={() => handleBookClass(selectedClass.id)}
          onCancel={() => setSelectedClass(null)}
          booking={booking}
        />
      )}
    </div>
  );
};

// Componentes auxiliares
const StatCard: React.FC<{ icon: string; value: string; label: string; small?: boolean }> = ({
  icon,
  value,
  label,
  small = false,
}) => (
  <div
    style={{
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
    }}
  >
    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
    <div
      style={{
        fontSize: small ? '16px' : '24px',
        fontWeight: '700',
        color: '#000',
        marginBottom: '4px',
        textTransform: 'capitalize',
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: '12px', color: '#666' }}>{label}</div>
  </div>
);

const ClassCard: React.FC<{
  classItem: ClassItem;
  isBooked: boolean;
  onBook: () => void;
  onCancel: () => void;
}> = ({ classItem, isBooked, onBook, onCancel }) => {
  const availableSpots = classItem.capacity - classItem.currentBookings;
  const isFull = availableSpots === 0;

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
        <div style={{ fontSize: '48px', flexShrink: 0 }}>
          {categoryEmojis[classItem.category] || '🏃'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#000' }}>
              {classItem.name}
            </h4>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                padding: '4px 12px',
                backgroundColor: difficultyColors[classItem.difficulty] || '#666',
                color: '#fff',
                borderRadius: '4px',
                textTransform: 'capitalize',
              }}
            >
              {classItem.difficulty}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px 0' }}>
            {classItem.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            <InfoBadge icon="👤" text={classItem.instructor} />
            <InfoBadge icon="⏰" text={`${classItem.startTime} - ${classItem.endTime}`} />
            <InfoBadge icon="⏱️" text={`${classItem.duration} min`} />
            <InfoBadge
              icon="👥"
              text={`${availableSpots}/${classItem.capacity} cupos`}
              color={isFull ? '#ef4444' : availableSpots < 5 ? '#f59e0b' : '#22c55e'}
            />
          </div>
          {isBooked ? (
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ef4444',
                backgroundColor: '#fff',
                border: '2px solid #ef4444',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              Cancelar Reserva
            </button>
          ) : (
            <button
              onClick={onBook}
              disabled={isFull}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                backgroundColor: isFull ? '#9ca3af' : '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: isFull ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isFull) e.currentTarget.style.backgroundColor = '#333';
              }}
              onMouseLeave={(e) => {
                if (!isFull) e.currentTarget.style.backgroundColor = '#000';
              }}
            >
              {isFull ? 'Clase Llena' : 'Reservar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoBadge: React.FC<{ icon: string; text: string; color?: string }> = ({
  icon,
  text,
  color = '#666',
}) => (
  <span
    style={{
      fontSize: '13px',
      color: color,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontWeight: '500',
    }}
  >
    <span>{icon}</span>
    {text}
  </span>
);

const BookingCard: React.FC<{ booking: Booking; onCancel: () => void }> = ({
  booking,
  onCancel,
}) => {
  const isPast = new Date(booking.class.date) < new Date();

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
        <div style={{ fontSize: '40px', flexShrink: 0 }}>
          {categoryEmojis[booking.class.category] || '🏃'}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#000' }}>
            {booking.class.name}
          </h4>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px 0' }}>
            Con {booking.class.instructor}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            <InfoBadge
              icon="📅"
              text={new Date(booking.class.date).toLocaleDateString('es-ES', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            />
            <InfoBadge
              icon="⏰"
              text={`${booking.class.startTime} - ${booking.class.endTime}`}
            />
            <InfoBadge icon="⏱️" text={`${booking.class.duration} min`} />
          </div>
          {!isPast && (
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#ef4444',
                backgroundColor: 'transparent',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          )}
          {isPast && booking.attended && (
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ✓ Asististe
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div
    style={{
      padding: '80px 40px',
      textAlign: 'center',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
    }}
  >
    <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.3 }}>{icon}</div>
    <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '8px' }}>{title}</h3>
    <p style={{ color: '#666', margin: 0 }}>{description}</p>
  </div>
);

const BookingModal: React.FC<{
  classItem: ClassItem;
  onConfirm: () => void;
  onCancel: () => void;
  booking: boolean;
}> = ({ classItem, onConfirm, onCancel, booking }) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}
    onClick={onCancel}
  >
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
          {categoryEmojis[classItem.category] || '🏃'}
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0', color: '#000' }}>
          Confirmar Reserva
        </h3>
        <p style={{ color: '#666', margin: 0 }}>¿Deseas reservar esta clase?</p>
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#000' }}>
          {classItem.name}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <InfoBadge icon="👤" text={classItem.instructor} />
          <InfoBadge icon="⏰" text={`${classItem.startTime} - ${classItem.endTime}`} />
          <InfoBadge icon="⏱️" text={`${classItem.duration} minutos`} />
          <InfoBadge
            icon="📊"
            text={classItem.difficulty}
            color={difficultyColors[classItem.difficulty]}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onCancel}
          disabled={booking}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#666',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '4px',
            cursor: booking ? 'not-allowed' : 'pointer',
            opacity: booking ? 0.5 : 1,
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={booking}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: booking ? 'not-allowed' : 'pointer',
            opacity: booking ? 0.7 : 1,
          }}
        >
          {booking ? 'Reservando...' : 'Confirmar Reserva'}
        </button>
      </div>
    </div>
  </div>
);

const AllClassesView: React.FC<{
  userId: string;
  onBook: (classItem: ClassItem) => void;
  onCancel: (classId: string) => void;
}> = ({ userId, onBook, onCancel }) => {
  const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchAllClasses();
  }, []);

  const fetchAllClasses = async () => {
    setLoading(true);
    try {
      const [classesRes, bookingsRes] = await Promise.all([
        fetch(`${CLASS_SERVICE_URL}/classes`),
        fetch(`${CLASS_SERVICE_URL}/classes/user/${userId}/bookings`),
      ]);

      const classesData = await classesRes.json();
      const bookingsData = await bookingsRes.json();

      if (classesData.success) setAllClasses(classesData.data);
      if (bookingsData.success) setUserBookings(bookingsData.data);
    } catch (err) {
      console.error('Error fetching all classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const isClassBooked = (classId: string) => {
    return userBookings.some((b) => b.classId === classId);
  };

  const filteredClasses =
    selectedCategory === 'all'
      ? allClasses
      : allClasses.filter((c) => c.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(allClasses.map((c) => c.category)))];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#666' }}>Cargando todas las clases...</p>
      </div>
    );
  }

  return (
    <>
      {/* Filtro por categoría */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: selectedCategory === cat ? '#fff' : '#666',
              backgroundColor: selectedCategory === cat ? '#000' : '#f3f4f6',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {cat !== 'all' && <span>{categoryEmojis[cat] || '🏃'}</span>}
            {cat === 'all' ? 'Todas' : cat}
          </button>
        ))}
      </div>

      {/* Lista de clases */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No hay clases disponibles"
          description="Prueba con otra categoría"
        />
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              isBooked={isClassBooked(classItem.id)}
              onBook={() => onBook(classItem)}
              onCancel={() => onCancel(classItem.id)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ClassWidget;
