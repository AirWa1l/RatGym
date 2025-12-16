import React from 'react';

export const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
  },
  
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '32px',
    textAlign: 'center' as const,
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #e1e4e8',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  
  inputFocus: {
    borderColor: '#667eea',
  },
  
  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px',
  },
  
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  
  error: {
    padding: '12px 16px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    color: '#c33',
    fontSize: '14px',
  },
  
  link: {
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#666',
    marginTop: '20px',
  },
  
  linkButton: {
    color: '#667eea',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e1e4e8',
  },
  
  dividerText: {
    padding: '0 16px',
    fontSize: '12px',
    color: '#666',
  },
};
