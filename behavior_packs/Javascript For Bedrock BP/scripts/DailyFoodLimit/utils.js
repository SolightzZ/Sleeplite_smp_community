export function fixname(id) {
  if (!id) return "";
  const raw = id.includes(":") ? id.split(":")[1] : id;
  return raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, " ");
}

export function isfood(set, id) {
  return set.has(id);
}
