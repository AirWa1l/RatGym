import RoutineWidget from './components/RoutineWidget';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <h1 className="app-title">💪 Rutinas</h1>
      <div className="app-container">
        <RoutineWidget />
      </div>
    </div>
  );
}

export default App;
