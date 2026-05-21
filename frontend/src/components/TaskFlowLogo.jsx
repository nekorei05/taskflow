const BRAND_BLUE = '#3B6FF0';

/** TaskFlow mark — favicon 16, sidebar 34, auth 64 */
export default function TaskFlowLogo({ size = 64, className = '' }) {
  const radius = Math.round(size * 0.25);
  const iconSize = Math.round(size * 0.625);

  return (
    <div
      className={`taskflow-logo ${className}`.trim()}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: BRAND_BLUE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 40 40" fill="none">
        <rect x="4" y="11" width="24" height="5" rx="2.5" fill="white" />
        <rect x="4" y="18" width="17" height="5" rx="2.5" fill="white" fillOpacity="0.75" />
        <rect x="4" y="25" width="11" height="5" rx="2.5" fill="white" fillOpacity="0.5" />
        <polygon points="26,17 34,22 26,27" fill="white" />
      </svg>
    </div>
  );
}
