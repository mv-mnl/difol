function StatTile({ label, value, sub }) {
  return (
    <div className="stat-tile">
      <span className="label">{label}</span>
      <span className="stat-tile-value">{value}</span>
      {sub && <span className="stat-tile-sub">{sub}</span>}
    </div>
  );
}

export default StatTile;
