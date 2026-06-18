import './Spinner.css';

export default function Spinner({ size = 20, color = 'var(--color-accent)' }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size, borderColor: `${color} transparent transparent transparent` }}
      role="status"
      aria-label="Carregando"
    />
  );
}
