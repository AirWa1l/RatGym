import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>
          Bienvenido a RatGym 🐀💪
        </h1>
        <p style={styles.subtitle}>
          Tu plataforma integral para fitness, nutrición y bienestar
        </p>
      </div>

      <div style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.icon}>🏋️</div>
          <h3 style={styles.featureTitle}>Rutinas Personalizadas</h3>
          <p style={styles.featureText}>
            Accede a rutinas de ejercicio diseñadas para tus objetivos
          </p>
        </div>

        <div style={styles.featureCard}>
          <div style={styles.icon}>🎯</div>
          <h3 style={styles.featureTitle}>Clases en Vivo</h3>
          <p style={styles.featureText}>
            Participa en clases grupales con entrenadores expertos
          </p>
        </div>

        <div style={styles.featureCard}>
          <div style={styles.icon}>🥗</div>
          <h3 style={styles.featureTitle}>Plan Nutricional</h3>
          <p style={styles.featureText}>
            Recibe recomendaciones nutricionales adaptadas a ti
          </p>
        </div>

        <div style={styles.featureCard}>
          <div style={styles.icon}>📊</div>
          <h3 style={styles.featureTitle}>Seguimiento</h3>
          <p style={styles.featureText}>
            Monitorea tu progreso y alcanza tus metas
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  hero: {
    textAlign: 'center' as const,
    marginBottom: '60px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '20px',
    color: '#666',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  featureText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
  },
};
