// The 123 Mammals words with pictures today (the Mammals word bank, 5 October 2026, moved here on
// 21 November 2026 when the app took the Insects layout). Rows: name | definition | picture brief | sentence.
// The old subject groups below only group the rows; each word's teaching group comes from word-order.js.
// All wording is drafted, including wording for source-provided concepts (teacher review pending).
const groups = {
 mammals: `lion|A large wild cat; adult males often have a mane.|A male lion standing, with its full mane and four paws visible.|The lion has a mane.
elephant|A very large mammal with a long trunk.|An African elephant with large ears, holding a leafy twig in its curled trunk.|The elephant lifts its trunk.
giraffe|A tall mammal with a very long neck.|A giraffe reaching its long neck up to leaves on a twig.|The giraffe eats leaves.
monkey|A mammal with grasping hands; most kinds have tails.|A monkey sitting on a branch, holding it with its hands, its long tail hanging down.|The monkey holds a branch.
bear|A large mammal with thick fur and strong paws.|A brown bear standing on all four paws.|The bear has thick fur.
rabbit|A small mammal with long ears and strong back legs.|A rabbit sitting side-on, with long upright ears, big back feet and a white tail.|The rabbit can hop.
cat|A small mammal often kept as a pet.|A tabby cat sitting with its tail curled round its paws and its whiskers showing.|The cat has fur.
dog|A mammal that people often keep as a companion.|A golden-brown dog standing side-on, with its nose, ears, four legs and tail showing.|A big dog ran.
horse|A large mammal with hooves, often ridden by people.|A brown horse standing side-on, with a black mane, tail and four hooves.|The horse can run.
donkey|A hoofed mammal with long ears, related to a horse.|A grey donkey standing side-on, with long ears and a short upright mane.|The donkey has long ears.
cow|An adult female of the farm animal called cattle.|A black and white cow standing side-on.|The cow eats grass.
sheep|A farm mammal with a coat of wool.|A sheep with a thick woolly coat, standing side-on.|The sheep has wool.
goat|A hoofed mammal that can climb well.|A brown and white goat with short horns, standing on a low rock.|The goat stands on a rock.
pig|A mammal with a rounded snout used for sniffing and digging.|A pink pig sniffing the soil with its rounded snout.|The pig sniffs the soil.
mouse|A small mammal with a pointed nose and a long thin tail.|A mouse beside a seed, with big ears, a pointed nose and a long thin tail.|The mouse finds a seed.
rat|A rodent usually larger than a mouse, with a long tail.|A brown rat standing side-on, with its long scaly tail showing.|The rat has a long tail.
hamster|A small rodent with cheek pouches for carrying food.|A golden hamster sitting up, with rounded cheek pouches and a tiny tail.|The hamster carries food.
guinea pig|A small rodent with a rounded body and no visible tail.|A brown and white guinea pig standing, with a rounded body, short ears and no tail.|The guinea pig eats hay.
squirrel|A rodent that often has a bushy tail.|A red squirrel sitting on a branch, with its big bushy tail curved up behind it.|The squirrel climbs a tree.
hedgehog|A small mammal with stiff spines on its back.|A hedgehog walking, with spines on its back and fur on its face.|The hedgehog has spines.
fox|A wild mammal in the dog family, often with a bushy tail.|A red fox standing side-on, with pointed ears and a bushy white-tipped tail.|The fox has a bushy tail.
wolf|A large wild member of the dog family.|A grey wolf standing side-on, with long legs and thick fur.|The wolf walks through the snow.
deer|A hoofed mammal; males of many kinds grow antlers.|A male red deer standing side-on, with large branched antlers.|The deer has antlers.
moose|A very large deer; adult males have broad antlers.|A male moose standing side-on, with broad flat antlers and a long face.|The moose stands by the lake.
zebra|An African mammal in the horse family with striped fur.|A zebra standing side-on, with black and white stripes down to its hooves.|The zebra has stripes.
rhinoceros|A large mammal with one or two horns on its nose.|A white rhinoceros with two horns on its nose and thick grey skin.|The rhinoceros has thick skin.
hippopotamus|A large mammal that spends much of the day in water.|A hippopotamus standing, with a barrel-shaped body and short legs.|The hippopotamus comes up for air.
camel|A mammal with one or two humps that store fat.|A one-humped camel standing, with long legs and a long curved neck.|The camel has a hump.
tiger|A large wild cat with stripes.|A tiger walking, with orange fur, black stripes and a white chest.|The tiger has stripes.
cheetah|A spotted wild cat that can run very fast.|A cheetah standing, with a slender body, solid black spots and dark tear marks.|The cheetah can run fast.
leopard|A wild cat with dark ring-like markings on its coat.|A leopard standing, with ring-shaped rosette markings and a long tail.|The leopard rests on a branch.
gorilla|A large ape with no tail.|A silverback gorilla sitting, with a broad chest, long arms and no tail.|The gorilla has strong arms.
chimpanzee|An ape with grasping hands and no tail.|A chimpanzee sitting, with long arms, hands on its knees and no tail.|The chimpanzee holds a fruit.
kangaroo|A mammal with strong back legs; females carry young in a pouch.|A kangaroo standing upright on its big back feet, its long tail on the ground.|The kangaroo can hop.
koala|An Australian mammal that eats mostly eucalyptus leaves.|A koala holding a eucalyptus branch, with round fluffy ears and a big dark nose.|The koala rests in a tree.
wombat|An Australian mammal that digs burrows with strong claws.|A stocky wombat standing on a patch of dug earth.|The wombat digs a burrow.
platypus|A mammal with a broad bill and webbed feet that lays eggs.|A platypus with a broad flat bill, brown fur, a flat tail and webbed feet.|The platypus swims in a stream.
echidna|A mammal with spines and a long snout that lays eggs.|An echidna with spines, a long thin snout and strong clawed feet.|The echidna looks for ants.
bat|A mammal with skin-covered wings that can fly.|A fruit bat flying, seen from below, with skin wings spread over long fingers.|The bat can fly.
sloth|A slow-moving mammal that spends much of its time in trees.|A sloth hanging below a branch by its long curved claws.|The sloth hangs from a branch.
whale|A large sea mammal that breathes air through a blowhole.|A humpback whale swimming, with its long flippers and tail flukes.|The whale comes up for air.
dolphin|A sea mammal with a streamlined body and a blowhole.|A bottlenose dolphin swimming, with a curved fin and a beak-like snout.|The dolphin breathes air.
porpoise|A small sea mammal with a rounded head and a short snout.|A harbour porpoise, with a rounded head, no beak and a small triangular fin.|The porpoise swims in the sea.
seal|A sea mammal with flippers; true seals have no outer ear flaps.|A spotted harbour seal lying on a rock, with small flippers and no ear flaps.|The seal rests on a rock.
sea lion|A sea mammal with flippers and small outer ear flaps.|A sea lion propped up on its big front flippers, with small ear flaps.|The sea lion has flippers.
walrus|A large sea mammal with whiskers; adults have long tusks.|A walrus with two long tusks, thick whiskers and flippers.|The walrus has two tusks.
manatee|A large plant-eating mammal that lives in warm water.|A manatee with a round paddle-shaped tail, nibbling a water plant.|The manatee eats water plants.
dugong|A sea mammal that eats seagrass and has a fluked tail.|A dugong with a downturned snout and a forked tail like a whale's.|The dugong eats seagrass.
sea otter|A sea mammal with thick fur that can float on its back.|A sea otter floating on its back with its front paws on its chest.|The sea otter floats on its back.
polar bear|A bear with thick fur that hunts on Arctic sea ice.|A polar bear walking on sea ice, with cream-white fur and broad furry paws.|The polar bear walks on sea ice.`,
 bodies: `fur|The thick coat of hair on many mammals.|A close view of thick soft grey-brown rabbit fur.|The rabbit has soft fur.
whiskers|Long stiff hairs near the face that help an animal sense nearby things.|A cat's face with long white whiskers fanning out from its muzzle.|The cat has long whiskers.
skin|The outer covering of an animal's body.|A close view of wrinkled grey elephant skin.|The elephant has wrinkled skin.
paw|The foot of an animal such as a cat or bear.|A dog's paw seen from below, showing four toe pads and a big middle pad.|The cat lifts one paw.
hoof|A hard covering on the foot of a horse and some other mammals.|A horse's lower leg and hoof.|The horse has a hard hoof.
claw|A hard curved point on an animal's toe.|A bear's front paw with long curved claws.|The bear has a sharp claw.
tail|A body part that sticks out from the back end of many animals.|A red squirrel with its big bushy tail curled up behind it.|The squirrel has a long tail.
ear|A body part used for hearing.|A rabbit's head with one long upright ear.|The rabbit turns an ear.
eye|A body part used for seeing.|A horse's head in side view, with one large dark eye.|The horse has a brown eye.
nose|A body part used for smelling and breathing.|A dog face close-up with its nose clearly indicated.|The dog sniffs with its nose.
mouth|The opening through which an animal takes in food.|A goat's head with its mouth closed round a blade of grass.|The goat opens its mouth.
tooth|A hard part in the mouth used to bite or chew.|A horse nibbling grass, its lips parted to show its flat front teeth.|The horse uses a tooth to chew.
tongue|A soft part inside the mouth that helps with tasting and eating.|A cat lapping water with its tongue visible.|The cat laps with its tongue.
trunk|An elephant's long nose and upper lip joined together.|An elephant reaching its long trunk out to a leafy twig.|The elephant uses its trunk.
tusk|A long tooth that sticks out of an animal's mouth.|A walrus's head with two long ivory tusks and whiskers.|The walrus has a long tusk.
horn|A hard growth on the head of some animals.|A goat's head with two curved horns.|The goat has a curved horn.
antlers|Branched bony growths on the heads of deer, usually males.|A male red deer's head with large branched antlers.|The deer grows antlers.
mane|Long hair around the neck or along the top of the neck.|A male lion's head and shoulders with a full golden-brown mane.|The lion has a thick mane.
pouch|A fold of skin in which some mammals carry their young.|A kangaroo standing upright, with a joey's head peeking out of her pouch.|The joey rests in a pouch.
flipper|A broad, flat limb used for moving in water.|A seal lying on its belly, one front flipper spread to show its claws.|The seal moves a flipper.
blowhole|A breathing opening on top of a whale's or dolphin's head.|A dolphin's head from above, with the blowhole on top of its head.|The dolphin breathes through its blowhole.
lungs|Body organs that take oxygen from air.|A model of a pair of lungs with the windpipe branching into them.|Mammals breathe air into their lungs.
backbone|The row of bones along the back that helps support the body.|A simple non-graphic dog skeleton outline with backbone highlighted.|The dog has a backbone.`,
 places: `land|The solid ground, rather than water.|A simple coastline with the solid land highlighted.|The lion walks on land.
ocean|A very large area of salty water.|A wide ocean view with a whale far in the water for scale.|The whale lives in the ocean.
ocean floor|The ground at the bottom of the ocean.|A cutaway sea view with the bottom clearly highlighted.|The walrus finds food on the ocean floor.
river|A long flowing stream of water.|A flowing river with clear banks and a visible bend.|The dolphin swims in the river.
lake|A large area of water surrounded by land.|A lake with land visible all around its edges.|The moose stands by the lake.
pond|A small area of still water surrounded by land.|A small pond in a grassy area.|The horse drinks by the pond.
forest|A large area with many trees.|A forest with many trees and a clear path.|The deer lives in the forest.
grassland|An open area where mostly grasses grow.|An open grassy plain with few trees and distant zebras.|The zebra walks across the grassland.
desert|A place that gets very little rain.|A dry desert landscape with sparse plants.|The camel walks in the desert.
cave|A hollow space in rock that an animal can enter.|A rocky cave entrance with the inside visible.|The bat rests in a cave.
burrow|A hole or tunnel dug by an animal as a shelter.|A rabbit at the round entrance of its burrow in a grassy mound of earth.|The wombat rests in its burrow.
den|A sheltered resting place used by some wild mammals.|A fox resting in a sheltered hollow under tree roots.|The fox rests in its den.
branch|A woody part that grows out from a tree trunk.|A tree with one side branch clearly indicated.|The monkey sits on a branch.
leaf|A usually flat plant part that catches light.|A single fresh leaf with its outline and stalk visible.|The giraffe eats a leaf.
grass|Plants with narrow green leaves, often covering the ground.|A close view of growing grass blades.|The cow eats grass.
fruit|A plant part that holds seeds, such as an apple.|A whole apple and a cut apple showing seeds.|The monkey eats fruit.
seed|A plant part from which a new plant can grow.|Several sunflower seeds with one enlarged seed.|The mouse finds a seed.
milk|A liquid made by mammal mothers to feed their young.|A calf drinking milk from its mother cow.|The calf drinks its mother's milk.
water|The liquid animals need to drink.|Clear water in a shallow pool with a deer drinking.|The deer drinks water.
snow|Soft white ice crystals that fall in cold weather.|Snow on the ground with visible animal tracks.|The wolf walks through snow.
sea ice|Frozen seawater floating on the ocean.|A floating sea-ice sheet with water visible around its edge.|The polar bear rests on sea ice.
seagrass|Flowering plants that grow underwater in shallow seas.|Seagrass rooted in a sandy seabed, with a dugong nearby for context.|The dugong eats seagrass.`,
 actions: `walk|To move by taking steps.|A bear walking, with sequential foot positions in two panels.|The bear can walk.
run|To move quickly using the legs.|A horse running, with two clear movement poses.|The horse can run.
hop|To move with small jumps, often using the back legs.|A rabbit hopping with two poses and a short movement arrow.|The rabbit can hop.
jump|To push off and leave the ground.|A cat jumping up onto a low ledge, with start and landing shown.|The cat can jump.
climb|To move upward using feet or hands.|A squirrel climbing a tree trunk.|The squirrel can climb.
swim|To move through water.|A dolphin swimming below the surface.|The dolphin can swim.
dive|To go down below the surface of water.|A seal moving from the surface down into water.|The seal can dive.
float|To stay at the surface of water.|A sea otter lying on its back at the surface.|The sea otter can float.
fly|To move through the air using wings.|A bat flying with its skin-covered wings spread.|The bat can fly.
dig|To move soil aside to make a hole.|A wombat moving soil with its front claws.|The wombat can dig.
sniff|To draw air into the nose to smell something.|A dog with its nose close to the ground, sniffing a trail.|The dog can sniff.
chew|To break food into smaller pieces with the teeth.|A horse chewing grass, shown in a clear face close-up.|The horse can chew.
drink|To take liquid into the mouth.|A cat lapping water from a bowl.|The cat can drink.
feed|To give food to a baby or another animal.|A mother pig lying on her side feeding a row of piglets with her milk.|The mother can feed her calf.
breathe|To take air into the body and let it out.|A whale at the surface with a simple air-flow inset, no underwater breathing.|The whale comes up to breathe.
sleep|To rest with the body and mind less active.|A curled-up cat asleep, relaxed eyes closed.|The cat can sleep.
stretch|To reach out and lengthen the body or a limb.|A cat extending its front legs in a stretch.|The cat can stretch.
groom|To clean or care for fur or skin.|A cat licking its own fur, with the action clearly visible.|The cat can groom its fur.
carry|To hold and move something from one place to another.|A monkey walking while holding a fruit.|The monkey can carry fruit.
hide|To move or stay where it is hard to be seen.|A mouse partly hidden behind a log, still identifiable.|The mouse can hide.`,
 young: `kitten|A young cat.|A small tabby kitten sitting in front of its mother cat.|The kitten has soft fur.
puppy|A young dog.|A golden puppy sitting in front of its mother dog.|The puppy drinks milk.
calf|A young cow; the young of some other large mammals are also called calves.|A young calf standing beside its mother cow.|The calf stands by its mother.
lamb|A young sheep.|A white lamb standing beside its woolly mother sheep.|The lamb has wool.
kid|A young goat.|A young goat standing beside its mother goat.|The kid can jump.
foal|A young horse or another young member of the horse family.|A long-legged foal standing beside its mother horse.|The foal stands by the horse.
cub|A young bear, lion or some other wild mammals.|A lion cub sitting in front of a lioness.|The cub rests by its mother.
joey|A young kangaroo or another young marsupial.|A kangaroo joey peeking out of its mother's pouch.|The joey is in the pouch.`
};
const source = new Set('lion,elephant,giraffe,monkey,bear,rabbit,dolphin,whale,fur,backbone,milk,land,water,ocean floor,cat,dog'.split(','));
export const wordRows = Object.values(groups).flatMap((raw) => raw.split("\n").map((line) => {
  const [name, definition, imageAlt, sentence] = line.split("|");
  const id = name.replaceAll(" ", "-");
  return { id, name, definition, imageAlt, sentence, kind: "word", image: `assets/topics/mammals/vocabulary/${id}.webp`, provenance: source.has(name) ? "source-outline" : "draft-extension" };
}));
