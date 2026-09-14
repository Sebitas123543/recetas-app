import { useState } from "react";

function Receta() {
  const [busqueda, setBusqueda] = useState("");
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const buscarRecetas = async () => {
    if (!busqueda.trim()) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${busqueda}`
      );
      const data = await res.json();
      if (!data.meals) throw new Error("No se encontraron recetas");
      setRecetas(data.meals);
    } catch (err) {
      setError(err.message);
      setRecetas([]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Escribe una receta (ej: chicken)"
      />
      <button onClick={buscarRecetas}>Buscar</button>

      {cargando && <p>Cargando...</p>}
      {error && <p>{error}</p>}

      <div>
        {recetas.map((r) => (
          <div key={r.idMeal}>
            <h3>{r.strMeal}</h3>
            <img src={r.strMealThumb} alt={r.strMeal} width="200" />
            <p>Categoría: {r.strCategory}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Receta;