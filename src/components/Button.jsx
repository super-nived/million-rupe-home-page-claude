import { btnStyle } from '../styles/theme';

export default function Button({ onClick, children, style }) {
  return (
    <button onClick={onClick} style={{ ...btnStyle, ...style }}>
      {children}
    </button>
  );
}
