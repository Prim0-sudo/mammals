// British-English sound plans for every Mammals word part, written by hand (21 November 2026).
// No spelling-rule fallback: a word with no plan cannot be sounded out. Format as in Plants and Insects:
// grapheme:sound, + for two sounds on one written group, _ joins a split grapheme (i_e),
// - marks a silent group. Parts shared with Insects keep the Insects plans. Teacher review pending.
export const AUTHORED_SOUND_PLANS = {
  // Meet the Mammals
  cat: 'c:k a:short-a t:t', dog: 'd:d o:short-o g:g', rabbit: 'r:r a:short-a bb:b i:short-i t:t',
  hamster: 'h:h a:short-a m:m s:s t:t er:schwa', guinea: 'gu:g i:short-i n:n ea:ee', pig: 'p:p i:short-i g:g',
  mouse: 'm:m ou:ow s:s e:-', rat: 'r:r a:short-a t:t', horse: 'h:h or:or s:s e:-',
  donkey: 'd:d o:short-o n:ng k:k ey:ee', cow: 'c:k ow:ow', sheep: 'sh:sh ee:ee p:p', goat: 'g:g oa:oh t:t',
  squirrel: 's:s qu:qu i:short-i rr:r e:schwa l:l', hedgehog: 'h:h e:short-e dge:j h:h o:short-o g:g',
  fox: 'f:f o:short-o x:ks', wolf: 'w:w o:short-oo l:l f:f', deer: 'd:d eer:ear', moose: 'm:m oo:oo s:s e:-',
  bear: 'b:b ear:air', polar: 'p:p o:oh l:l ar:schwa', lion: 'l:l i:eye o:schwa n:n', tiger: 't:t i:eye g:g er:schwa',
  cheetah: 'ch:ch ee:ee t:t ah:schwa', leopard: 'l:l eo:short-e p:p ar:schwa d:d',
  elephant: 'e:short-e l:l e:schwa ph:f a:schwa n:n t:t', giraffe: 'g:j i:schwa r:r a:ar ff:f e:-',
  zebra: 'z:z e:short-e b:b r:r a:schwa', rhinoceros: 'rh:r i:eye n:n o:short-o c:s e:schwa r:r o:schwa s:s',
  hippopotamus: 'h:h i:short-i pp:p o:schwa p:p o:short-o t:t a:schwa m:m u:schwa s:s', camel: 'c:k a:short-a m:m e:schwa l:l',
  monkey: 'm:m o:short-u n:ng k:k ey:ee', chimpanzee: 'ch:ch i:short-i m:m p:p a:short-a n:n z:z ee:ee',
  gorilla: 'g:g o:schwa r:r i:short-i ll:l a:schwa', sloth: 's:s l:l o:oh th:th', bat: 'b:b a:short-a t:t',
  kangaroo: 'k:k a:short-a n:ng g:g a:schwa r:r oo:oo', koala: 'k:k o:oh a:ar l:l a:schwa',
  wombat: 'w:w o:short-o m:m b:b a:short-a t:t', platypus: 'p:p l:l a:short-a t:t y:short-i p:p u:schwa s:s',
  echidna: 'e:short-i ch:k i:short-i d:d n:n a:schwa', whale: 'wh:w a_e:ay l:l',
  dolphin: 'd:d o:short-o l:l ph:f i:short-i n:n', porpoise: 'p:p or:or p:p oi:schwa s:s e:-', seal: 's:s ea:ee l:l',
  sea: 's:s ea:ee', walrus: 'w:w a:or l:l r:r u:schwa s:s', otter: 'o:short-o tt:t er:schwa',
  manatee: 'm:m a:short-a n:n a:schwa t:t ee:ee', dugong: 'd:d u:oo g:g o:short-o ng:ng',

  // Bodies Up Close
  fur: 'f:f ur:er', skin: 's:s k:k i:short-i n:n', backbone: 'b:b a:short-a ck:k b:b o_e:oh n:n',
  lungs: 'l:l u:short-u ng:ng s:z', eye: 'eye:eye', ear: 'ear:ear', nose: 'n:n o_e:oh s:z',
  whiskers: 'wh:w i:short-i s:s k:k er:schwa s:z', mouth: 'm:m ou:ow th:th', tooth: 't:t oo:oo th:th',
  tongue: 't:t o:short-u ngue:ng', paw: 'p:p aw:or', claw: 'c:k l:l aw:or', hoof: 'h:h oo:oo f:f',
  tail: 't:t ai:ay l:l', mane: 'm:m a_e:ay n:n', horn: 'h:h or:or n:n', antlers: 'a:short-a n:n t:t l:l er:schwa s:z',
  tusk: 't:t u:short-u s:s k:k', trunk: 't:t r:r u:short-u n:ng k:k', pouch: 'p:p ou:ow ch:ch',
  flipper: 'f:f l:l i:short-i pp:p er:schwa', blowhole: 'b:b l:l ow:oh h:h o_e:oh l:l',

  // Mothers & Young
  milk: 'm:m i:short-i l:l k:k', feed: 'f:f ee:ee d:d', kitten: 'k:k i:short-i tt:t e:schwa n:n',
  puppy: 'p:p u:short-u pp:p y:ee', calf: 'c:k a:ar l:- f:f', lamb: 'l:l a:short-a m:m b:-', kid: 'k:k i:short-i d:d',
  foal: 'f:f oa:oh l:l', cub: 'c:k u:short-u b:b', joey: 'j:j o:oh ey:ee',

  // Food & Feeding
  grass: 'g:g r:r a:ar ss:s', leaf: 'l:l ea:ee f:f', fruit: 'f:f r:r ui:oo t:t', seed: 's:s ee:ee d:d',
  seagrass: 's:s ea:ee g:g r:r a:ar ss:s', water: 'w:w a:or t:t er:schwa', chew: 'ch:ch ew:oo',
  drink: 'd:d r:r i:short-i n:ng k:k',

  // Homes & Shelters
  burrow: 'b:b u:short-u rr:r ow:oh', den: 'd:d e:short-e n:n', cave: 'c:k a_e:ay v:v', branch: 'b:b r:r a:ar n:n ch:ch',

  // On the Move
  walk: 'w:w a:or l:- k:k', run: 'r:r u:short-u n:n', hop: 'h:h o:short-o p:p', jump: 'j:j u:short-u m:m p:p',
  climb: 'c:k l:l i:eye m:m b:-', stretch: 's:s t:t r:r e:short-e tch:ch', carry: 'c:k a:short-a rr:r y:ee',
  dig: 'd:d i:short-i g:g', swim: 's:s w:w i:short-i m:m', dive: 'd:d i_e:eye v:v', float: 'f:f l:l oa:oh t:t',
  fly: 'f:f l:l y:eye',

  // Senses & Survival
  sniff: 's:s n:n i:short-i ff:f', breathe: 'b:b r:r ea:ee th:voiced-th e:-', groom: 'g:g r:r oo:oo m:m',
  hide: 'h:h i_e:eye d:d', sleep: 's:s l:l ee:ee p:p',

  // Habitats & Seasons
  land: 'l:l a:short-a n:n d:d', forest: 'f:f o:short-o r:r e:short-i s:s t:t',
  grassland: 'g:g r:r a:ar ss:s l:l a:schwa n:n d:d', desert: 'd:d e:short-e s:z er:schwa t:t', snow: 's:s n:n ow:oh',
  river: 'r:r i:short-i v:v er:schwa', lake: 'l:l a_e:ay k:k', pond: 'p:p o:short-o n:n d:d',
  ocean: 'o:oh c:sh ea:schwa n:n', floor: 'f:f l:l oor:or', ice: 'i_e:eye c:s',
  // Other Animals (vocabulary plan, 22 November 2026; shared parts keep the Insects plans)
  bird: 'b:b ir:er d:d', robin: 'r:r o:short-o b:b i:short-i n:n', owl: 'ow:ow l:l', eagle: 'ea:ee g:g le:schwa+l',
  duck: 'd:d u:short-u ck:k', chicken: 'ch:ch i:short-i ck:k e:schwa n:n',
  penguin: 'p:p e:short-e n:ng g:g u:w i:short-i n:n', snake: 's:s n:n a_e:ay k:k',
  lizard: 'l:l i:short-i z:z ar:schwa d:d', tortoise: 't:t or:or t:t oi:schwa s:s e:-',
  turtle: 't:t ur:er t:t le:schwa+l', crocodile: 'c:k r:r o:short-o c:k o:schwa d:d i_e:eye l:l',
  frog: 'f:f r:r o:short-o g:g', toad: 't:t oa:oh d:d', tadpole: 't:t a:short-a d:d p:p o_e:oh l:l',
  newt: 'n:n ew:y+oo t:t', salamander: 's:s a:short-a l:l a:schwa m:m a:short-a n:n d:d er:schwa',
  fish: 'f:f i:short-i sh:sh', goldfish: 'g:g o:oh l:l d:d f:f i:short-i sh:sh',
  salmon: 's:s a:short-a l:- m:m o:schwa n:n', shark: 'sh:sh ar:ar k:k', seahorse: 's:s ea:ee h:h or:or s:s e:-',
  ant: 'a:short-a n:n t:t', bee: 'b:b ee:ee', butterfly: 'b:b u:short-u tt:t er:schwa f:f l:l y:eye',
  ladybird: 'l:l a:ay d:d y:ee b:b ir:er d:d', spider: 's:s p:p i:eye d:d er:schwa', snail: 's:s n:n ai:ay l:l',
  worm: 'w:w or:er m:m', crab: 'c:k r:r a:short-a b:b', octopus: 'o:short-o c:k t:t o:schwa p:p u:schwa s:s',
  jellyfish: 'j:j e:short-e ll:l y:ee f:f i:short-i sh:sh',
};

export const PRONUNCIATION_NOTES = {
  guinea: 'Said GIN-ee: the u is silent after the g, and the ea says ee.',
  calf: 'The l is silent, as in half.',
  lamb: 'The final b is silent.',
  climb: 'The final b is silent.',
  walk: 'The l is silent and the a says or, as in talk.',
  tongue: 'The ngue at the end makes one ng sound.',
  breathe: 'The th is the buzzing th of this, and the final e is silent.',
  ocean: 'The c says sh, as in special.',
  koala: 'Uses the British koh-AH-luh model.',
  echidna: 'Said ih-KID-nuh: the ch says k.',
  giraffe: 'Uses the British juh-RAHF model; the final e is silent.',
  leopard: 'The eo says the e in bed.',
  porpoise: 'The oi says uh: POR-puss.',
  squirrel: 'The qu says kw.',
  penguin: 'The u says w, as in language.',
  tortoise: 'The oi says uh: TOR-tuss.',
  salmon: 'The l is silent: SAM-un.',
  newt: 'The ew says yoo, as in new.',
};

// IPA for each sound id (same table as Plants and Insects; the British recordings use these ids).
export const PHONEMES = { h: 'h', ow: 'aʊ', s: 's', oh: 'əʊ', m: 'm', sh: 'ʃ', 'short-o': 'ɒ', p: 'p', 'short-a': 'æ', 'short-i': 'ɪ', n: 'n', b: 'b', ng: 'ŋ', k: 'k', d: 'd', r: 'ɹ', t: 't', 'short-e': 'ɛ', ks: 'ks', l: 'l', f: 'f', 'voiced-th': 'ð', ee: 'iː', oo: 'uː', z: 'z', ch: 'tʃ', ar: 'ɑː', th: 'θ', g: 'ɡ', w: 'w', ay: 'eɪ', eye: 'aɪ', er: 'ɜː', 'short-u': 'ʌ', oy: 'ɔɪ', or: 'ɔː', 'short-oo': 'ʊ', j: 'dʒ', v: 'v', y: 'j', zh: 'ʒ', schwa: 'ə', air: 'eə', ear: 'ɪə', qu: 'kw' };

export function soundPlan(word) { return compileSoundPlan(word, AUTHORED_SOUND_PLANS); }
export function compileSoundPlan(word, plans) {
  if (typeof word !== 'string' || !word) return null;
  const groups = []; let offset = 0;
  for (const part of word.toLowerCase().split(/(\s+|-)/)) {
    if (!part) continue;
    if (/^[\s-]+$/.test(part)) { offset += part.length; continue; }
    if (!/^[a-z']+$/.test(part) || !Object.hasOwn(plans, part)) return null;
    const used = new Set();
    for (const token of plans[part].split(' ')) {
      const [grapheme, source, ...extra] = token.split(':');
      if (!grapheme || !source || extra.length) return null;
      const sounds = source === '-' ? [null] : source.split('+');
      if (sounds.some((s) => s !== null && !Object.hasOwn(PHONEMES, s))) return null;
      const indices = []; let cursor = 0;
      for (const piece of grapheme.split('_')) {
        if (!/^[a-z]+$/.test(piece)) return null;
        let start = part.indexOf(piece, cursor);
        while (start >= 0 && [...piece].some((_, i) => used.has(start + i))) start = part.indexOf(piece, start + 1);
        if (start < 0) return null;
        for (let i = 0; i < piece.length; i++) { used.add(start + i); indices.push(offset + start + i); }
        cursor = start + piece.length;
      }
      for (const sound of sounds) groups.push({ indices: [...indices], sound, grapheme });
    }
    if (used.size !== [...part].filter((c) => /[a-z]/.test(c)).length) return null;
    offset += part.length;
  }
  return groups.length ? groups : null;
}
