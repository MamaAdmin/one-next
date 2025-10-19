export const decodeHtmlEntities = (str: string) => {
  if (!str) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

export const decodeHtmlEntitiesDeep = (str: string, maxPasses = 5) => {
  if (!str) return "";
  let prev = str;
  for (let i = 0; i < maxPasses; i++) {
    const next = decodeHtmlEntities(prev);
    if (next === prev) break;
    prev = next;
  }
  return prev;
};
