function formatMonto(monto, tipo) {
  const signo = tipo === "egreso" ? "-" : "+";
  return `${signo} $${Number(monto).toFixed(2)}`;
}

function MovimientosList({ movimientos, loading }) {
  if (loading) return <p>Cargando movimientos...</p>;
  if (!movimientos.length) return <p>Todavia no hay movimientos cargados.</p>;

  return (
    <div className="table-scroll">
      <table className="movimientos-list">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Lugar</th>
            <th>Categoria</th>
            <th>Descripcion</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.id} className={`tipo-${m.tipo}`}>
              <td>{m.fecha.slice(0, 10)}</td>
              <td>{m.lugar_nombre}</td>
              <td>{m.categoria_nombre || "—"}</td>
              <td>{m.descripcion || "—"}</td>
              <td className="monto">{formatMonto(m.monto, m.tipo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MovimientosList;
