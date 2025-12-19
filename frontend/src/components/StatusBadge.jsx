export default function StatusBadge({ status }) {
  const color = status === 'active' ? 'green' : 'red';

  return (
    <span style={{
      padding: '4px 8px',
      background: color,
      color: '#fff',
      borderRadius: 4
    }}>
      {status}
    </span>
  );
}
