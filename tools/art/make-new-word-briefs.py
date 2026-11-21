# Builds the Codex briefs for the 145 new Mammals words (owner approved the vocabulary plan, 22 Nov 2026).
# Same studio-photo prompt shape as make_waves.py: OPEN, STYLE, subject paragraph (+ FOCUS / FADE / SCENE).
import csv, os

OUT = r"E:\Projects\Codex\mammals-weekly-game\docs\word-art-redo"

OPEN = ("Scientific educational word picture for Mammal Discovery Club, ages 4–7. One isolated subject in a 1024 × 1024 "
        "square with real transparent alpha. Center the complete intended subject, roughly 85% of the square along its "
        "longest dimension, with clear margin and a silhouette legible at 120 px. True species anatomy, faithful natural "
        "colors, realistic fur and skin texture, no ink outlines, anthropomorphism, text, watermark, background or ground shadow.")
STYLE = ("Lifelike studio photograph cutout of the real animal, natural fur sheen and microtexture, soft directional studio "
         "light, neutral colour balance, subtle optical depth of field on whiskers and fur tips.")
STYLE_THING = ("Lifelike studio photograph cutout of the real object, natural material texture, soft directional studio light, "
               "neutral colour balance, subtle optical depth of field.")
STYLE_PEOPLE = ("Lifelike natural photograph cutout, real people in plain everyday outdoor clothes, soft directional light, "
                "neutral colour balance, subtle optical depth of field. Friendly, natural and calm; faces need not look at the camera.")
FOCUS = (" Focus treatment: the named part stays pin-sharp and in full colour; the rest of the animal is a little softer and "
         "paler, so the eye goes straight to the part. No arrows, circles, tints or labels.")
FADE = " Where the close-up leaves the rest of the animal out, it fades softly into transparency, never a hard straight cut."
SCENE = (" Scene word: a small natural scene cut out cleanly like a diorama piece, with soft, irregular edges that fade into "
         "transparency: no square or round frame, no sky, no horizon.")

W = {}
def add(batch, id_, text, style=STYLE):
    assert id_ not in W, id_
    W[id_] = (batch, style, text)

# Batch 5: Other Animals (32), all whole animals so Mammal or not? and Silhouette work
b = 5
add(b, "bird", "A house sparrow, whole bird, perched side-on on a short twig, wings folded; feathers, beak, eye and both feet clearly visible.")
add(b, "robin", "A European robin, whole bird, standing side-on on a short wooden fence post, orange-red face and chest, brown back, thin legs.")
add(b, "owl", "A barn owl, whole bird, perched upright on a short branch stub, white heart-shaped face, dark eyes, golden-buff back, wings folded. It must look clearly different from the eagle.")
add(b, "eagle", "A golden eagle, whole bird, perched side-on on a small rock, dark brown feathers with a golden nape, hooked yellow-based beak and big curved talons. It must look clearly different from the owl.")
add(b, "duck", "A male mallard duck, whole bird, standing side-on on a small patch of grassy bank, green head, yellow flat bill, orange webbed feet clearly visible.")
add(b, "chicken", "A brown hen, whole bird, standing side-on, red comb and wattles, yellow legs, calm.")
add(b, "penguin", "A king penguin, whole bird, standing upright side-on on a small slab of ice, black back, white front, orange patches on the neck, flippers by its sides. The ice stays small.")
add(b, "snake", "A grass snake, whole animal, loosely coiled on the ground, olive-green scales and a yellow collar behind the head, mouth closed, calm. It must look clearly different from a worm: show its scales and eye.")
add(b, "lizard", "A common lizard, whole animal, resting on a small flat stone, four legs, long tapering tail, brown scaly skin. It must look clearly different from the newt and salamander: dry scaly skin, clawed toes.")
add(b, "tortoise", "A Hermann's tortoise, whole animal, walking side-on on a small patch of grass, high domed patterned shell, scaly legs and head out. It must look clearly different from the turtle: domed shell, stumpy legs.")
add(b, "turtle", "A green sea turtle, whole animal, swimming side-on, flatter streamlined shell and long paddle-like flippers spread. No water. It must look clearly different from the tortoise.")
add(b, "crocodile", "A Nile crocodile, whole animal, lying side-on on a small patch of riverbank mud, mouth closed, long ridged tail, scaly armoured back, calm.")
add(b, "frog", "A common frog, whole animal, sitting side-on, smooth damp olive-brown skin, dark eye mask, long back legs folded. It must look clearly different from the toad: smooth, shiny skin.")
add(b, "toad", "A common toad, whole animal, sitting side-on, dry warty brown skin, golden eyes with horizontal pupils, short legs. It must look clearly different from the frog: bumpy, dry skin.")
add(b, "tadpole", "A frog tadpole, whole animal, side view, round dark body, long fin-edged tail and two small back legs just grown, enlarged. No water.")
add(b, "newt", "A smooth newt, whole animal, side view on a small patch of damp moss, slim body, long flattened tail, spotted skin and an orange belly edge. It must look clearly different from the lizard: soft damp skin, no claws.")
add(b, "salamander", "A fire salamander, whole animal, side view on a small patch of moss, shiny black skin with bold yellow blotches, plump body and tail.")
add(b, "fish", "A common roach or similar plain silver river fish, whole fish, side view, fins spread, scales and gill cover clearly visible. No water.")
add(b, "goldfish", "A common orange goldfish, whole fish, side view, fins spread, scales catching the light. No water, no bowl.")
add(b, "salmon", "An Atlantic salmon, whole fish, side view, silver body with small dark spots on its back, fins spread. No water.")
add(b, "shark", "A blacktip reef shark, whole fish, side view swimming level, grey body, five gill slits clearly visible, mouth closed, calm. No water. It must look clearly different from a dolphin: gill slits, upright tail.")
add(b, "seahorse", "A seahorse, whole animal, upright side view, tail curled round a short stem of seaweed, horse-like head and bony ridged body.")
add(b, "ant", "A single red wood ant, whole insect, side view, enlarged, three body parts, six legs and two antennae clearly visible.")
add(b, "bee", "A honeybee, whole insect, side view, enlarged, striped golden-brown furry body, clear wings, six legs and antennae.")
add(b, "butterfly", "A red admiral butterfly, whole insect, seen from above with its wings open flat, black wings with red bands and white spots.")
add(b, "ladybird", "A seven-spot ladybird, whole beetle, seen from above, enlarged, red wing cases with seven black spots, black head with white patches.")
add(b, "spider", "A garden cross spider, whole animal, seen from above, enlarged, round brown body with a pale cross mark, eight legs. No web.")
add(b, "snail", "A garden snail, whole animal, gliding side-on on a small green leaf, brown swirled shell, body and both pairs of tentacles out.")
add(b, "worm", "An earthworm, whole animal, lying on a small patch of dark soil in a gentle S curve, pink-brown ringed body, whole length visible. It must look clearly different from the snake.")
add(b, "crab", "A green shore crab, whole animal, seen from above, claws and eight walking legs spread, shell clearly visible.")
add(b, "octopus", "A common octopus, whole animal, resting on a small patch of sandy seabed, soft rounded head and eight curling arms with suckers spread out.")
add(b, "jellyfish", "A moon jellyfish, whole animal, drifting, see-through domed bell with four pale rings, short fine tentacles hanging below. A soft blue-grey cast keeps it visible; no water.")

# Batch 6: Animal Watching (12), Homes & Shelters (12), Senses & Survival (10)
b = 6
add(b, "grown-up", "A grown-up and a young child walking hand in hand away along a short woodland path, seen from behind, whole bodies visible, a little path fading out at the edges.", STYLE_PEOPLE)
add(b, "quiet", "A young child kneeling in long grass with one finger raised to their lips, saying shh, whole body visible, the grass fading out at the edges.", STYLE_PEOPLE)
add(b, "stay-back", "A grown-up and a young child standing still at the near edge of a small field, watching a deer standing far away across the grass; the deer is small in the distance." + SCENE, STYLE_PEOPLE)
add(b, "gentle", "A young child gently stroking a guinea pig that sits on a grown-up's lap, careful flat hand, calm guinea pig, the child and grown-up seen from the side.", STYLE_PEOPLE)
add(b, "binoculars", "A pair of black binoculars with a neck strap, seen at a slight angle so both eyepieces and both big lenses show. No person.", STYLE_THING)
add(b, "wildlife-hide", "A small wooden wildlife hide hut beside the edge of a lake, with long narrow viewing slots along its side, reeds around it. No people." + SCENE, STYLE_THING)
add(b, "notebook", "An open spiral notebook with a simple pencil sketch of a paw print on one page and a pencil lying beside it, seen from slightly above.", STYLE_THING)
add(b, "field-guide", "An open nature field guide book seen from slightly above, its pages showing rows of small realistic mammal pictures (fox, badger, hedgehog, rabbit) with blurred, unreadable name lines.", STYLE_THING)
add(b, "footprint", "One clear badger footprint pressed into smooth brown mud, five toe pads and claw marks above a wide pad, seen from above, the mud patch fading out at its edges.", STYLE_THING)
add(b, "droppings", "A small, tidy pile of round brown rabbit droppings on a small patch of short grass, seen from slightly above, clean-looking, not messy.", STYLE_THING)
add(b, "trail-camera", "A camouflage-patterned trail camera strapped with a webbing strap to a short section of tree trunk, lens and sensor window on the front. The trunk section fades out top and bottom.", STYLE_THING)
add(b, "wash-hands", "A child's two hands rubbing together under a running tap with white soap bubbles, at the edge of a sink, close view of the hands only.", STYLE_PEOPLE)

add(b, "warren", "A cutaway slice of grassy bank showing several joined underground rabbit tunnels and rooms, two rabbits resting inside them, the grass on top." + SCENE)
add(b, "sett", "A badger sett: a big hole under tree roots in a woodland bank with a mound of freshly dug soil in front, a badger's striped face peeping out of the hole." + SCENE)
add(b, "holt", "An otter holt: a dark hole among tree roots right at the water's edge of a riverbank, an otter's head and front paws at the entrance." + SCENE)
add(b, "roost", "Several small brown bats hanging upside down in a row under the wooden beams of a roof space, wings folded, seen from slightly below." + SCENE)
add(b, "nest", "A round, woven nest of dry grass blades held up on a few tall grass stems, a small side entrance hole. No animal and no bird.", STYLE_THING)
add(b, "drey", "A squirrel's drey: a round ball of twigs and leaves wedged in a fork of tree branches, a red squirrel peeping out of it. The branches fade out at their ends.")
add(b, "tree-hollow", "A short section of an old oak trunk with a round dark hollow hole in its bark. No animal. The trunk fades out top and bottom.", STYLE_THING)
add(b, "lodge", "A beaver lodge: a dome of sticks and mud rising out of a pond, a beaver swimming near it with its head above the water." + SCENE)
add(b, "hutch", "A wooden rabbit hutch with a wire-mesh front standing on a small patch of grass, a rabbit visible inside behind the mesh.", STYLE_THING)
add(b, "kennel", "A wooden dog kennel with a pitched roof and an arched doorway, a calm dog lying in the doorway with its head on its paws.", STYLE_THING)
add(b, "stable", "The front of a wooden stable with a half door, a brown horse looking out over the top of the door.", STYLE_THING)
add(b, "barn", "A red wooden farm barn with its big double doors open and hay bales stacked inside. No animals. It must look clearly different from the stable: big doors, hay, no animal.", STYLE_THING)

add(b, "listen", "A roe deer standing very still, head raised, both big ears turned forward to listen, side view.")
add(b, "camouflage", "An arctic fox in its white winter coat curled on a small patch of white snow, blending in, but its dark eyes and nose still visible so it can be spotted." + SCENE)
add(b, "curl-up", "A hedgehog curled up into a tight round ball of spines, face and feet tucked in, on a small patch of grass.")
add(b, "lookout", "A meerkat standing tall on its back legs on a small sandy mound, head tipped up, scanning the sky.")
add(b, "herd", "A herd of five plains zebras standing together on a patch of golden grassland, overlapping each other." + SCENE)
add(b, "pack", "A pack of four grey wolves walking in a line through a patch of snow, one behind the other." + SCENE)
add(b, "roar", "A male lion roaring, head raised, mouth open wide showing its teeth, mane flowing. Powerful but not frightening; no blood, no prey, no sound lines.")
add(b, "howl", "A grey wolf sitting with its head tipped back and muzzle pointed up, howling, mouth slightly open.")
add(b, "nocturnal", "A badger walking side-on on a small patch of grass at night, lit by soft cool moonlight, a pale full moon small above it. No square background; the night tint fades out at the edges." + SCENE)
add(b, "hibernate", "A hedgehog asleep, curled up in a snug nest of dry brown leaves at the foot of a hedge, a little frost on the leaves around it." + SCENE)

# Batch 7: Meet the Mammals (32)
b = 7
add(b, "harvest-mouse", "A harvest mouse, whole animal, climbing a golden wheat stem, gripping it with its feet and its tail curled round the stem, tiny and orange-brown. It must look clearly different from the wood mouse and the vole.")
add(b, "ferret", "A pet sable ferret, whole animal, standing side-on, long thin body, short legs, dark mask and furry tail. It must look clearly different from the stoat: darker mask, no black tail tip.")
add(b, "pony", "A Shetland pony, whole animal, standing side-on, short stocky body, thick shaggy mane and forelock, feathered legs. It must look clearly different from the donkey: short ears, thick mane.")
add(b, "llama", "A llama, whole animal, standing side-on, thick woolly coat, long upright neck and long curved banana-shaped ears, no hump. It must look clearly different from the camel.")
add(b, "red-squirrel", "A red squirrel, whole animal, sitting up on a short branch in three-quarter view, long ear tufts and big bushy tail clearly visible, empty front paws.")
add(b, "mole", "A European mole, whole animal, on a small patch of soil, velvety black fur, huge spade-like pink front paws turned outwards, pink pointed nose, tiny hidden eyes.")
add(b, "shrew", "A common shrew, whole animal, side view on a small patch of leaf litter, long pointed twitchy nose, tiny eyes, dark brown back and paler sides. It must look clearly different from the mouse and the vole: very long pointed nose.")
add(b, "vole", "A bank vole, whole animal, side view, round body, blunt rounded nose, small ears half hidden in fur and a short tail. It must look clearly different from the mouse: short tail, blunt face.")
add(b, "hare", "A brown hare, whole animal, sitting side-on, very long black-tipped ears, long back legs, golden-brown fur and amber eyes. It must look clearly different from the rabbit: longer ears and legs.")
add(b, "badger", "A European badger, whole animal, standing side-on, black and white striped face, grey body, short legs and strong front claws.")
add(b, "otter", "A Eurasian otter, whole animal, standing side-on on a small patch of riverbank, sleek brown fur, whiskers, small ears and a thick tapering tail. It must look clearly different from the beaver: thin tapering tail.")
add(b, "stoat", "A stoat, whole animal, standing up on its back legs, brown back, cream front and a clear black tip on its tail.")
add(b, "pine-marten", "A pine marten, whole animal, on a short branch, rich chocolate-brown fur, a creamy-yellow throat patch and a long bushy tail.")
add(b, "beaver", "A Eurasian beaver, whole animal, side view on a small patch of riverbank, flat paddle-shaped scaly tail and big orange front teeth just visible.")
add(b, "arctic-fox", "An arctic fox, whole animal, standing side-on in its thick white winter coat, small rounded ears, short muzzle, bushy tail.")
add(b, "fennec-fox", "A fennec fox, whole animal, sitting in three-quarter view, sandy-cream fur and enormous upright ears, small face.")
add(b, "dingo", "A dingo, whole animal, standing side-on, ginger coat, pointed upright ears, white feet and white tail tip, mouth closed. It must look clearly different from the wolf: slimmer, ginger.")
add(b, "reindeer", "A reindeer, whole animal, standing side-on, large branched antlers, pale shaggy neck fur and wide hooves. It must look clearly different from the moose: rounded antlers, pale neck, smaller face.")
add(b, "giant-panda", "A giant panda, whole animal, sitting, black eye patches, ears, legs and shoulder band on white fur, empty paws, no bamboo.")
add(b, "snow-leopard", "A snow leopard, whole animal, standing side-on, pale smoky-grey fur with dark rosettes and a very long thick tail. It must look clearly different from the leopard: pale grey, thick tail.")
add(b, "jaguar", "A jaguar, whole animal, standing side-on, stocky muscular body, broad head, golden coat with large rosettes that have spots inside them. It must look clearly different from the leopard: heavier, bigger head.")
add(b, "lynx", "A Eurasian lynx, whole animal, standing side-on, black ear tufts, facial ruff, big furry paws and a short black-tipped tail.")
add(b, "meerkat", "A meerkat, whole animal, sitting upright on its back legs, dark eye patches, thin tapering tail, front paws held in front.")
add(b, "baboon", "An olive baboon, whole animal, walking on all fours side-on, long dog-like muzzle, olive-grey fur, tail held in a curve. It must look clearly different from the vervet monkey: long muzzle, bigger body.")
add(b, "orangutan", "A Bornean orangutan, whole animal, sitting, long orange-red hair, very long arms resting on the ground, no tail, calm face.")
add(b, "gibbon", "A lar gibbon, whole animal, hanging by one very long arm from a short branch, white hands and face ring, no tail. It must look clearly different from the monkey: no tail, very long arms.")
add(b, "human", "A young child of about six standing and waving with one hand, whole body visible from head to shoes, smiling gently, plain everyday clothes.", STYLE_PEOPLE)
add(b, "wallaby", "A red-necked wallaby, whole animal, sitting up on its back feet with its long tail on the ground, reddish neck and shoulders, smaller and slimmer than a kangaroo.")
add(b, "sugar-glider", "A sugar glider, whole animal, sitting on a short branch, big dark eyes, a dark stripe down its head, grey fur and folded skin flaps along its sides.")
add(b, "blue-whale", "A blue whale, whole animal, side view swimming level, very long slender mottled blue-grey body, tiny dorsal fin far back near the tail. No water. It must look clearly different from the humpback whale: long and slim, short flippers.")
add(b, "orca", "An orca, whole animal, side view swimming level, glossy black body with white chin, belly and eye patch, grey saddle patch and a tall upright dorsal fin. No water.")
add(b, "narwhal", "A male narwhal, whole animal, side view swimming level, mottled grey and white body and one long straight spiral tusk from its upper lip. No water.")

# Batch 8: Bodies Up Close (9), Mothers & Young (8), Food & Feeding (11)
b = 8
add(b, "wool", "A close-up of a sheep's thick, curly cream fleece on its side, the sheep's head turned back towards the camera in soft focus." + FOCUS + FADE)
add(b, "spines", "A close-up of a hedgehog's back covered in stiff brown and cream spines, its face just visible at one side." + FOCUS + FADE)
add(b, "stripes", "A plains zebra's side and shoulder, bold black and white stripes filling the view, head turned towards the camera." + FOCUS + FADE)
add(b, "spots", "A cheetah's side and shoulder, golden coat covered in solid round black spots, head turned towards the camera." + FOCUS + FADE)
add(b, "snout", "A close-up of a pink pig's face from the front, its flat round snout with two nostrils in the middle." + FOCUS + FADE)
add(b, "bill", "A close-up of a platypus's head in three-quarter view, its broad, flat, rubbery duck-like bill." + FOCUS + FADE)
add(b, "webbed-feet", "An otter's back foot spread flat on a wet stone to show the webs of skin between its toes, the otter's body and tail in soft focus behind." + FOCUS + FADE)
add(b, "hump", "A one-humped dromedary camel standing side-on, its single tall hump on its back." + FOCUS)
add(b, "fin", "A bottlenose dolphin's back and tall curved dorsal fin rising out of the sea surface, a small patch of water around it fading out." + FOCUS)

add(b, "mother", "A mother orangutan sitting and hugging her baby against her chest, long orange hair, calm. The mother is the main subject.")
add(b, "baby", "A baby African elephant standing close beside its mother's front legs; only the mother's legs and lower trunk show, fading out above. The baby is the main subject.")
add(b, "born", "A newborn foal lying in golden straw, still wobbly and damp, its mother's head lowered to nuzzle it. The straw stays a small patch.")
add(b, "egg", "One small, white, slightly leathery platypus egg resting on a few damp brown leaves. No animal.", STYLE_THING)
add(b, "litter", "A mother pig lying on her side on a small patch of straw, a litter of eight small piglets lined up feeding along her belly.")
add(b, "piglet", "A small pink piglet standing side-on in front of an adult pig, which stays softer and partly fades out behind it.")
add(b, "fawn", "A spotted roe deer fawn standing in a small patch of long grass beside its mother's legs; the mother stays softer and partly fades out above.")
add(b, "pup", "A fluffy white grey seal pup lying on a small patch of sandy beach, big dark eyes, its mother's grey head beside it.")

add(b, "hay", "A rectangular bale of golden dried hay tied with two strings, seen at a slight angle. No animal.", STYLE_THING)
add(b, "bamboo", "A few tall green bamboo stems with ringed joints and narrow leaves. No animal.", STYLE_THING)
add(b, "berries", "A sprig of ripe blackberries with a few leaves, glossy dark purple berries and one red unripe one. No animal.", STYLE_THING)
add(b, "nuts", "A small pile of brown hazelnuts in their shells and a few acorns with their cups. No animal.", STYLE_THING)
add(b, "krill", "Three pink, see-through Antarctic krill, greatly enlarged, side view, long antennae, many legs and dark eyes. No whale, no water.")
add(b, "graze", "A sheep with its head down eating short grass, walking slowly across a small patch of field, side view. It must look different from the grass picture: the sheep is the main subject.")
add(b, "gnaw", "A beaver gnawing the trunk of a small tree, its big orange front teeth against the wood, pale wood chips on the ground at its feet.")
add(b, "plant-eater", "A wild rabbit nibbling a green dandelion leaf held in its mouth, side view, on a small patch of grass.")
add(b, "meat-eater", "A grey seal at the sea surface holding a whole silver fish across its mouth, calm, not gory, no blood. A small patch of water around it fades out.")
add(b, "predator", "A red fox creeping low through a small patch of grass, body crouched, ears forward and eyes fixed ahead. No prey animal shown.")
add(b, "prey", "A wild rabbit sitting up very alert on its back legs on a small patch of grass, ears raised, eyes wide, looking round. No predator shown.")

# Batch 9: On the Move (8), Habitats & Seasons (11)
b = 9
add(b, "wade", "A moose standing knee-deep in a small patch of still lake water, side view, water rippling round its long legs." + SCENE)
add(b, "gallop", "A chestnut horse galloping side-on at full speed, all four hooves off the ground at once, mane and tail streaming. No lines. It must look different from the run picture (a bay horse): chestnut coat, all hooves in the air.")
add(b, "scamper", "A wood mouse running fast along a short mossy log, legs blurred in quick small steps, tail out behind. No lines or extra poses.")
add(b, "pounce", "A red fox in mid-leap, body arched high, diving nose-first down towards a small patch of snow. No lines.")
add(b, "swing", "A lar gibbon swinging between two short branches, one long arm gripping a branch and the other reaching for the next, body swung out. No lines or arcs.")
add(b, "hang", "A small brown bat hanging upside down from a short twig by its feet, wings folded round its body. It must look different from the roost picture: one bat, one twig.")
add(b, "paddle", "A golden dog swimming, only its head and the top of its back above a small patch of water, its front legs paddling just below the surface." + SCENE)
add(b, "glide", "A sugar glider in mid-air, skin flaps stretched wide like a kite between its front and back legs, seen from below at a slight angle, tail out behind.")

add(b, "habitat", "A woodland edge in one small piece: a few trees, a hedge and a patch of meadow, with a rabbit by the meadow, a squirrel on a tree trunk and a hedgehog under the hedge, all small." + SCENE)
add(b, "rainforest", "A tall, misty tropical rainforest: layered trees, hanging vines, big leaves and a soft green mist. No animals." + SCENE)
add(b, "hedge", "A long green hawthorn hedge growing along the edge of a small strip of grassy field." + SCENE)
add(b, "garden", "A small garden: a green lawn, a flower bed of bright flowers and a short wooden fence. No animals, no people." + SCENE)
add(b, "farm", "A farm seen from a little distance: green fields, a red barn and a farmhouse, a few tiny cows far away." + SCENE)
add(b, "mountain", "A tall rocky mountain peak with snow on top and steep grey sides, a little green at its foot." + SCENE)
add(b, "beach", "A sandy beach with small waves rolling onto the sand and a few pebbles and shells. No animals, no people." + SCENE)
add(b, "spring", "A spring scene: a blossom tree in pink and white flower above a patch of green grass with yellow daffodils. No animals." + SCENE)
add(b, "summer", "A summer scene: a sunny meadow with long green grass and bright red poppies and white daisies, warm golden light." + SCENE)
add(b, "autumn", "An autumn scene: a tree with orange, red and brown leaves, a few leaves falling and a carpet of fallen leaves below it." + SCENE)
add(b, "winter", "A winter scene: a bare tree and a white frosty field around a small frozen pond. It must look different from the snow picture: bare tree, frozen pond, frost." + SCENE)

counts = {}
for bt, _, _ in W.values():
    counts[bt] = counts.get(bt, 0) + 1
print(counts, len(W))
assert len(W) == 145

with open(os.path.join(OUT, "new-words-list.csv"), "w", newline="", encoding="utf8") as f:
    w = csv.writer(f)
    w.writerow(["batch", "id", "delivery name", "subject paragraph"])
    for id_, (bt, _, text) in W.items():
        w.writerow([bt, id_, id_ + ".png", text])

names = {5: "Other Animals", 6: "Animal Watching, Homes & Shelters, Senses & Survival", 7: "Meet the Mammals (new)",
         8: "Bodies Up Close, Mothers & Young, Food & Feeding (new)", 9: "On the Move, Habitats & Seasons (new)"}
for bt in sorted(counts):
    lines = [f"# Codex brief: Mammals new word pictures, batch {bt}: {names[bt]} ({counts[bt]} pictures)", "",
             "Part of `codex-new-words-brief.md` (read that, and `codex-redo-brief.md`, first). Style: **A, studio photo**. Match `2026-11-21-style-pilot/*-studio.png` and the installed pictures in `2026-11-21-redo/` in realism, light, colour and finish.", "",
             "Each prompt below is complete: the shared opening paragraph, the style line, then the subject paragraph. Use it as written; where the subject paragraph is more specific than the rules, follow it.", "",
             f"Deliver to `docs/word-art-redo/2026-11-22-new/batch-{bt}/`, with `notes.txt`, `prompts.md` and `contact-sheet.png`.", ""]
    for id_, (b2, style, text) in W.items():
        if b2 != bt:
            continue
        lines += [f"## `{id_}.png`", "", "```text", OPEN, "", style, "", text, "```", ""]
    open(os.path.join(OUT, f"new-batch-{bt}.md"), "w", encoding="utf8").write("\n".join(lines))
print("written")
