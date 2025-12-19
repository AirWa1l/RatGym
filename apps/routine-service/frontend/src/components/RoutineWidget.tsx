import { useState, useEffect } from 'react';
import {
  Routine,
  UserStats,
  Exercise,
  getUserRoutines,
  getRoutines,
  getUserStats,
  getExercises,
  createRoutine,
  completeRoutine,
  duplicateRoutine,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
  getCategoryIcon,
  getDifficultyColor,
  getDifficultyLabel,
  getMuscleGroupLabel,
} from '../services/routine.service';
import './RoutineWidget.css';

interface RoutineWidgetProps {
  userId?: string;
  compact?: boolean;
}

export default function RoutineWidget({ userId = 'guest', compact = false }: RoutineWidgetProps) {
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

  useEffect(() => {
    fetchData();
    fetchExercises();
  }, [userId]);

  const fetchExercises = async () => {
    try {
      const data = await getExercises();
      setAvailableExercises(data);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [userRoutinesData, publicRoutinesData, statsData] = await Promise.all([
        getUserRoutines(userId),
        getRoutines(),
        getUserStats(userId),
      ]);
      
      setRoutines(userRoutinesData);
      setPublicRoutines(publicRoutinesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching routine data:', err);
      setError('No se pudo conectar con el servicio de rutinas');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRoutine = async (routineId: string) => {
    try {
      await completeRoutine(routineId, userId);
      fetchData();
    } catch (err) {
      console.error('Error completing routine:', err);
    }
  };

  const handleDuplicateRoutine = async (routineId: string) => {
    try {
      await duplicateRoutine(routineId, userId);
      setActiveTab('my');
      fetchData();
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
      await createRoutine({
        ...newRoutine,
        userId,
        exercises: [],
      });

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
    } catch (err) {
      console.error('Error creating routine:', err);
      alert('Error al crear la rutina');
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
      const updatedRoutine = await addExerciseToRoutine(editingRoutine.id, {
        exerciseId: newExercise.exerciseId,
        exerciseName: selectedExercise?.name || 'Ejercicio',
        sets: newExercise.sets,
        reps: newExercise.reps,
        restTime: newExercise.restTime,
        order: editingRoutine.exercises.length + 1,
      });

      setEditingRoutine(updatedRoutine);
      setShowAddExerciseModal(false);
      setNewExercise({ exerciseId: '', sets: 3, reps: 10, restTime: 60 });
      fetchData();
    } catch (err) {
      console.error('Error adding exercise:', err);
      alert('Error al agregar el ejercicio');
    } finally {
      setAddingExercise(false);
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!editingRoutine) return;

    try {
      const updatedRoutine = await removeExerciseFromRoutine(editingRoutine.id, exerciseId);
      setEditingRoutine(updatedRoutine);
      fetchData();
    } catch (err) {
      console.error('Error removing exercise:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="routine-loading">
        <div className="routine-loading-icon">⏳</div>
        <div className="routine-loading-text">Cargando rutinas...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="routine-error">
        <div className="routine-error-icon">⚠️</div>
        <div className="routine-error-text">{error}</div>
        <button className="routine-btn routine-btn-primary" onClick={fetchData}>
          Reintentar
        </button>
      </div>
    );
  }

  // Compact view for Dashboard
  if (compact) {
    const firstRoutine = routines[0];
    return (
      <div className="routine-compact">
        <div className="routine-header">
          <div className="routine-header-icon">💪</div>
          <div className="routine-header-content">
            <h3 className="routine-title">Rutinas</h3>
            <p className="routine-subtitle">Tus entrenamientos personalizados</p>
          </div>
        </div>

        <div className="routine-stats">
          <div className="routine-stat">
            <div className="routine-stat-value">{stats?.totalRoutines || 0}</div>
            <div className="routine-stat-label">Rutinas</div>
          </div>
          <div className="routine-stat">
            <div className="routine-stat-value">{stats?.totalWorkouts || 0}</div>
            <div className="routine-stat-label">Entrenamientos</div>
          </div>
          <div className="routine-stat">
            <div className="routine-stat-value">{stats?.totalExercisesCompleted || 0}</div>
            <div className="routine-stat-label">Ejercicios</div>
          </div>
          <div className="routine-stat">
            <div className="routine-stat-value" style={{ fontSize: '18px' }}>
              {getCategoryIcon(stats?.favoriteCategory || 'fuerza')}
            </div>
            <div className="routine-stat-label">Favorito</div>
          </div>
        </div>

        <div className="routine-compact-content">
          {firstRoutine ? (
            <div className="routine-compact-card">
              <div className="routine-compact-header">
                <div className="routine-compact-icon">
                  {getCategoryIcon(firstRoutine.category)}
                </div>
                <div className="routine-compact-info">
                  <div className="routine-compact-name">{firstRoutine.name}</div>
                  <div className="routine-compact-meta">
                    {firstRoutine.exercises.length} ejercicios • ~{firstRoutine.estimatedDuration} min
                  </div>
                </div>
              </div>
              <button
                className="routine-btn routine-btn-primary"
                style={{ width: '100%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteRoutine(firstRoutine.id);
                }}
              >
                ✓ Completar Rutina
              </button>
            </div>
          ) : (
            <div className="routine-empty">
              <div className="routine-empty-icon">📝</div>
              <div>No tienes rutinas aún</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="routine-card">
      {/* Stats Header */}
      <div className="routine-stats">
        <div className="routine-stat">
          <div className="routine-stat-value">{stats?.totalRoutines || 0}</div>
          <div className="routine-stat-label">Rutinas</div>
        </div>
        <div className="routine-stat">
          <div className="routine-stat-value">{stats?.totalWorkouts || 0}</div>
          <div className="routine-stat-label">Entrenamientos</div>
        </div>
        <div className="routine-stat">
          <div className="routine-stat-value">{stats?.totalExercisesCompleted || 0}</div>
          <div className="routine-stat-label">Ejercicios</div>
        </div>
        <div className="routine-stat">
          <div className="routine-stat-value" style={{ fontSize: '20px' }}>
            {getCategoryIcon(stats?.favoriteCategory || 'strength')}
          </div>
          <div className="routine-stat-label">Favorito</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="routine-tabs">
        <button
          className={`routine-tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          Mis Rutinas ({routines.length})
        </button>
        <button
          className={`routine-tab ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          Explorar ({publicRoutines.length})
        </button>
      </div>

      {/* Routine List */}
      <div className="routine-list">
        {activeTab === 'my' && routines.length === 0 && (
          <div className="routine-empty">
            <div className="routine-empty-icon">📝</div>
            <div>No tienes rutinas aún</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              Explora y duplica rutinas públicas para empezar
            </div>
          </div>
        )}

        {(activeTab === 'my' ? routines : publicRoutines).map((routine) => (
          <div key={routine.id} className="routine-item">
            <div className="routine-item-content">
              <div className="routine-item-header">
                <div className="routine-item-icon">
                  {getCategoryIcon(routine.category)}
                </div>
                <div className="routine-item-info">
                  <h4 className="routine-item-name">{routine.name}</h4>
                  <div className="routine-item-meta">
                    <span
                      className="routine-difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(routine.difficulty) }}
                    >
                      {getDifficultyLabel(routine.difficulty)}
                    </span>
                    <span className="routine-meta-text">
                      {routine.exercises.length} ejercicios
                    </span>
                    <span className="routine-meta-text">
                      ~{routine.estimatedDuration} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Exercises preview */}
              <div className="routine-exercises-preview">
                {routine.exercises.slice(0, 3).map((ex, i) => (
                  <div
                    key={i}
                    className="routine-exercise-item"
                    style={{
                      borderBottom: i < Math.min(routine.exercises.length, 3) - 1 ? '1px solid #eee' : 'none',
                    }}
                  >
                    <span className="routine-exercise-name">{ex.exerciseName || 'Ejercicio'}</span>
                    <span className="routine-exercise-sets">{ex.sets}x{ex.reps}</span>
                  </div>
                ))}
                {routine.exercises.length > 3 && (
                  <div className="routine-exercises-more">
                    +{routine.exercises.length - 3} más
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="routine-actions">
                {activeTab === 'my' ? (
                  <>
                    <button
                      className="routine-btn routine-btn-primary"
                      onClick={() => handleCompleteRoutine(routine.id)}
                    >
                      ✓ Completar
                    </button>
                    <button
                      className="routine-btn routine-btn-secondary routine-btn-icon"
                      onClick={() => setEditingRoutine(routine)}
                    >
                      ✎
                    </button>
                  </>
                ) : (
                  <button
                    className="routine-btn routine-btn-outline"
                    onClick={() => handleDuplicateRoutine(routine.id)}
                  >
                    + Agregar a mis rutinas
                  </button>
                )}
              </div>

              {/* Completion badge */}
              {routine.timesCompleted > 0 && activeTab === 'my' && (
                <div className="routine-completion-badge">
                  <span>🏆</span>
                  Completada {routine.timesCompleted} {routine.timesCompleted === 1 ? 'vez' : 'veces'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className="routine-footer">
        <button className="routine-footer-btn" onClick={() => setShowCreateModal(true)}>
          <span>+</span> Crear Nueva Rutina
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="routine-modal-overlay">
          <div className="routine-modal">
            <div className="routine-modal-header">
              <h3 className="routine-modal-title">Crear Nueva Rutina</h3>
              <button className="routine-modal-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>

            <div className="routine-modal-body">
              <div className="routine-form-group">
                <label className="routine-form-label">Nombre de la rutina *</label>
                <input
                  type="text"
                  className="routine-form-input"
                  value={newRoutine.name}
                  onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
                  placeholder="Ej: Rutina de pecho y tríceps"
                />
              </div>

              <div className="routine-form-group">
                <label className="routine-form-label">Descripción</label>
                <textarea
                  className="routine-form-textarea"
                  value={newRoutine.description}
                  onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
                  placeholder="Describe brevemente tu rutina..."
                  rows={3}
                />
              </div>

              <div className="routine-form-row">
                <div className="routine-form-group">
                  <label className="routine-form-label">Dificultad</label>
                  <select
                    className="routine-form-select"
                    value={newRoutine.difficulty}
                    onChange={(e) => setNewRoutine({ ...newRoutine, difficulty: e.target.value })}
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>

                <div className="routine-form-group">
                  <label className="routine-form-label">Categoría</label>
                  <select
                    className="routine-form-select"
                    value={newRoutine.category}
                    onChange={(e) => setNewRoutine({ ...newRoutine, category: e.target.value })}
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

              <div className="routine-form-group">
                <label className="routine-form-label">Duración estimada (minutos)</label>
                <input
                  type="number"
                  className="routine-form-input"
                  value={newRoutine.estimatedDuration}
                  onChange={(e) => setNewRoutine({ ...newRoutine, estimatedDuration: parseInt(e.target.value) || 0 })}
                  min={5}
                  max={180}
                />
              </div>

              <div className="routine-form-actions">
                <button
                  className="routine-btn routine-btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="routine-btn routine-btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={handleCreateRoutine}
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear Rutina'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRoutine && (
        <div className="routine-modal-overlay">
          <div className="routine-modal routine-edit-modal">
            <div className="routine-modal-header routine-edit-header">
              <div>
                <h3 className="routine-modal-title">{editingRoutine.name}</h3>
                <p className="routine-edit-subtitle">
                  {editingRoutine.exercises.length} ejercicios • ~{editingRoutine.estimatedDuration} min
                </p>
              </div>
              <button className="routine-modal-close" onClick={() => setEditingRoutine(null)}>
                ×
              </button>
            </div>

            <div className="routine-modal-body">
              <div className="routine-edit-section-header">
                <h4 className="routine-edit-section-title">Ejercicios de la rutina</h4>
                <button
                  className="routine-btn routine-btn-primary"
                  onClick={() => setShowAddExerciseModal(true)}
                >
                  + Agregar Ejercicio
                </button>
              </div>

              {editingRoutine.exercises.length === 0 ? (
                <div className="routine-empty" style={{ backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
                  <div className="routine-empty-icon">🏋️</div>
                  <p>No hay ejercicios en esta rutina</p>
                  <p style={{ fontSize: '13px' }}>Haz clic en "Agregar Ejercicio" para comenzar</p>
                </div>
              ) : (
                <div className="routine-exercise-list">
                  {editingRoutine.exercises.map((ex, index) => (
                    <div key={ex.exerciseId} className="routine-exercise-card">
                      <div className="routine-exercise-number">{index + 1}</div>
                      <div className="routine-exercise-card-info">
                        <div className="routine-exercise-card-name">{ex.exerciseName || 'Ejercicio'}</div>
                        <div className="routine-exercise-card-details">
                          {ex.sets} series × {ex.reps} reps • {ex.restTime}s descanso
                        </div>
                      </div>
                      <button
                        className="routine-exercise-delete"
                        onClick={() => handleRemoveExercise(ex.exerciseId)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '24px' }}>
                <button
                  className="routine-btn routine-btn-secondary"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={() => setEditingRoutine(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="routine-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="routine-modal">
            <div className="routine-modal-header">
              <h3 className="routine-modal-title">Agregar Ejercicio</h3>
              <button className="routine-modal-close" onClick={() => setShowAddExerciseModal(false)}>
                ×
              </button>
            </div>

            <div className="routine-modal-body">
              <div className="routine-form-group">
                <label className="routine-form-label">Ejercicio *</label>
                <select
                  className="routine-form-select"
                  value={newExercise.exerciseId}
                  onChange={(e) => setNewExercise({ ...newExercise, exerciseId: e.target.value })}
                >
                  <option value="">Selecciona un ejercicio</option>
                  {availableExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} - {getMuscleGroupLabel(ex.muscleGroup)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="routine-form-group">
                  <label className="routine-form-label">Series</label>
                  <input
                    type="number"
                    className="routine-form-input"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={10}
                  />
                </div>
                <div className="routine-form-group">
                  <label className="routine-form-label">Reps</label>
                  <input
                    type="number"
                    className="routine-form-input"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={100}
                  />
                </div>
                <div className="routine-form-group">
                  <label className="routine-form-label">Descanso (s)</label>
                  <input
                    type="number"
                    className="routine-form-input"
                    value={newExercise.restTime}
                    onChange={(e) => setNewExercise({ ...newExercise, restTime: parseInt(e.target.value) || 30 })}
                    min={10}
                    max={300}
                  />
                </div>
              </div>

              <div className="routine-form-actions">
                <button
                  className="routine-btn routine-btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => setShowAddExerciseModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="routine-btn routine-btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={handleAddExerciseToRoutine}
                  disabled={addingExercise || !newExercise.exerciseId}
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
}
