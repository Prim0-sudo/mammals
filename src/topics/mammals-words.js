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
nose|A body part used for smelling and breathing.|A golden dog's face from the front, its wet black nose in the middle.|The dog sniffs with its nose.
mouth|The opening through which an animal takes in food.|A goat's head with its mouth closed round a blade of grass.|The goat opens its mouth.
tooth|A hard part in the mouth used to bite or chew.|A horse nibbling grass, its lips parted to show its flat front teeth.|The horse uses a tooth to chew.
tongue|A soft part inside the mouth that helps with tasting and eating.|A giraffe's head and neck, its long dark tongue curling round a leafy twig.|The cat laps with its tongue.
trunk|An elephant's long nose and upper lip joined together.|An elephant reaching its long trunk out to a leafy twig.|The elephant uses its trunk.
tusk|A long tooth that sticks out of an animal's mouth.|A walrus's head with two long ivory tusks and whiskers.|The walrus has a long tusk.
horn|A hard growth on the head of some animals.|A goat's head with two curved horns.|The goat has a curved horn.
antlers|Branched bony growths on the heads of deer, usually males.|A male red deer's head with large branched antlers.|The deer grows antlers.
mane|Long hair around the neck or along the top of the neck.|A male lion's head and shoulders with a full golden-brown mane.|The lion has a thick mane.
pouch|A fold of skin in which some mammals carry their young.|A kangaroo standing upright, with a joey's head peeking out of her pouch.|The joey rests in a pouch.
flipper|A broad, flat limb used for moving in water.|A seal lying on its belly, one front flipper spread to show its claws.|The seal moves a flipper.
blowhole|A breathing opening on top of a whale's or dolphin's head.|A dolphin's head from above, with the blowhole on top of its head.|The dolphin breathes through its blowhole.
lungs|Body organs that take oxygen from air.|A model of a pair of lungs with the windpipe branching into them.|Mammals breathe air into their lungs.
backbone|The row of bones along the back that helps support the body.|A museum skeleton of a dog in side view, its backbone running from skull to tail.|The dog has a backbone.`,
 places: `land|The solid ground, rather than water.|A patch of grassy land with a tree, rocks and a little water at the edge.|The lion walks on land.
ocean|A very large area of salty water.|A patch of deep blue ocean waves with a whale's tail.|The whale lives in the ocean.
ocean floor|The ground at the bottom of the ocean.|A sandy ocean floor with seagrass, rocks and a starfish under clear water.|The walrus finds food on the ocean floor.
river|A long flowing stream of water.|A small river flowing between grassy banks.|The dolphin swims in the river.
lake|A large area of water surrounded by land.|A lake of still blue water ringed by trees.|The moose stands by the lake.
pond|A small area of still water surrounded by land.|A small pond with reeds and lily pads.|The horse drinks by the pond.
forest|A large area with many trees.|A patch of forest with tall trees, ferns and a path.|The deer lives in the forest.
grassland|An open area where mostly grasses grow.|A patch of golden grassland with one flat-topped tree.|The zebra walks across the grassland.
desert|A place that gets very little rain.|A patch of desert with sand dunes, cracked dry ground and a cactus.|The camel walks in the desert.
cave|A hollow space in rock that an animal can enter.|A rocky cave with a dark opening and ferns at its mouth.|The bat rests in a cave.
burrow|A hole or tunnel dug by an animal as a shelter.|A rabbit at the round entrance of its burrow in a grassy mound of earth.|The wombat rests in its burrow.
den|A sheltered resting place used by some wild mammals.|A red fox curled up asleep in its den under tree roots.|The fox rests in its den.
branch|A woody part that grows out from a tree trunk.|A short tree branch with a few green leaves.|The monkey sits on a branch.
leaf|A usually flat plant part that catches light.|A green oak leaf with its stalk.|The giraffe eats a leaf.
grass|Plants with narrow green leaves, often covering the ground.|A clump of green grass with its roots in a little soil.|The cow eats grass.
fruit|A plant part that holds seeds, such as an apple.|A red apple beside a cut half showing its seeds.|The monkey eats fruit.
seed|A plant part from which a new plant can grow.|A small pile of striped sunflower seeds.|The mouse finds a seed.
milk|A liquid made by mammal mothers to feed their young.|A calf drinking milk from its mother cow.|The calf drinks its mother's milk.
water|The liquid animals need to drink.|A splash of clear fresh water with droplets flying out.|The deer drinks water.
snow|Soft white ice crystals that fall in cold weather.|A patch of white snow with a trail of paw prints.|The wolf walks through snow.
sea ice|Frozen seawater floating on the ocean.|A flat piece of white sea ice floating in dark blue sea.|The polar bear rests on sea ice.
seagrass|Flowering plants that grow underwater in shallow seas.|Ribbon-like seagrass rooted in sandy seabed, with bubbles rising.|The dugong eats seagrass.`,
 actions: `walk|To move by taking steps.|A brown bear walking on all four paws.|The bear can walk.
run|To move quickly using the legs.|A brown horse running at full gallop.|The horse can run.
hop|To move with small jumps, often using the back legs.|A hare in mid-hop, pushing off with its long back legs.|The rabbit can hop.
jump|To push off and leave the ground.|A tabby cat leaping through the air onto a small wooden block.|The cat can jump.
climb|To move upward using feet or hands.|A red squirrel climbing up a tree trunk.|The squirrel can climb.
swim|To move through water.|A river otter swimming with its head above the water.|The dolphin can swim.
dive|To go down below the surface of water.|A spotted seal diving head-first down through the water.|The seal can dive.
float|To stay at the surface of water.|A sea otter floating on its back in the water.|The sea otter can float.
fly|To move through the air using wings.|A small brown bat flying with its skin wings spread.|The bat can fly.
dig|To move soil aside to make a hole.|A wombat digging in loose earth with its front paws.|The wombat can dig.
sniff|To draw air into the nose to smell something.|A beagle sniffing the grass with its nose down.|The dog can sniff.
chew|To break food into smaller pieces with the teeth.|A horse's head chewing a mouthful of hay.|The horse can chew.
drink|To take liquid into the mouth.|A tabby cat lapping water from a bowl.|The cat can drink.
feed|To give food to a baby or another animal.|A mother pig lying on her side feeding a row of piglets with her milk.|The mother can feed her calf.
breathe|To take air into the body and let it out.|A whale at the surface blowing a spout of air and spray from its blowhole.|The whale comes up to breathe.
sleep|To rest with the body and mind less active.|A red fox curled up asleep, its tail wrapped round it.|The cat can sleep.
stretch|To reach out and lengthen the body or a limb.|A golden dog stretching, front legs forward and back end up.|The cat can stretch.
groom|To clean or care for fur or skin.|A tabby cat licking its paw to clean itself.|The cat can groom its fur.
carry|To hold and move something from one place to another.|A monkey walking on all fours, carrying a banana in one hand.|The monkey can carry fruit.
hide|To move or stay where it is hard to be seen.|A mouse peeking out from behind a mossy log.|The mouse can hide.`,
 young: `kitten|A young cat.|A small tabby kitten sitting in front of its mother cat.|The kitten has soft fur.
puppy|A young dog.|A golden puppy sitting in front of its mother dog.|The puppy drinks milk.
calf|A young cow; the young of some other large mammals are also called calves.|A young calf standing beside its mother cow.|The calf stands by its mother.
lamb|A young sheep.|A white lamb standing beside its woolly mother sheep.|The lamb has wool.
kid|A young goat.|A young goat standing beside its mother goat.|The kid can jump.
foal|A young horse or another young member of the horse family.|A long-legged foal standing beside its mother horse.|The foal stands by the horse.
cub|A young bear, lion or some other wild mammals.|A lion cub sitting in front of a lioness.|The cub rests by its mother.
joey|A young kangaroo or another young marsupial.|A kangaroo joey peeking out of its mother's pouch.|The joey is in the pouch.`,
 neighbours: `bird|An animal with feathers, wings and a beak; baby birds hatch from eggs.|A house sparrow perched side-on on a short twig, its wings folded.|A bird has feathers.
robin|A small brown bird with an orange-red chest.|A robin with its orange-red chest, perched on a small mossy stump.|The robin sings in the garden.
owl|A bird with big eyes and soft feathers that hunts mostly at night.|A barn owl with its pale heart-shaped face, perched on a branch.|The owl has big eyes.
eagle|A big bird with a hooked beak and strong claws called talons.|A golden eagle standing on a rock, its hooked yellow beak and strong talons showing.|The eagle flies high.
duck|A water bird with webbed feet and a flat beak.|A male mallard duck with a green head, standing on a patch of grass.|The duck swims on the pond.
chicken|A farm bird; hens lay eggs.|A brown hen standing side-on, with her red comb and yellow feet.|The hen lays an egg.
penguin|A black and white bird that cannot fly but swims very well.|A king penguin standing upright on a patch of snow, its orange neck patch showing.|The penguin swims fast.
snake|A long reptile with scaly skin and no legs.|A grass snake coiled up, its head raised and its scaly body curled round.|The snake slides on the sand.
lizard|A reptile with scaly skin and a long tail; most have four legs.|A brown lizard resting on a mossy rock, its long thin tail curving behind it.|The lizard sits in the sun.
tortoise|A slow reptile with a hard shell that lives on land.|A tortoise with a high patterned shell, walking on a patch of grass.|The tortoise eats a leaf.
turtle|A reptile with a shell that lives mostly in water.|A sea turtle swimming, its flat shell and paddle-shaped flippers spread out.|The turtle swims in the sea.
crocodile|A big reptile with strong jaws that lives in rivers and swamps.|A crocodile lying flat on a muddy bank, its long jaws closed.|The crocodile has lots of teeth.
frog|An amphibian with smooth, damp skin and long back legs for jumping.|A frog with smooth damp skin, sitting with its long back legs folded.|The frog jumps into the pond.
toad|An amphibian like a frog, with dry, bumpy skin; it walks more than it hops.|A toad with dry bumpy brown skin, sitting low on short legs.|The toad walks to the pond.
tadpole|A young frog or toad that lives in water and has a tail.|A tadpole with a round body, a long flat tail and two tiny back legs.|The tadpole grows legs.
newt|A small amphibian with a long tail that lives in ponds and damp places.|A newt with an orange spotted belly line, resting on green moss.|The newt swims in the pond.
salamander|An amphibian with a long tail and damp skin that looks a bit like a lizard.|A black and yellow fire salamander walking over moss.|The salamander has yellow spots.
fish|An animal with fins and gills that lives in water.|A silver fish swimming side-on, its fins and tail spread.|The fish swims in the river.
goldfish|A small orange fish often kept as a pet.|An orange goldfish with long flowing fins and tail.|The goldfish swims in its tank.
salmon|A big silver fish that swims up rivers to lay its eggs.|A silver salmon with small dark spots, swimming side-on.|The salmon leaps up the river.
shark|A big fish with gill slits and rows of sharp teeth.|A grey shark swimming side-on, its pointed fin on its back.|The shark swims in the sea.
seahorse|A small fish with a head like a horse that swims upright.|An orange seahorse standing upright, its curly tail wrapped round a stem of seaweed.|The seahorse holds on with its tail.
ant|A tiny insect that lives in a big group.|A red ant side-on, its six thin legs and two feelers showing.|The ant carries a crumb.
bee|A hairy flying insect that visits flowers; honeybees make honey.|A honeybee with a striped furry body, see-through wings and six legs.|The bee visits a flower.
butterfly|An insect with large, colourful wings.|A red admiral butterfly with its black, orange and white wings open wide.|The butterfly lands on a flower.
ladybird|A small, round beetle, often red with black spots.|A red ladybird with black spots, seen from above, its six legs showing.|The ladybird has seven spots.
spider|A small animal with eight legs that spins silk.|A garden spider seen from above, its eight long striped legs spread out.|The spider spins a web.
snail|A soft animal that carries a shell on its back.|A garden snail with a spiral brown shell, gliding over a green leaf.|The snail is slow.
worm|A long, soft animal with no legs that lives in soil.|A pink earthworm stretched out on a patch of soil.|The worm wriggles in the soil.
crab|A sea animal with a hard shell and ten legs; the front two are big claws.|A green shore crab seen from above, its two claws raised.|The crab walks sideways.
octopus|A soft sea animal with eight arms and no bones.|An orange octopus seen from above, its eight curling arms spread on the sand.|The octopus has eight arms.
jellyfish|A soft, see-through sea animal that can sting.|A see-through moon jellyfish with a round bell and trailing frilly arms.|The jellyfish floats in the sea.`,
 watching: `grown-up|An adult who looks after us, like a parent or a teacher.|A grown-up and a child walking side by side along a path, holding hands.|Stay with a grown-up.
quiet|Making little or no sound.|A girl kneeling in the grass with her finger to her lips to keep quiet.|Be quiet so the deer stays.
stay back|Keep a long way from an animal so it feels safe.|A grown-up and a child standing back at the edge of a field, watching a deer far away.|Stay back from the seal.
gentle|Kind and soft, with careful hands.|A girl gently stroking a guinea pig that sits on a grown-up's lap.|Be gentle with the guinea pig.
binoculars|Two joined tubes you look through to make far-away things look close.|A pair of black binoculars with a neck strap.|I look through the binoculars.
wildlife hide|A small hut with narrow windows where people sit quietly to watch animals.|A small wooden wildlife hide with a long viewing slot, beside a pond.|We sit in the wildlife hide.
notebook|A little book for writing and drawing what we see.|An open spiral notebook with a pencil drawing of a paw print.|I draw in my notebook.
field guide|A book that helps you name the animals you see.|An open field guide with photos of a fox, a badger, a hedgehog and a rabbit.|The field guide shows a badger.
footprint|A mark a foot or paw leaves in mud or snow; also called a track.|A large paw print pressed into soft brown mud.|We found a footprint in the mud.
droppings|An animal's poo.|A small pile of round brown animal droppings on the grass.|Do not touch droppings.
trail camera|A camera fixed to a tree that takes pictures when an animal walks past.|A camouflage-coloured trail camera strapped to a tree trunk.|The trail camera saw a fox.
wash hands|Clean our hands with soap and water.|Two soapy hands being washed under a running tap.|Wash your hands after the farm.`,
 homes: `warren|Lots of rabbit burrows joined together under the ground.|A cut-away view of a rabbit warren, with two rabbits resting in tunnels under the grass.|Rabbits live in a warren.
sett|A badger's home of tunnels and rooms under the ground.|A badger looking out of its sett, a large hole in an earth bank under tree roots.|The badger sleeps in its sett.
holt|An otter's den in a riverbank.|An otter resting in its holt, a hollow among tree roots beside the water.|The otter rests in its holt.
nest|A cosy home made of grass, leaves or twigs.|A round woven grass nest hanging from tall reed stems.|The mouse made a nest of grass.
drey|A squirrel's nest of twigs and leaves, high in a tree.|A red squirrel peeking out of its drey, a ball of twigs and leaves in the fork of a tree.|The squirrel sleeps in its drey.
tree hollow|A hole in an old tree where animals can shelter.|A section of tree trunk with a deep round hollow in it.|The bat rests in a tree hollow.
lodge|A beaver's home of sticks and mud in the water.|A beaver swimming beside its lodge, a dome of sticks and mud in the water.|The beaver swims to its lodge.
hutch|A wooden house for a pet rabbit or guinea pig.|A wooden rabbit hutch on legs, with a rabbit behind the wire mesh.|The rabbit is in its hutch.
kennel|A small house for a dog.|A golden dog lying in the doorway of its wooden kennel.|The dog naps in its kennel.
stable|A building where horses live.|A brown horse looking out over the half door of its wooden stable.|The horse is in the stable.
barn|A big farm building for animals, hay and tools.|A red barn with its big doors open and hay bales stacked inside.|The hay is in the barn.`,
 survival: `listen|Use your ears to hear carefully.|A roe deer standing still, its big ears turned up to listen.|The deer stops to listen.
camouflage|Colours or patterns that help an animal blend in with where it lives.|A white arctic fox curled up on the snow, its white fur matching the snow.|Camouflage helps the fox hide.
curl up|Roll the body into a tight ball.|A hedgehog curled up into a tight spiky ball on the grass.|The hedgehog curls up.
lookout|An animal that keeps watch for danger while the others feed.|A meerkat standing tall on its back legs on a sandy mound, keeping a lookout.|The meerkat is on lookout.
herd|A big group of animals, such as zebras or cows, that live together.|A herd of zebras standing close together on dry grass.|The zebras live in a herd.`,
 survival2: `pack|A group of wolves or wild dogs that live and hunt together.|A pack of four grey wolves walking in a line across a snowy patch.|The wolves run as a pack.
roar|A loud, deep sound, like a lion's.|A lion standing with its mouth wide open in a big roar.|The lion gives a big roar.
howl|A long, loud cry, like a wolf's.|A grey wolf sitting with its muzzle pointed up to the sky as it howls.|The wolf howls at night.
nocturnal|Awake at night and asleep in the day.|A badger walking on the grass at night, with a full moon above.|Badgers are nocturnal.
hibernate|Sleep very deeply all through the winter.|A hedgehog curled up asleep in a nest of frosty leaves.|The hedgehog hibernates in winter.`,
 homes2: `roost|A place where bats rest and sleep.|Five bats hanging upside down under a wooden roof, their roost.|The bats sleep in the roost.`,
 mammals2: `arctic fox|A fox of the far north whose thick coat turns white in winter.|A white arctic fox standing side-on, with thick fur and a bushy tail.|The arctic fox has thick fur.
baboon|A big monkey that lives in groups and spends a lot of time on the ground.|An olive-brown baboon walking on all fours, its tail curved up behind.|The baboon sits on a rock.
badger|A strong digging mammal with a black and white striped face.|A badger walking side-on, with its black and white striped face.|The badger comes out at night.
beaver|A mammal with big orange front teeth and a flat tail that builds dams.|A brown beaver sitting on a mossy bank, its flat tail behind it.|The beaver has a flat tail.
blue whale|A huge whale; the biggest animal that has ever lived.|A long blue-grey whale swimming side-on.|The blue whale is very big.
dingo|A wild dog that lives in Australia.|A ginger dingo standing side-on, with pointed ears and a white-tipped tail.|The dingo runs in the bush.
fennec fox|A tiny desert fox with huge ears.|A small sandy fennec fox sitting up, with very large ears.|The fennec fox has big ears.
ferret|A small, long-bodied mammal that people keep as a pet.|A dark brown ferret with a pale masked face, its long body stretched out.|The ferret is long and thin.
giant panda|A black and white bear from China that eats bamboo.|A black and white giant panda sitting down.|The giant panda is black and white.
gibbon|A small ape with very long arms that swings through the trees.|A pale gibbon hanging from a branch by one long arm.|The gibbon has long arms.
hare|A fast mammal like a big rabbit, with very long ears and long back legs.|A brown hare sitting side-on, with very long ears and long back legs.|The hare runs across the field.
harvest mouse|A tiny mouse that climbs grass stems, holding on with its tail.|A tiny orange harvest mouse climbing a wheat stalk, its tail wrapped round the stem.|The harvest mouse climbs a stem.
human|A person. People are mammals too.|A smiling girl standing and waving, in jeans and a cardigan.|I am a human.
jaguar|A strong wild cat from South and Central America with spotty rings on its coat.|A jaguar standing side-on, its golden coat covered in spotty rings.|The jaguar can swim.
llama|A woolly South American mammal with a long neck; a cousin of the camel.|A woolly light brown llama standing side-on, with a long neck.|The llama has a long neck.
lynx|A wild cat with a short tail and black tufts on its ears.|A spotted lynx standing, with black tufts on its ears and a short tail.|The lynx has tufts on its ears.
meerkat|A small African mammal that lives in groups and digs burrows.|A meerkat standing up tall on its back legs.|The meerkat stands up tall.
mole|A small mammal with velvety fur and big digging paws that lives under the ground.|A black mole on a pile of soil, with pink digging paws.|The mole digs a tunnel.
narwhal|A whale of the Arctic; most males have one long, spiral tusk.|A spotted grey narwhal swimming side-on, with one long spiral tusk.|The narwhal has a long tusk.
orangutan|An ape with long orange-red hair that lives in rainforest trees.|An orangutan with long orange-red hair, sitting down.|The orangutan has orange hair.
orca|A big black and white dolphin, also called a killer whale.|A black and white orca swimming side-on, with a tall back fin.|The orca has a tall fin.
otter|A mammal with thick fur and webbed feet that swims in rivers.|A brown otter standing on a mossy rock, with a long thick tail.|The otter swims in the river.
pine marten|A tree-climbing mammal with brown fur and a creamy patch on its throat.|A brown pine marten on a branch, with a creamy patch on its throat.|The pine marten climbs a tree.
pony|A small kind of horse.|A short chestnut pony with a thick blond mane, standing side-on.|The pony eats hay.
red squirrel|A squirrel with red-brown fur and tufts on its ears.|A red squirrel sitting on a branch, with tufts on its ears and a bushy tail.|The red squirrel has ear tufts.
reindeer|A deer of cold northern lands; both males and females grow antlers.|A reindeer standing side-on, with big branching antlers.|The reindeer has big antlers.
shrew|A tiny mammal with a long, pointed nose that eats minibeasts.|A brown shrew with a long pointed nose, on dry leaves.|The shrew has a long nose.
snow leopard|A wild cat with thick, spotty grey fur and a very long tail.|A snow leopard standing side-on, with thick spotty grey fur and a long tail.|The snow leopard has a long tail.
stoat|A small, slim hunter with a black tip on its tail.|A slim stoat standing up on its back legs, with a black tip on its tail.|The stoat has a black tail tip.
sugar glider|A small pouched mammal that glides from tree to tree on flaps of skin.|A grey sugar glider with big dark eyes, holding on to a branch.|The sugar glider has big eyes.
vole|A small, round mammal like a mouse, with a short tail and small ears.|A small round brown vole with short ears and a short tail.|The vole hides in the grass.
wallaby|A pouched mammal like a small kangaroo.|A wallaby standing up on its big back feet, with its long tail behind.|The wallaby hops away.`,
 batch8: `bill|The wide, flat mouth of a platypus, a bit like a duck's beak.|A platypus head, with its flat grey bill.|The platypus has a flat bill.
snout|The long nose and mouth of an animal such as a pig.|A pink pig's face, with its round pink snout in the middle.|The pig has a pink snout.
wool|The thick, curly hair of a sheep.|A sheep covered in thick, curly cream wool.|The sheep has thick wool.
stripes|Long bands of colour on an animal's coat.|A zebra looking round, its black and white stripes filling the picture.|The zebra has stripes.
spots|Small round marks on an animal's coat.|A cheetah sitting, its golden coat covered in black spots.|The cheetah has black spots.
fin|A flat part that helps an animal steer and balance in water.|A dolphin's grey back fin sticking up out of the water.|The dolphin has a fin on its back.
hump|A big lump on a camel's back that stores fat.|A sandy-coloured camel standing side-on, with one big hump on its back.|The camel has one hump.
spines|Stiff, sharp hairs that keep some animals, like a hedgehog, safe.|A hedgehog side-on, its back covered in sharp brown and cream spines.|The hedgehog has sharp spines.
webbed feet|Feet with skin between the toes, for swimming.|An otter on a rock, one webbed back foot spread out in front.|The otter has webbed feet.
baby|A very young animal.|A baby elephant standing close beside its mother's legs.|The baby stays close to its mother.
born|Come into the world from the mother's body.|A newborn foal lying in straw while its mother bends down to it.|The foal was born today.
egg|A case with a shell that a baby grows in; the platypus and echidna are the only mammals that lay eggs.|One small cream egg resting on a dry brown leaf.|The platypus lays an egg.
fawn|A young deer.|A spotted fawn standing in the grass, its mother behind it.|The fawn has white spots.
litter|A group of babies born to one mother at the same time.|A mother pig lying on straw, with a row of piglets feeding.|The pig has a litter of piglets.
mother|A female animal that has babies.|A mother orangutan hugging her baby to her chest.|The mother hugs her baby.
piglet|A young pig.|A small pink piglet standing in front of a grown-up pig.|The piglet is pink.
pup|A young seal; young dogs and some other mammals are called pups too.|A fluffy white seal pup lying on the sand beside its grey mother.|The seal pup is fluffy.
bamboo|A tall, woody grass that giant pandas eat.|A clump of green bamboo stems with leaves.|The panda eats bamboo.
berries|Small, soft fruits that grow on bushes.|A sprig of shiny blackberries with green leaves.|The bear eats berries.
gnaw|Bite at something hard again and again.|A beaver gnawing a small tree trunk, wood chips at its feet.|The beaver gnaws the log.
graze|Eat grass slowly while walking across a field.|A sheep with its head down, eating grass.|The sheep graze in the field.
hay|Dried grass that farm animals and pets eat.|A rectangular bale of dry golden hay tied with string.|The horse eats hay.
krill|Tiny sea animals like shrimps that many whales eat.|Three pink, see-through krill, shown large.|Whales eat lots of krill.
nuts|Seeds with hard shells, such as hazelnuts and acorns.|A small pile of hazelnuts and acorns.|The squirrel hides nuts.
plant-eater|An animal that eats only plants.|A brown rabbit sitting in the grass, nibbling a dandelion leaf.|A rabbit is a plant-eater.
meat-eater|An animal that eats other animals.|A grey seal in the water with a fish in its mouth.|A seal is a meat-eater.
predator|An animal that hunts other animals for food.|A red fox creeping low through the grass, eyes fixed ahead.|The fox is a predator.
prey|An animal that is hunted by another animal.|A brown rabbit sitting up, alert, with its ears raised.|The rabbit is prey for the fox.`,
 batch9: `wade|Walk through shallow water.|A moose standing knee-deep in a pond.|The moose wades into the lake.
gallop|Run very fast, like a horse.|A chestnut horse galloping, all four hooves off the ground.|The horse gallops in the field.
scamper|Run with quick, small steps.|A small brown mouse running along a mossy log.|The mouse scampers away.
pounce|Jump suddenly onto something.|A red fox leaping high, arching down nose-first towards the snow.|The fox pounces in the snow.
swing|Move to and fro while hanging from something.|A gibbon swinging between two branches by its long arms.|The gibbon swings from branch to branch.
hang|Hold on from above, with the body below.|A brown bat hanging upside down from a twig, its wings folded.|The bat hangs upside down.
paddle|Push through water with the legs or feet.|A golden dog swimming in a pond, only its head above the water.|The dog paddles in the lake.
glide|Move smoothly through the air without flapping.|A sugar glider in the air, the skin flaps between its legs spread wide.|The sugar glider glides to a tree.
habitat|The natural home of an animal or plant.|A woodland edge with trees and a hedge, a rabbit and a hedgehog tucked in the grass.|A river is a habitat for otters.
rainforest|A thick, warm forest where it rains nearly every day.|A tall, misty rainforest with vines and layers of green leaves.|Orangutans live in the rainforest.
mountain|A very high hill with steep, rocky sides.|A tall rocky mountain with snow on top.|Snow leopards live on the mountain.
beach|Land by the sea, covered in sand or pebbles.|A sandy beach with shells and small waves.|The seal rests on the beach.
farm|Land where people grow crops and keep animals.|A red barn, a farmhouse and green fields seen from a distance.|The cows live on the farm.
garden|Land by a home where plants grow.|A small garden with a lawn, a flower bed and a wooden fence.|A fox comes into the garden.
hedge|A row of bushes growing close together.|A long green hedge with white flowers and red berries along the edge of a field.|The hedgehog hides in the hedge.
spring|The season when plants grow and many babies are born.|A blossom tree with pink flowers and yellow daffodils in the grass.|Lambs are born in spring.
summer|The warmest season.|A sunny meadow with long grass, red poppies and white daisies.|In summer the days are long.
autumn|The season when leaves fall and animals get ready for winter.|A tree with orange and red leaves, more leaves falling to the ground.|In autumn the leaves fall.
winter|The coldest season.|A bare frosty tree beside a frozen pond.|In winter the pond freezes.`
};
const source = new Set('lion,elephant,giraffe,monkey,bear,rabbit,dolphin,whale,fur,backbone,milk,land,water,ocean floor,cat,dog'.split(','));
export const wordRows = Object.values(groups).flatMap((raw) => raw.split("\n").map((line) => {
  const [name, definition, imageAlt, sentence] = line.split("|");
  const id = name.replaceAll(" ", "-");
  return { id, name, definition, imageAlt, sentence, kind: "word", image: `assets/topics/mammals/vocabulary/${id}.webp`, provenance: source.has(name) ? "source-outline" : "draft-extension" };
}));
