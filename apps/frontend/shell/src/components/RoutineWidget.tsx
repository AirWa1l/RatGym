import React, { useState, useEffect } from 'react';

interface RoutineExercise {
  exerciseId: string;
  exerciseName?: string;
  sets: number;
  reps: number;
  restTime: number;
  order: number;
}

interface Routine {
  id: string;
  name: string;
  description: string;
  userId: string;
  exercises: RoutineExercise[];
  difficulty: string;
  category: string;
  estimatedDuration: number;
  timesCompleted: number;
  lastCompletedAt?: string;
}

interface UserStats {
  totalRoutines: number;
  totalExercisesCompleted: number;
  totalWorkouts: number;
  favoriteCategory: string;
  lastWorkoutDate?: string;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  difficulty: string;
}

interface RoutineWidgetProps {
  userId: string;
  compact?: boolean;
}

const ROUTINE_SERVICE_URL = 'http://localhost:3002';

export const RoutineWidget: React.FC<RoutineWidgetProps> = ({ userId, compact = false }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [publicRoutines, setPublicRoutines] = useState<Routine[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    description: '',
    difficulty: 'principiante',
    category: 'fuerza',
    estimatedDuration: 30,
  });
  const [creating, setCreating] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [newExercise, setNewExercise] = useState({
    exerciseId: '',
    sets: 3,
    reps: 10,
    restTime: 60,
  });
  const [addingExercise, setAddingExercise] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    fetchData();
    fetchExercises();
  }, [userId]);

  const fetchExercises = async () => {
    try {
      const res = await fetch(`${ROUTINE_SERVICE_URL}/exercises`);
      const data = await res.json();
      if (data.success) {
        setAvailableExercises(data.data);
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener rutinas del usuario
      const userRoutinesRes = await fetch(`${ROUTINE_SERVICE_URL}/routines/user/${userId}`);
      const userRoutinesData = await userRoutinesRes.json();
      if (userRoutinesData.success) {
        setRoutines(userRoutinesData.data);
      }

      // Obtener rutinas públicas
      const publicRoutinesRes = await fetch(`${ROUTINE_SERVICE_URL}/routines`);
      const publicRoutinesData = await publicRoutinesRes.json();
      if (publicRoutinesData.success) {
        setPublicRoutines(publicRoutinesData.data);
      }

      // Obtener estadísticas del usuario
      const statsRes = await fetch(`${ROUTINE_SERVICE_URL}/routines/user/${userId}/stats`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (err) {
      console.error('Error fetching routine data:', err);
      setError('No se pudo conectar con el servicio de rutinas');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRoutine = async (routineId: string) => {
    try {
      const res = await fetch(`${ROUTINE_SERVICE_URL}/routines/${routineId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (res.ok) {
        fetchData(); // Recargar datos
      }
    } catch (err) {
      console.error('Error completing routine:', err);
    }
  };

  const handleDuplicateRoutine = async (routineId: string) => {
    try {
      const res = await fetch(`${ROUTINE_SERVICE_URL}/routines/${routineId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (res.ok) {
        setActiveTab('my');
        fetchData();
      }
    } catch (err) {
      console.error('Error duplicating routine:', err);
    }
  };

  const handleCreateRoutine = async () => {
    if (!newRoutine.name.trim()) {
      alert('Por favor ingresa un nombre para la rutina');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${ROUTINE_SERVICE_URL}/routines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRoutine,
          userId,
          exercises: [],
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewRoutine({
          name: '',
          description: '',
          difficulty: 'principiante',
          category: 'fuerza',
          estimatedDuration: 30,
        });
        setActiveTab('my');
        fetchData();
      } else {
        alert('Error al crear la rutina');
      }
    } catch (err) {
      console.error('Error creating routine:', err);
      alert('Error al conectar con el servicio');
    } finally {
      setCreating(false);
    }
  };

  const handleAddExerciseToRoutine = async () => {
    if (!editingRoutine || !newExercise.exerciseId) {
      alert('Por favor selecciona un ejercicio');
      return;
    }

    setAddingExercise(true);
    try {
      const selectedExercise = availableExercises.find(e => e.id === newExercise.exerciseId);
      const res = await fetch(`${ROUTINE_SERVICE_URL}/routines/${editingRoutine.id}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: newExercise.exerciseId,
          exerciseName: selectedExercise?.name || 'Ejercicio',
          sets: newExercise.sets,
          reps: newExercise.reps,
          restTime: newExercise.restTime,
          order: editingRoutine.exercises.length + 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEditingRoutine(data.data);
        setShowAddExerciseModal(false);
        setNewExercise({ exerciseId: '', sets: 3, reps: 10, restTime: 60 });
        fetchData();
      } else {
        alert('Error al agregar el ejercicio');
      }
    } catch (err) {
      console.error('Error adding exercise:', err);
      alert('Error al conectar con el servicio');
    } finally {
      setAddingExercise(false);
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!editingRoutine) return;

    try {
      const res = await fetch(`${ROUTINE_SERVICE_URL}/routines/${editingRoutine.id}/exercises/${exerciseId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        setEditingRoutine(data.data);
        fetchData();
      }
    } catch (err) {
      console.error('Error removing exercise:', err);
    }
  };

  const getMuscleGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      chest: 'Pecho',
      back: 'Espalda',
      shoulders: 'Hombros',
      biceps: 'Bíceps',
      triceps: 'Tríceps',
      legs: 'Piernas',
      core: 'Core',
      glutes: 'Glúteos',
      full_body: 'Cuerpo Completo',
    };
    return labels[group] || group;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'principiante': return '#4CAF50';
      case 'intermedio': return '#FF9800';
      case 'avanzado': return '#f44336';
      default: return '#666';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'principiante': return 'Principiante';
      case 'intermedio': return 'Intermedio';
      case 'avanzado': return 'Avanzado';
      default: return difficulty;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuerza': return '💪';
      case 'cardio': return '🏃';
      case 'flexibilidad': return '🧘';
      case 'hiit': return '⚡';
      case 'musculacion': return '🏋️';
      case 'crossfit': return '🔥';
      default: return '💪';
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <div style={{ color: '#666' }}>Cargando rutinas...</div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ color: '#f44336', marginBottom: '16px' }}>{error}</div>
        <button
          onClick={fetchData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Vista compacta para Dashboard - solo muestra la primera rutina
  if (compact) {
    const firstRoutine = routines[0];
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header negro */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#000',
          color: '#fff',
        }}>
          <div style={{ fontSize: '24px' }}>💪</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Rutinas</h3>
            <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
              Tus entrenamientos personalizados
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>
              {stats?.totalRoutines || 0}
            </div>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Rutinas</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>
              {stats?.totalWorkouts || 0}
            </div>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Entrenamientos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>
              {stats?.totalExercisesCompleted || 0}
            </div>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Ejercicios</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px' }}>
              {getCategoryIcon(stats?.favoriteCategory || 'fuerza')}
            </div>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Favorito</div>
          </div>
        </div>

        {/* Contenido - Primera rutina */}
        <div style={{ padding: '16px', flex: 1 }}>
          {firstRoutine ? (
            <div style={{
              backgroundColor: '#f8f8f8',
              borderRadius: '8px',
              padding: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {getCategoryIcon(firstRoutine.category)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{firstRoutine.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {firstRoutine.exercises.length} ejercicios • ~{firstRoutine.estimatedDuration} min
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteRoutine(firstRoutine.id);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                ✓ Completar Rutina
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📝</div>
              <div style={{ fontSize: '13px' }}>No tienes rutinas aún</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Stats Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>
            {stats?.totalRoutines || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Rutinas</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>
            {stats?.totalWorkouts || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Entrenamientos</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>
            {stats?.totalExercisesCompleted || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Ejercicios</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px' }}>
            {getCategoryIcon(stats?.favoriteCategory || 'strength')}
          </div>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Favorito</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <button
          onClick={() => setActiveTab('my')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: activeTab === 'my' ? '#fff' : '#f5f5f5',
            borderBottom: activeTab === 'my' ? '2px solid #000' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'my' ? '600' : '400',
            fontSize: '13px',
          }}
        >
          Mis Rutinas ({routines.length})
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: activeTab === 'explore' ? '#fff' : '#f5f5f5',
            borderBottom: activeTab === 'explore' ? '2px solid #000' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'explore' ? '600' : '400',
            fontSize: '13px',
          }}
        >
          Explorar ({publicRoutines.length})
        </button>
      </div>

      {/* Routine List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
      }}>
        {activeTab === 'my' && routines.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>📝</div>
            <div style={{ marginBottom: '8px' }}>No tienes rutinas aún</div>
            <div style={{ fontSize: '12px' }}>Explora y duplica rutinas públicas para empezar</div>
          </div>
        )}

        {(activeTab === 'my' ? routines : publicRoutines).map((routine) => (
          <div
            key={routine.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e8e8e8',
              marginBottom: '10px',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  {getCategoryIcon(routine.category)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#000',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {routine.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: getDifficultyColor(routine.difficulty),
                      color: '#fff',
                      fontWeight: '500',
                    }}>
                      {getDifficultyLabel(routine.difficulty)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      {routine.exercises.length} ejercicios
                    </span>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      ~{routine.estimatedDuration} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Exercises preview */}
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                fontSize: '12px',
              }}>
                {routine.exercises.slice(0, 3).map((ex, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    borderBottom: i < Math.min(routine.exercises.length, 3) - 1 ? '1px solid #eee' : 'none',
                  }}>
                    <span style={{ color: '#444' }}>{ex.exerciseName || 'Ejercicio'}</span>
                    <span style={{ color: '#888' }}>{ex.sets}x{ex.reps}</span>
                  </div>
                ))}
                {routine.exercises.length > 3 && (
                  <div style={{ color: '#888', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>
                    +{routine.exercises.length - 3} más
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
              }}>
                {activeTab === 'my' ? (
                  <>
                    <button
                      onClick={() => handleCompleteRoutine(routine.id)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Completar
                    </button>
                    <button
                      onClick={() => setEditingRoutine(routine)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      ✎
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDuplicateRoutine(routine.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: '#fff',
                      color: '#000',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    + Agregar a mis rutinas
                  </button>
                )}
              </div>

              {/* Completion badge */}
              {routine.timesCompleted > 0 && activeTab === 'my' && (
                <div style={{
                  marginTop: '10px',
                  fontSize: '11px',
                  color: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>🏆</span>
                  Completada {routine.timesCompleted} {routine.timesCompleted === 1 ? 'vez' : 'veces'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
      }}>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>+</span> Crear Nueva Rutina
        </button>
      </div>
      {/* Modal para crear rutina */}
      {showCreateModal && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '450px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Header del modal */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                Crear Nueva Rutina
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>

            {/* Formulario */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                  Nombre de la rutina *
                </label>
                <input
                  type="text"
                  value={newRoutine.name}
                  onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                  placeholder="Ej: Rutina de pecho y tríceps"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                  Descripción
                </label>
                <textarea
                  value={newRoutine.description}
                  onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
                  placeholder="Describe brevemente tu rutina..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                    Dificultad
                  </label>
                  <select
                    value={newRoutine.difficulty}
                    onChange={(e) => setNewRoutine({ ...newRoutine, difficulty: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: '#fff',
                    }}
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                    Categoría
                  </label>
                  <select
                    value={newRoutine.category}
                    onChange={(e) => setNewRoutine({ ...newRoutine, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: '#fff',
                    }}
                  >
                    <option value="fuerza">💪 Fuerza</option>
                    <option value="cardio">🏃 Cardio</option>
                    <option value="flexibilidad">🧘 Flexibilidad</option>
                    <option value="hiit">⚡ HIIT</option>
                    <option value="musculacion">🏋️ Musculación</option>
                    <option value="crossfit">🔥 CrossFit</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                  Duración estimada (minutos)
                </label>
                <input
                  type="number"
                  value={newRoutine.estimatedDuration}
                  onChange={(e) => setNewRoutine({ ...newRoutine, estimatedDuration: parseInt(e.target.value) || 0 })}
                  min={5}
                  max={180}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateRoutine}
                  disabled={creating}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: creating ? '#666' : '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: creating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creating ? 'Creando...' : 'Crear Rutina'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar rutina y agregar ejercicios */}
      {editingRoutine && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: '12px 12px 0 0',
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {editingRoutine.name}
                </h3>
                <p style={{ fontSize: '13px', opacity: 0.8, margin: '4px 0 0 0' }}>
                  {editingRoutine.exercises.length} ejercicios • ~{editingRoutine.estimatedDuration} min
                </p>
              </div>
              <button
                onClick={() => setEditingRoutine(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#fff',
                }}
              >
                ×
              </button>
            </div>

            {/* Lista de ejercicios */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Ejercicios de la rutina</h4>
                <button
                  onClick={() => setShowAddExerciseModal(true)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  + Agregar Ejercicio
                </button>
              </div>

              {editingRoutine.exercises.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>🏋️</div>
                  <p style={{ margin: 0 }}>No hay ejercicios en esta rutina</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Haz clic en "Agregar Ejercicio" para comenzar</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {editingRoutine.exercises.map((ex, index) => (
                    <div
                      key={ex.exerciseId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '14px',
                        backgroundColor: '#f8f8f8',
                        borderRadius: '8px',
                        gap: '12px',
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#000',
                        color: '#fff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        flexShrink: 0,
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{ex.exerciseName || 'Ejercicio'}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          {ex.sets} series × {ex.reps} reps • {ex.restTime}s descanso
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(ex.exerciseId)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          backgroundColor: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón cerrar */}
              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => setEditingRoutine(null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar ejercicio */}
      {showAddExerciseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '450px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Agregar Ejercicio</h3>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Selector de ejercicio */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                  Ejercicio *
                </label>
                <select
                  value={newExercise.exerciseId}
                  onChange={(e) => setNewExercise({ ...newExercise, exerciseId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="">Selecciona un ejercicio</option>
                  {availableExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} - {getMuscleGroupLabel(ex.muscleGroup)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Series, Repeticiones y Descanso */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                    Series
                  </label>
                  <input
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={10}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                    Reps
                  </label>
                  <input
                    type="number"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={100}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
                    Descanso (s)
                  </label>
                  <input
                    type="number"
                    value={newExercise.restTime}
                    onChange={(e) => setNewExercise({ ...newExercise, restTime: parseInt(e.target.value) || 30 })}
                    min={10}
                    max={300}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAddExerciseModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddExerciseToRoutine}
                  disabled={addingExercise || !newExercise.exerciseId}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: addingExercise || !newExercise.exerciseId ? '#ccc' : '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: addingExercise || !newExercise.exerciseId ? 'not-allowed' : 'pointer',
                  }}
                >
                  {addingExercise ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineWidget;
