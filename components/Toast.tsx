export default function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className="toast" style={{ animation: 'slideIn 0.3s ease' }}>
      {message}
    </div>
  );
}
