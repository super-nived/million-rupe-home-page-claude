import { MIN_PIXELS } from '../../constants/grid';
import { fmtRupees } from '../../utils/formatters';
import { colors, btnStyle, inputStyle } from '../../styles/theme';

export default function PurchasePanel({ selection, form, onFormChange, onClear, onPurchase, onImageUpload }) {
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onImageUpload(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        background: colors.bgOverlay,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 12,
        padding: '12px 16px',
        width: 'min(420px,calc(100vw - 20px))',
        zIndex: 200,
        boxShadow: '0 10px 40px rgba(0,0,0,.5)',
      }}
    >
      {!selection ? (
        <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: 13, padding: '10px 0' }}>
          <div style={{ fontSize: 22, marginBottom: 4, opacity: 0.6 }}>⬚</div>
          Drag on the grid to select pixels
          <div style={{ fontSize: 10, marginTop: 4, color: colors.textDimmer }}>
            ₹1/pixel · Minimum {MIN_PIXELS} pixels (₹{MIN_PIXELS})
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 13 }}>
              <span style={{ color: colors.textMuted }}>Area: </span>
              <b>
                {selection.bw}×{selection.bh}px
              </b>
              <span style={{ color: colors.textDimmer, fontSize: 10 }}> ({selection.px}px)</span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: colors.accent }}>
              {fmtRupees(selection.px)}
            </span>
            {selection.px < MIN_PIXELS && selection.free && (
              <span
                style={{
                  fontSize: 10,
                  color: colors.accent,
                  fontWeight: 700,
                  background: '#f59e0b18',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                Min {MIN_PIXELS}px
              </span>
            )}
            {!selection.free && (
              <span
                style={{
                  fontSize: 10,
                  color: colors.error,
                  fontWeight: 700,
                  background: '#ef444418',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                Occupied!
              </span>
            )}
          </div>

          {selection.free ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  placeholder="Ad name *"
                  value={form.label}
                  onChange={(e) => onFormChange('label', e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="Your name"
                  value={form.owner}
                  onChange={(e) => onFormChange('owner', e.target.value)}
                  style={{ ...inputStyle, maxWidth: 110 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  placeholder="https://your-site.com"
                  value={form.url}
                  onChange={(e) => onFormChange('url', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => onFormChange('color', e.target.value)}
                  style={{
                    width: 34,
                    height: 34,
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: 6,
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                />
              </div>

              {/* Image upload */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <label
                  style={{
                    ...btnStyle,
                    flex: 1,
                    padding: '8px 11px',
                    fontSize: 11,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>{form.image ? '✓ Change Image' : '🖼 Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {form.image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img
                      src={form.image}
                      alt="Preview"
                      style={{
                        width: 34,
                        height: 34,
                        objectFit: 'cover',
                        borderRadius: 6,
                        border: `1px solid ${colors.borderLight}`,
                      }}
                    />
                    <button
                      onClick={() => onImageUpload(null)}
                      style={{ ...btnStyle, padding: '4px 8px', fontSize: 10 }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={onClear} style={{ ...btnStyle, flex: 1, padding: 9, fontSize: 12 }}>
                  Clear
                </button>
                <button
                  onClick={onPurchase}
                  style={{
                    ...btnStyle,
                    flex: 2,
                    padding: 9,
                    fontSize: 12,
                    background: colors.accent,
                    color: colors.bg,
                    fontWeight: 700,
                    border: 'none',
                  }}
                >
                  Pay {fmtRupees(selection.px)} →
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onClear}
              style={{ ...btnStyle, width: '100%', padding: 9, fontSize: 12, marginTop: 2 }}
            >
              Pick different area
            </button>
          )}
        </div>
      )}
    </div>
  );
}
