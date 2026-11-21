// Mammals pictures for the Consonant blends and Sound families cards, keyed by the shared sound id.
// Each entry is [word with the sound in [brackets], picture word id]. The brackets mark the letters shown
// in red. A sound with no fitting Mammals word shows text only (the card still plays its recording).
// Gaps, for the vocabulary plan or a later card brief (21 November 2026): blends cr ft gl lp lt pr pt sc scr
// shl sm sp sr thr tw xt; families oy ure yoo y zh tion ture.
// Until scripts/create-sound-cards.py makes the small cards, each card uses the word's own picture.
import { letterPicture } from "./letter-pictures.js";

export const blendSources = {
  "blend-bl": ["[bl]owhole", "blowhole"], "blend-br": ["[br]anch", "branch"], "blend-cl": ["[cl]aw", "claw"],
  "blend-dr": ["[dr]ink", "drink"], "blend-fl": ["[fl]ipper", "flipper"], "blend-fr": ["[fr]uit", "fruit"],
  "blend-gr": ["[gr]ass", "grass"], "blend-lf": ["wo[lf]", "wolf"], "blend-lk": ["mi[lk]", "milk"],
  "blend-mp": ["ju[mp]", "jump"], "blend-nch": ["bra[nch]", "branch"], "blend-nd": ["po[nd]", "pond"],
  "blend-nk": ["dri[nk]", "drink"], "blend-nt": ["elepha[nt]", "elephant"],
  "blend-pl": ["[pl]atypus", "platypus"], "blend-sk": ["[sk]in", "skin"], "blend-sl": ["[sl]oth", "sloth"],
  "blend-sn": ["[sn]iff", "sniff"], "blend-st": ["fore[st]", "forest"], "blend-str": ["[str]etch", "stretch"],
  "blend-tr": ["[tr]unk", "trunk"],
};
export const familySources = {
  "short-a": ["c[a]t", "cat"], "short-e": ["[e]lephant", "elephant"], "short-i": ["p[i]g", "pig"],
  "short-o": ["d[o]g", "dog"], "short-u": ["c[u]b", "cub"], ay: ["wh[a]l[e]", "whale"], ee: ["sh[ee]p", "sheep"],
  eye: ["t[i]ger", "tiger"], oh: ["g[oa]t", "goat"], oo: ["h[oo]f", "hoof"], "short-oo": ["w[o]lf", "wolf"],
  ar: ["gr[a]ss", "grass"], or: ["h[or]se", "horse"], er: ["f[ur]", "fur"], ow: ["c[ow]", "cow"],
  ear: ["d[eer]", "deer"], air: ["b[ear]", "bear"],
  b: ["[b]at", "bat"], k: ["[c]at", "cat"], ch: ["[ch]ew", "chew"], d: ["[d]og", "dog"],
  f: ["[f]ur", "fur"], g: ["[g]oat", "goat"], h: ["[h]op", "hop"], j: ["[j]ump", "jump"], l: ["[l]ion", "lion"],
  m: ["[m]onkey", "monkey"], n: ["[n]ose", "nose"], ng: ["lu[ng]s", "lungs"], p: ["[p]aw", "paw"],
  qu: ["s[qu]irrel", "squirrel"], r: ["[r]at", "rat"], s: ["[s]eal", "seal"], sh: ["[sh]eep", "sheep"],
  t: ["[t]ail", "tail"], th: ["too[th]", "tooth"], "voiced-th": ["brea[th]e", "breathe"], v: ["di[v]e", "dive"],
  w: ["[wh]ale", "whale"], ks: ["fo[x]", "fox"], z: ["[z]ebra", "zebra"], schwa: ["zebr[a]", "zebra"],
};
const toPictures = (sources) => Object.fromEntries(
  Object.entries(sources).map(([id, [word, wordId]]) => [id, { word, src: letterPicture(wordId) }]),
);
export const blendPictures = toPictures(blendSources);
export const familyPictures = toPictures(familySources);
