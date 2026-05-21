import { userInitials } from '../utils/userInitials';

export default function UserAvatar({ name, size = 'md', className = '' }) {
  const initials = userInitials(name);
  return (
    <span
      className={`user-avatar user-avatar--${size} ${className}`.trim()}
      title={name || undefined}
      aria-hidden={!name}
    >
      {initials}
    </span>
  );
}
