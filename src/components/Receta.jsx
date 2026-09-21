import { useState, useEffect } from "react";

const CATEGORIAS_UI = {
  Beef: "Res", Breakfast: "Desayuno", Chicken: "Pollo", Dessert: "Postres",
  Goat: "Cabra", Lamb: "Cordero", Miscellaneous: "Variado", Pasta: "Pasta",
  Pork: "Cerdo", Seafood: "Mariscos", Side: "Acompañamientos",
  Starter: "Entradas", Vegan: "Vegano", Vegetarian: "Vegetariano",
};
const nombreCategoria = (cat) => CATEGORIAS_UI[cat] ?? cat;

function Receta() {
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);

  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
      .then((res) => res.json())
      .then((data) => setCategorias(data.meals))
      .catch(() => setCategorias([]));
  }, []);

  const buscar = async (url, esCategoria) => {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(url);
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

  const buscarPorNombre = () => {
    if (!busqueda.trim()) return;
    setCategoriaSeleccionada("");
    buscar(`https://www.themealdb.com/api/json/v1/1/search.php?s=${busqueda}`);
  };

  const buscarPorCategoria = (categoria) => {
    const nueva = categoriaSeleccionada === categoria ? "" : categoria;
    setCategoriaSeleccionada(nueva);
    setBusqueda("");
    if (!nueva) return setRecetas([]);
    buscar(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${nueva}`);
  };

  const verDetalle = async (id) => {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    setRecetaSeleccionada(data.meals[0]);
  };

  const obtenerIngredientes = (receta) => {
    const lista = [];
    for (let i = 1; i <= 20; i++) {
      const ingrediente = receta[`strIngredient${i}`];
      if (ingrediente && ingrediente.trim()) {
        lista.push({ nombre: ingrediente.trim(), medida: (receta[`strMeasure${i}`] || "").trim() });
      }
    }
    return lista;
  };

  const obtenerPasos = (texto) =>
    (texto || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  return (
    <div>
      <div className="buscador">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscarPorNombre()}
          placeholder="Buscar receta (ej: chicken)"
        />
        <button className="boton-buscar" onClick={buscarPorNombre}>Buscar</button>
      </div>
      <p className="ayuda-busqueda">Los nombres están en inglés: prueba con chicken, pasta o cake.</p>

      {categorias.length > 0 && (
        <div className="chips">
          {categorias.map((cat) => (
            <button
              key={cat.strCategory}
              className={`chip ${categoriaSeleccionada === cat.strCategory ? "activo" : ""}`}
              onClick={() => buscarPorCategoria(cat.strCategory)}
            >
              {nombreCategoria(cat.strCategory)}
            </button>
          ))}
        </div>
      )}

      {cargando && <p className="mensaje">Cargando recetas...</p>}

      {error && !cargando && (
        <div className="mensaje error">
          <h2>Sin resultados</h2>
          <p>{error}</p>
        </div>
      )}

      {!cargando && !error && recetas.length === 0 && (
        <div className="mensaje">
          <h2>¿Con qué antojo empezamos?</h2>
          <p>Busca una receta por nombre o elige una categoría</p>
        </div>
      )}

      {!cargando && !error && recetas.length > 0 && (
        <p className="contador">{recetas.length} recetas encontradas</p>
      )}

      <div className="grid-recetas">
        {recetas.map((r) => (
          <div className="tarjeta" key={r.idMeal} onClick={() => verDetalle(r.idMeal)}>
            <img src={r.strMealThumb} alt={r.strMeal} loading="lazy" />
            <div className="tarjeta-info">
              <h3>{r.strMeal}</h3>
              {r.strArea && <p className="tarjeta-area">{r.strArea}</p>}
            </div>
          </div>
        ))}
      </div>

      {recetaSeleccionada && (
        <div className="overlay" onClick={() => setRecetaSeleccionada(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar" onClick={() => setRecetaSeleccionada(null)}>×</button>
            <div className="modal-contenido">
              <img className="imagen-detalle" src={recetaSeleccionada.strMealThumb} alt={recetaSeleccionada.strMeal} />
              <h2>{recetaSeleccionada.strMeal}</h2>
              {recetaSeleccionada.strCategory && (
                <span className="badge">{nombreCategoria(recetaSeleccionada.strCategory)}</span>
              )}

              <h3>Ingredientes</h3>
              <ul className="lista-ingredientes">
                {obtenerIngredientes(recetaSeleccionada).map((ing, i) => (
                  <li key={i}>
                    {ing.nombre} {ing.medida && <span className="medida">— {ing.medida}</span>}
                  </li>
                ))}
              </ul>

              <h3>Instrucciones</h3>
              <ol className="pasos">
                {obtenerPasos(recetaSeleccionada.strInstructions).map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ol>

              {recetaSeleccionada.strYoutube && (
                <a className="boton-video" href={recetaSeleccionada.strYoutube} target="_blank" rel="noopener noreferrer">
                  Ver video en YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receta;