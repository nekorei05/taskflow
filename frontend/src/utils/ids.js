export function sameUserId(a, b) {
  if (!a || !b) return false;
  return String(a?._id ?? a) === String(b?._id ?? b);
}

export function userLabel(ref) {
  if (!ref) return 'Unassigned';
  if (typeof ref === 'object') return ref.name || ref.email || 'User';
  return 'User';
}
