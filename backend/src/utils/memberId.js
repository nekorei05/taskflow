/** Normalize userId whether it's an ObjectId, populated User doc, or string */
const toIdString = (id) => {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id._id != null) return String(id._id);
  return String(id);
};

module.exports = { toIdString };
