import { useState, useEffect } from "react";

function Receta() {
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

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

  const verDetalle = async (id) => {
    setCargandoDetalle(true);
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );
      const data = await res.json();
      setRecetaSeleccionada(data.meals[0]);
    } catch {
      setRecetaSeleccionada(null);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarDetalle = () => setRecetaSeleccionada(null);

  // Arma la lista de ingredientes recorriendo strIngredient1..20 / strMeasure1..20
  const obtenerIngredientes = (receta) => {
    const ingredientes = [];
    for (let i = 1; i <= 20; i++) {
      const ingrediente = receta[`strIngredient${i}`];
      const medida = receta[`strMeasure${i}`];
      if (ingrediente && ingrediente.trim()) {
        ingredientes.push(`${medida} ${ingrediente}`.trim());
      }
    }
    return ingredientes;
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
          <div
            className="tarjeta"
            key={r.idMeal}
            onClick={() => verDetalle(r.idMeal)}
          >
            <img src={r.strMealThumb} alt={r.strMeal} />
            <h3>{r.strMeal}</h3>
            {r.strCategory && <p className="categoria">{r.strCategory}</p>}
          </div>
        ))}
      </div>

      {(recetaSeleccionada || cargandoDetalle) && (
        <div className="overlay" onClick={cerrarDetalle}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar" onClick={cerrarDetalle}>
              ×
            </button>

            {cargandoDetalle && <p className="mensaje">Cargando receta...</p>}

            {recetaSeleccionada && !cargandoDetalle && (
              <>
                <h2>{recetaSeleccionada.strMeal}</h2>
                <img
                  src={recetaSeleccionada.strMealThumb}
                  alt={recetaSeleccionada.strMeal}
                  className="imagen-detalle"
                />
                <p className="categoria">
                  {recetaSeleccionada.strCategory} · {recetaSeleccionada.strArea}
                </p>

                <h3>Ingredientes</h3>
                <ul className="lista-ingredientes">
                  {obtenerIngredientes(recetaSeleccionada).map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>

                <h3>Instrucciones</h3>
                <p className="instrucciones">
                  {recetaSeleccionada.strInstructions}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Receta;