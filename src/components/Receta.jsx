import { useState, useEffect } from "react";

function Receta() {
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Cargar las categorías una sola vez al montar el componente
  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
      .then((res) => res.json())
      .then((data) => setCategorias(data.meals))
      .catch(() => setCategorias([]));
  }, []);

  const buscarPorNombre = async () => {
    if (!busqueda.trim()) return;
    setCargando(true);
    setError("");
    setCategoriaSeleccionada("");
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

  const buscarPorCategoria = async (categoria) => {
    setCategoriaSeleccionada(categoria);
    setBusqueda("");
    if (!categoria) {
      setRecetas([]);
      return;
    }
    setCargando(true);
    setError("");
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
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
    <div className="contenedor">
      <div className="controles">
        <div className="buscador">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar receta (ej: chicken)"
          />
          <button onClick={buscarPorNombre}>Buscar</button>
        </div>

        <select
          value={categoriaSeleccionada}
          onChange={(e) => buscarPorCategoria(e.target.value)}
        >
          <option value="">-- Filtrar por categoría --</option>
          {categorias.map((cat) => (
            <option key={cat.strCategory} value={cat.strCategory}>
              {cat.strCategory}
            </option>
          ))}
        </select>
      </div>

      {cargando && <p className="mensaje">Cargando...</p>}
      {error && <p className="mensaje error">{error}</p>}
      {!cargando && !error && recetas.length === 0 && (
        <p className="mensaje">Busca una receta o elige una categoría</p>
      )}

      <div className="grid-recetas">
        {recetas.map((r) => (
          <div className="tarjeta" key={r.idMeal}>
            <img src={r.strMealThumb} alt={r.strMeal} />
            <h3>{r.strMeal}</h3>
            {r.strCategory && <p className="categoria">{r.strCategory}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Receta;