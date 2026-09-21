import Receta from "./components/Receta";
import "./App.css";

function App() {
  return (
    <div>
      <header className="app-header">
        <p>🍲 Buscador de Recetas</p>
        <h1>¿Qué vamos a cocinar hoy?</h1>
        <p className="app-subtitle">Encuentra ideas por nombre o por categoría</p>
      </header>

      <main className="app-main">
        <Receta />
      </main>

      <footer className="app-footer">
        <p>
          Datos de{" "}
          <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer">
            TheMealDB
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;