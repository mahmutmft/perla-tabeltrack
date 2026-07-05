const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function PinPad({ value, onChange, length = 4 }) {
  function press(key) {
    if (key === '') return;
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length < length) onChange(value + key);
  }

  return (
    <div>
      <div className="pin-display">
        {Array.from({ length }).map((_, i) => (
          <div key={i} className={`pin-dot ${i < value.length ? 'filled' : ''}`} />
        ))}
      </div>
      <div style={{ height: 20 }} />
      <div className="pin-pad">
        {KEYS.map((key, i) =>
          key === '' ? (
            <div key={i} />
          ) : (
            <button key={i} type="button" onClick={() => press(key)}>
              {key === 'del' ? '⌫' : key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
