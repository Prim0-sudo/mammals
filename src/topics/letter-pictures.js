// Mammals pictures for the phonics alphabet letter cards (layout C2: letter left, picture and word right).
// Each entry is [word with the letters taught in [brackets], picture word id]. Most words start with the
// letter's main sound; where no Mammals word does, a word that clearly contains it is used (as Insects
// does). Y has no Mammals word with a y sound yet, so its card shows the letter alone.
// Until scripts/create-sound-cards.py makes the small cards, each card uses the word's own picture.
export const letterSources = {
  a: ["[a]ntlers", "antlers"], b: ["[b]ear", "bear"], c: ["[c]at", "cat"], d: ["[d]og", "dog"],
  e: ["[e]lephant", "elephant"], f: ["[f]ox", "fox"], g: ["[g]oat", "goat"], h: ["[h]orse", "horse"],
  i: ["p[i]g", "pig"], j: ["[j]oey", "joey"], k: ["[k]itten", "kitten"], l: ["[l]ion", "lion"],
  m: ["[m]ouse", "mouse"], n: ["[n]ose", "nose"], o: ["sea [o]tter", "sea-otter"], p: ["[p]ig", "pig"],
  q: ["s[qu]irrel", "squirrel"], r: ["[r]abbit", "rabbit"], s: ["[s]eal", "seal"], t: ["[t]iger", "tiger"],
  u: ["c[u]b", "cub"], v: ["di[v]e", "dive"], w: ["[w]olf", "wolf"], x: ["fo[x]", "fox"],
  z: ["[z]ebra", "zebra"],
};
export const letterPicture = (id) => `assets/topics/mammals/vocabulary/${id}.webp`;
export const letterPictures = Object.fromEntries(
  Object.entries(letterSources).map(([letter, [word, id]]) => [letter, { word, src: letterPicture(id) }]),
);
