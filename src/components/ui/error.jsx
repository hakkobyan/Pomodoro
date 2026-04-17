export function Error({ children, size = "small" }) {
  return <div className={`input-error input-error-${size}`}>{children}</div>;
}
