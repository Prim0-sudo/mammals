// Knowledge & Safety question bank for Mammal Discovery Club (Insects layout, 21 November 2026).
// q(id, group, word, prompt, choices, explanation, safe)
// - group: the word group the question belongs to (word-order.js ids); the picker plays every
//   question in a group. Animal Watching questions show under All and Staying Safe until that
//   group's pictures arrive.
// - word: the picture shown with the question, used only once that word's picture is in the
//   topic. null where a picture would give the answer away.
// - choices: the first choice is the right one; the game shuffles them every round.
// - safe: also listed under Staying Safe ("grown-up" throughout).
// The 13 questions from the first Mammals app are kept (reworded to the Insects style); the rest
// are new drafts. The 82 questions of the approved vocabulary plan (22 November 2026) bring the bank to 134.
// All wording is a draft for teacher review.
const q = (id, group, word, prompt, choices, explanation, safe = false) => ({ id, group, word, prompt, choices, explanation, safe });

export const knowledgeBank = [
  // Meet the Mammals
  q("milk", "mammals", null, "What do mammal mothers make to feed their babies?", ["Milk", "Sand", "Leaves"], "Mammal mothers make milk to feed their young."),
  q("hair", "mammals", null, "What do all mammals have at some time in their lives?", ["Hair or fur", "Feathers", "Scales like a fish"], "Every mammal has some hair or fur. Even a whale has a few hairs when it is young."),
  q("eggs", "mammals", null, "Which of these mammals lays eggs?", ["A platypus", "A cat", "An elephant"], "Most mammals are born alive. The platypus and the echidna lay eggs."),
  q("whale-mammal", "mammals", "whale", "A whale lives in the sea. Is it a mammal?", ["Yes, it breathes air and feeds its baby milk", "No, it is a fish", "No, it is a bird"], "A whale is a mammal. It breathes air and feeds its calf on milk."),
  q("bat-fly", "mammals", null, "Which of these mammals can fly?", ["A bat", "A rabbit", "A mouse"], "Bats are the only mammals that can really fly. Their wings are made of skin."),
  q("name-giraffe", "mammals", "giraffe", "What is this mammal?", ["A giraffe", "A zebra", "A camel"], "This is a giraffe. It has a very long neck and long legs."),
  q("zebra-stripes", "mammals", "zebra", "What can we see on the zebra?", ["Black and white stripes", "Orange spots", "Green scales"], "A zebra has black and white stripes. No two zebras have the same stripes."),
  q("camel-hump", "mammals", "camel", "What does a camel store in its hump?", ["Fat", "Water", "Sand"], "A camel's hump stores fat. The camel can use it when food is hard to find."),
  q("koala-food", "mammals", "koala", "What does a koala eat?", ["Eucalyptus leaves", "Fish", "Grass seeds"], "A koala eats the leaves of eucalyptus trees."),
  q("sloth-slow", "mammals", "sloth", "How does a sloth move?", ["Very slowly", "Very fast", "By swimming all day"], "A sloth moves very slowly through the trees and hangs from branches."),
  q("cheetah-fast", "mammals", "cheetah", "What is a cheetah famous for?", ["Running very fast", "Living under the sea", "Laying eggs"], "A cheetah is the fastest land animal over a short run."),
  q("gorilla-ape", "mammals", "gorilla", "A gorilla is a kind of which animal?", ["An ape", "A cat", "A bear"], "A gorilla is an ape, like a chimpanzee. Apes have no tail."),
  q("human-mammal", "mammals", "human", "Are people mammals?", ["Yes, we have hair and drank milk as babies", "No, we are birds", "No, we are fish"], "People are mammals too. We breathe air, have hair and fed on milk as babies."),
  q("panda-bear", "mammals", "giant-panda", "A giant panda is a kind of which animal?", ["A bear", "A cat", "A monkey"], "A giant panda is a bear. It eats almost nothing but bamboo."),
  q("koala-bear", "mammals", "koala", "Is a koala a kind of bear?", ["No, it is a pouched mammal", "Yes, it is a small bear", "No, it is a bird"], "Some people say \"koala bear\", but a koala is a pouched mammal. Its baby grows in a pouch."),
  q("orca-dolphin", "mammals", "orca", "An orca is the biggest kind of which animal?", ["A dolphin", "A shark", "A seal"], "An orca, or killer whale, is the biggest kind of dolphin."),
  q("blue-whale-big", "mammals", "blue-whale", "What is special about the blue whale?", ["It is the biggest animal that has ever lived", "It can fly", "It lives in the desert"], "The blue whale is the biggest animal ever, bigger than any dinosaur."),
  q("hare-rabbit", "mammals", "hare", "How is a hare different from a rabbit?", ["It has longer ears and back legs", "It has a trunk", "It has feathers"], "A hare is a cousin of the rabbit. It is bigger, with longer ears and legs, and it runs very fast."),
  q("bat-bird", "mammals", "bat", "Is a bat a bird?", ["No, it is a mammal with fur", "Yes, it has feathers", "Yes, it lays eggs"], "A bat is a mammal. It has fur, not feathers, and feeds its babies on milk."),
  q("wild-big", "mammals", null, "We see a big wild deer on our walk. What should we do?", ["Stay back and watch with a grown-up", "Run up to stroke it", "Chase it"], "Wild animals can be scared and may kick or bite. Watch from far away with a grown-up.", true),

  // Bodies Up Close
  q("backbone", "body", null, "Which body part is a row of bones along the back?", ["The backbone", "The mane", "The whiskers"], "Every mammal has a backbone."),
  q("lungs", "body", null, "What do mammals use to breathe air?", ["Lungs", "Gills", "Feathers"], "Mammals breathe air with their lungs, even mammals that live in the sea."),
  q("whiskers-use", "body", "whiskers", "What does a cat use its whiskers for?", ["To feel things near its face", "To eat its food", "To swim"], "Whiskers are long, stiff hairs that help a cat feel its way, even in the dark."),
  q("trunk-use", "body", "trunk", "What can an elephant do with its trunk?", ["Smell, drink and pick things up", "Only see", "Fly"], "An elephant's trunk is its long nose. It smells, sucks up water and grabs food."),
  q("hoof-animal", "body", null, "Which of these mammals has hooves?", ["A horse", "A cat", "A bat"], "A horse walks on hard hooves at the tips of its toes."),
  q("antlers-who", "body", "antlers", "Which mammal grows antlers?", ["A deer", "A cow", "A dog"], "Male deer grow antlers made of bone. They drop off and grow back each year."),
  q("blowhole-use", "body", "blowhole", "What does a dolphin use its blowhole for?", ["To breathe air", "To eat fish", "To hear"], "A blowhole is a nostril on top of the head. The dolphin breathes through it at the surface."),
  q("pouch-who", "body", "pouch", "Which mammal carries its baby in a pouch?", ["A kangaroo", "A horse", "A seal"], "A kangaroo mother carries her joey in a pouch on her tummy."),
  q("flipper-use", "body", "flipper", "What does a seal use its flippers for?", ["To swim", "To dig burrows", "To climb trees"], "A seal's flippers push and steer it through the water."),
  q("spines-who", "body", null, "Which mammal has spines on its back?", ["A hedgehog", "A cow", "A seal"], "A hedgehog's spines are stiff, hollow hairs. They keep it safe."),
  q("wool-use", "body", "wool", "What do people make from sheep's wool?", ["Warm jumpers", "Glass", "Paper plates"], "A sheep's woolly coat is cut off each summer and spun into yarn for jumpers."),
  q("snout-use", "body", "snout", "What does a pig use its snout for?", ["Sniffing and digging for food", "Flying", "Seeing in the dark"], "A pig's snout is a strong nose. It pushes into the soil to sniff out food."),
  q("bill-who", "body", null, "Which mammal has a bill a bit like a duck's?", ["A platypus", "A cat", "A horse"], "The platypus has a soft, rubbery bill. It feels for food under the water."),
  q("webbed-feet-use", "body", "webbed-feet", "What do webbed feet help an animal do?", ["Swim", "Fly", "Hear"], "Skin between the toes pushes against the water, like a paddle."),
  q("stripes-hide", "body", null, "How do a tiger's stripes help it?", ["They help it hide in long grass", "They keep it dry", "They help it fly"], "Stripes break up a tiger's shape in grass and shadow, so it can creep close."),
  q("fin-fish", "body", "fin", "A dolphin has a fin. Does that make it a fish?", ["No, it is a mammal that breathes air", "Yes, every animal with a fin is a fish", "Yes, it has gills"], "Dolphins and fish both have fins, but a dolphin breathes air with lungs and feeds its calf milk."),
  q("tusk-what", "body", "tusk", "What is a tusk?", ["A very long tooth", "A horn on the nose", "A kind of claw"], "A tusk is a long tooth that keeps growing. Elephants, walruses and narwhals have tusks."),
  q("paw-pads", "body", "paw", "What are the soft pads under a cat's paw for?", ["Walking quietly", "Smelling", "Hearing"], "Soft pads let a cat walk and creep without a sound."),
  q("fennec-ears", "body", "fennec-fox", "Why does a fennec fox have such big ears?", ["To hear well and to stay cool", "To fly", "To dig"], "Big ears help a fennec fox hear food under the sand and let heat out in the hot desert."),

  // Mothers & Young
  q("young-cat", "life-cycle", "kitten", "What is a young cat called?", ["A kitten", "A foal", "A lamb"], "A kitten is a young cat."),
  q("young-dog", "life-cycle", "puppy", "What is a young dog called?", ["A puppy", "A calf", "A kid"], "A puppy is a young dog."),
  q("young-sheep", "life-cycle", "lamb", "What is a young sheep called?", ["A lamb", "A cub", "A joey"], "A lamb is a young sheep."),
  q("young-horse", "life-cycle", "foal", "What is a young horse called?", ["A foal", "A kitten", "A puppy"], "A foal is a young horse. It can stand soon after it is born."),
  q("pouch", "life-cycle", "joey", "Where does a kangaroo joey stay when it is very small?", ["In its mother's pouch", "In an eggshell", "In a bird's nest"], "A very young joey grows and feeds in its mother's pouch."),
  q("calf-drink", "life-cycle", "calf", "What does a young calf drink?", ["Its mother's milk", "Sea water", "Honey"], "A calf drinks its mother's milk until it can eat grass."),
  q("young-pig", "life-cycle", "piglet", "What is a young pig called?", ["A piglet", "A kitten", "A foal"], "A piglet is a young pig. A mother pig can have a big litter of piglets."),
  q("young-deer", "life-cycle", "fawn", "What is a young deer called?", ["A fawn", "A lamb", "A cub"], "A fawn is a young deer. Its spotty coat helps it hide in the grass."),
  q("young-seal", "life-cycle", "pup", "What is a young seal called?", ["A pup", "A joey", "A kid"], "A baby seal is called a pup. Its mother feeds it rich milk on the beach."),
  q("litter-what", "life-cycle", null, "What is a litter of puppies?", ["Puppies born to one mother at the same time", "A puppy's bed", "A puppy's food"], "Cats, dogs, pigs and rabbits often have a litter of several babies at once."),
  q("born-alive", "life-cycle", null, "How do most baby mammals start life?", ["They are born from their mother's body", "They hatch from eggs in a nest", "They grow on trees"], "Most baby mammals grow inside their mother and are born. Only the platypus and the echidna lay eggs."),
  q("mother-near", "life-cycle", null, "A deer and her fawn are in the field. What should we do?", ["Stay far back with a grown-up", "Walk up to the fawn", "Try to stroke the mother"], "Mothers protect their babies. Give them lots of space and watch with a grown-up.", true),

  // Food & Feeding
  q("cow-eats", "food", "cow", "What does a cow eat?", ["Grass", "Fish", "Insects"], "A cow eats grass and chews it for a long time."),
  q("habitat", "food", "dugong", "Where does a dugong find seagrass to eat?", ["In shallow sea water", "On a snowy mountain", "In a dry cave"], "Dugongs eat seagrass that grows in shallow sea water near the coast."),
  q("chew-teeth", "food", null, "What do mammals use to chew their food?", ["Their teeth", "Their ears", "Their tails"], "Mammals chew food with their teeth to break it into smaller pieces."),
  q("giraffe-leaves", "food", "giraffe", "How does a giraffe reach leaves high in the trees?", ["With its long neck", "By flying", "By digging"], "A giraffe's long neck lets it reach leaves that other animals cannot."),
  q("panda-bamboo", "food", "giant-panda", "What does a giant panda eat most of the time?", ["Bamboo", "Fish", "Ants"], "A giant panda spends about half of every day eating bamboo."),
  q("whale-krill", "food", "blue-whale", "What does a blue whale eat?", ["Tiny sea animals called krill", "Big trees", "Grass"], "The biggest animal eats some of the smallest: millions of tiny krill."),
  q("squirrel-nuts", "food", "red-squirrel", "What does a red squirrel hide to eat later?", ["Nuts and seeds", "Fish", "Pebbles"], "Squirrels hide nuts in autumn and find them again when food is hard to find."),
  q("hedgehog-food", "food", "hedgehog", "What does a hedgehog like to eat?", ["Beetles, worms and slugs", "Grass and hay", "Bamboo"], "Hedgehogs hunt minibeasts at night. Never give them milk; it makes them ill."),
  q("plant-eaters", "food", null, "A cow, a rabbit and a horse eat only plants. What are they called?", ["Plant-eaters", "Meat-eaters", "Fish-eaters"], "Plant-eaters eat grass, leaves, fruit and seeds."),
  q("meat-eater-who", "food", null, "Which of these mammals is a meat-eater?", ["A lion", "A cow", "A sheep"], "A lion is a meat-eater. It hunts other animals for food."),
  q("predator-what", "food", null, "What is a predator?", ["An animal that hunts other animals", "An animal that eats only grass", "A baby animal"], "A fox is a predator. It hunts rabbits, mice and voles."),
  q("beaver-gnaw", "food", "beaver", "How does a beaver cut down small trees?", ["It gnaws them with its front teeth", "It pushes them with its tail", "It kicks them"], "A beaver's orange front teeth never stop growing, so it can gnaw through wood."),
  q("graze-what", "food", "sheep", "What are sheep doing when they graze?", ["Eating grass in a field", "Sleeping in a barn", "Swimming"], "Grazing animals nibble grass slowly as they walk across a field."),

  // Homes & Shelters
  q("burrow-what", "homes", "burrow", "What is a burrow?", ["A hole or tunnel in the ground", "A nest in a tree", "A boat"], "A burrow is a hole or tunnel that a mammal digs to live in."),
  q("rabbit-home", "homes", "rabbit", "Where do wild rabbits live?", ["In burrows under the ground", "In the sea", "On icebergs"], "Wild rabbits dig burrows and live in them in groups."),
  q("den-who", "homes", "den", "Which mammal often raises its cubs in a den?", ["A fox", "A dolphin", "A cow"], "A fox raises its cubs in a den, often dug under the ground."),
  q("badger-sett", "homes", "badger", "What is a badger's home called?", ["A sett", "A drey", "A stable"], "Badgers dig a sett: lots of tunnels and rooms under the ground."),
  q("squirrel-drey", "homes", "squirrel", "What is a squirrel's nest of twigs and leaves called?", ["A drey", "A sett", "A kennel"], "A squirrel builds its drey high up in a tree."),
  q("otter-holt", "homes", "otter", "What is an otter's home by the river called?", ["A holt", "A hutch", "A warren"], "An otter rests in a holt, a den in the riverbank or among tree roots."),
  q("beaver-lodge", "homes", "beaver", "What does a beaver build its lodge from?", ["Sticks and mud", "Snow", "Sand"], "Beavers pile up sticks and mud to make a lodge, with doors under the water."),
  q("warren-what", "homes", null, "Lots of rabbit burrows joined together make a…", ["Warren", "Stable", "Drey"], "Rabbits live in groups in a warren of tunnels."),
  q("bat-roost", "homes", "bat", "Where might bats roost in the day?", ["In caves, trees or roofs", "Under the sea", "In a bird's egg"], "Bats rest upside down in a roost by day and fly out at night."),
  q("rabbit-hutch", "homes", null, "Where does a pet rabbit often sleep?", ["In a hutch", "In a stable", "In a sett"], "A hutch is a wooden house for a pet rabbit or guinea pig. Pet rabbits need space to run too."),
  q("horse-stable", "homes", "horse", "Where does a horse rest on a farm?", ["In a stable", "In a burrow", "In a drey"], "A stable keeps a horse warm and dry."),

  // On the Move
  q("kangaroo-move", "movement", "kangaroo", "How does a kangaroo move fast?", ["It hops on its back legs", "It slides on its tummy", "It flies"], "A kangaroo hops on its strong back legs, using its tail for balance."),
  q("monkey-climb", "movement", "monkey", "What is a monkey good at?", ["Climbing trees", "Living under the sea", "Laying eggs"], "Monkeys climb with strong hands and feet, and many use their tails."),
  q("surface", "movement", "dolphin", "Where must a dolphin go to breathe?", ["Up to the water's surface", "Deep into the sand", "Inside a shell"], "A dolphin swims up and lifts its blowhole above the water to breathe."),
  q("wombat-dig", "movement", "wombat", "What does a wombat use its strong claws for?", ["Digging", "Flying", "Swimming"], "A wombat digs long burrows with its strong front claws."),
  q("glider-glide", "movement", "sugar-glider", "How does a sugar glider get from tree to tree?", ["It glides on flaps of skin", "It flaps feathered wings", "It swims"], "A sugar glider spreads the skin between its legs and glides. Only bats can truly fly."),
  q("gibbon-swing", "movement", null, "How does a gibbon move through the trees?", ["It swings from branch to branch", "It hops on its tail", "It slides on its tummy"], "Gibbons swing arm over arm through the forest, very fast."),
  q("horse-gallop", "movement", "horse", "What do we call a horse's fastest run?", ["A gallop", "A hop", "A waddle"], "When a horse gallops, all four hooves leave the ground for a moment."),
  q("fox-pounce", "movement", "fox", "How does a fox catch a mouse under the snow?", ["It leaps up and pounces down", "It digs with its tail", "It flies over it"], "A fox listens for a mouse, then jumps high and pounces on it."),
  q("moose-wade", "movement", "moose", "How does a moose reach water plants in a lake?", ["It wades into the water", "It climbs a tree", "It flies over the lake"], "A moose wades into lakes to eat water plants. It is a good swimmer too."),
  q("mole-dig", "movement", "mole", "How does a mole make its tunnels?", ["It digs with its big front paws", "It chews through rock", "It hops along"], "A mole's front paws are wide like spades. Molehills are the soil it pushes up."),
  q("dog-paddle", "movement", null, "How does a dog swim?", ["It paddles with its legs", "It flaps its wings", "It slides on ice"], "Dogs paddle their legs under the water. People call it doggy paddle."),

  // Senses & Survival
  q("air", "survival", "whale", "What does a whale breathe?", ["Air", "Sand", "Sea water"], "A whale breathes air with its lungs when it comes up to the surface."),
  q("dog-smell", "survival", "dog", "What is a dog very good at?", ["Smelling", "Flying", "Breathing under water"], "A dog's nose can smell things we cannot smell at all."),
  q("hide-why", "survival", "hide", "Why does a mouse hide?", ["To stay safe from animals that hunt it", "To keep warm in the sun", "To find the sea"], "A mouse hides so that owls, cats and foxes cannot catch it."),
  q("warm", "survival", null, "What does warm-blooded mean?", ["The body makes its own heat", "The animal must sit in hot water", "The fur is always hot"], "Mammals make their own body heat, even when the air or water is cold."),
  q("hedgehog-winter", "survival", null, "What do hedgehogs do in winter?", ["Hibernate in a nest of leaves", "Fly to a warm country", "Swim in the sea"], "Hedgehogs hibernate. They sleep deeply through the cold months, when food is hard to find."),
  q("badger-night", "survival", "badger", "A badger sleeps by day and comes out at night. What is that called?", ["Nocturnal", "Hibernating", "Grazing"], "Nocturnal animals sleep by day and look for food at night."),
  q("arctic-camouflage", "survival", null, "Why is an arctic fox white in winter?", ["To blend in with the snow", "To stay cool", "To look like a cloud"], "Its white winter coat is camouflage. In summer its coat turns brown or grey."),
  q("zebra-herd", "survival", "zebra", "Why do zebras live in big herds?", ["It is safer in a big group", "To keep their stripes clean", "To build nests"], "Many eyes and ears can spot a lion sooner, so a herd is safer."),
  q("meerkat-lookout", "survival", null, "What does a meerkat on lookout do?", ["Watches for danger and calls a warning", "Sleeps all day", "Catches fish"], "One meerkat stands tall and watches. If it sees danger, it calls and the others dash into their burrows."),
  q("wolf-howl", "survival", "wolf", "Why do wolves howl?", ["To call to their pack", "To ask for grass", "To wake the sun"], "A howl can be heard far away. It helps a wolf pack find each other."),
  q("hedgehog-touch", "survival", null, "A hedgehog is curled up in the garden. What should we do?", ["Leave it alone and tell a grown-up", "Pick it up", "Poke it with a stick"], "Its spines are sharp, and it is scared. Leave it be and tell a grown-up, who can check if it needs help.", true),

  // Habitats & Seasons
  q("land-water", "habitats", null, "Which animal spends its whole life in water but breathes air?", ["A dolphin", "A horse", "A cow"], "A dolphin lives in water and comes up to breathe air."),
  q("polar-home", "habitats", "polar-bear", "Where does a polar bear live?", ["On the Arctic sea ice", "In a hot desert", "In a rainforest"], "Polar bears live on the sea ice around the North Pole and hunt seals."),
  q("camel-desert", "habitats", "camel", "Which mammal is good at living in the desert?", ["A camel", "A seal", "A polar bear"], "Camels can go a long time without water, so they live well in deserts."),
  q("walrus-food", "habitats", "walrus", "Where does a walrus find its food?", ["On the ocean floor", "At the top of a tree", "In a field of grass"], "A walrus finds clams and other food on the ocean floor."),
  q("orangutan-home", "habitats", "orangutan", "Where does an orangutan live?", ["In the rainforest", "On the sea ice", "In the desert"], "Orangutans live high in the rainforest trees of two islands, Borneo and Sumatra."),
  q("snow-leopard-home", "habitats", null, "Where does a snow leopard live?", ["High in cold, rocky mountains", "In warm seas", "On a farm"], "Thick fur and a long, furry tail keep it warm in the snowy mountains."),
  q("reindeer-home", "habitats", null, "Where do reindeer live?", ["In cold, snowy lands in the far north", "In hot deserts", "In rainforests"], "Reindeer live in the cold Arctic. Their wide hooves help them walk on snow."),
  q("autumn-nuts", "habitats", null, "In which season do squirrels hide lots of nuts?", ["Autumn", "Spring", "Summer"], "In autumn there are lots of nuts, so squirrels store them for the winter."),
  q("spring-lambs", "habitats", null, "In which season are many lambs born?", ["Spring", "Autumn", "Winter"], "In spring, the fields fill with new lambs and calves."),
  q("hedgehog-name", "habitats", null, "Which mammal is named after the hedges it likes?", ["The hedgehog", "The horse", "The hare"], "A hedgehog snuffles along hedges and grunts a little like a pig, or \"hog\"."),
  q("seal-pup-alone", "habitats", null, "We see a seal pup alone on the beach. What should we do?", ["Stay far back and tell a grown-up", "Carry it to the sea", "Give it our sandwich"], "Its mother is usually feeding at sea and will come back. A grown-up can call for help if it is needed.", true),
  q("cows-field", "habitats", null, "Our path goes through a field with cows. What should we do?", ["Stay with a grown-up and walk calmly round them", "Run between the cows", "Go up to the calves"], "Cows protect their calves. Keep close to a grown-up, walk calmly and shut the gate.", true),

  // Animal Watching and staying safe (Staying Safe)
  q("wildlife", "watching", "seal", "A wild seal is resting on the beach. What should we do?", ["Stay back with a grown-up", "Touch its face", "Give it a snack"], "Wild animals need space. Watch from far away with a grown-up.", true),
  q("pet", "watching", "dog", "Before we stroke someone's dog, what should we do?", ["Ask the owner and our grown-up first", "Pull its tail", "Run up and shout"], "Always ask first. A grown-up and the owner can help us meet a dog safely.", true),
  q("hands", "watching", null, "What should we do after we touch a pet or a farm animal?", ["Wash our hands", "Lick our fingers", "Nothing at all"], "Wash our hands with soap, and ask a grown-up to help. It keeps us and the animals healthy.", true),
  q("baby-alone", "watching", null, "We find a baby animal on its own. What should we do?", ["Leave it and tell a grown-up", "Pick it up and take it home", "Chase it"], "Its mother is often close by. Leave it be and tell a grown-up.", true),
  q("quiet", "watching", null, "How can we watch wild animals without scaring them?", ["Stay still and quiet", "Shout and wave", "Throw things"], "Stay still and quiet beside a grown-up, and animals stay calm.", true),
  q("feed-wild", "watching", null, "Should we feed wild animals our snacks?", ["No, our food can make them ill", "Yes, always", "Only crisps"], "Wild animals need their own food, and our snacks can make them ill. Ask a grown-up what is safe.", true),
  q("binoculars-use", "watching", "binoculars", "What do binoculars help us do?", ["See animals that are far away", "Hear animals", "Catch animals"], "Binoculars make far-off animals look close, so we can watch without scaring them."),
  q("footprint-tells", "watching", "footprint", "What can footprints in the mud tell us?", ["Which animal walked by", "What the weather will be", "What time it is"], "Footprints, or tracks, in mud or snow show which animals have been there."),

  // Other Animals
  q("feathers", "neighbours", null, "Which of these animals has feathers?", ["A bird", "A cat", "A frog"], "Only birds have feathers. Mammals have hair or fur instead."),
  q("penguin-bird", "neighbours", "penguin", "A penguin swims in the sea. What kind of animal is it?", ["A bird", "A mammal", "A fish"], "A penguin is a bird that cannot fly. It uses its wings as flippers to swim."),
  q("shark-fish", "neighbours", "shark", "Is a shark a mammal, like a dolphin?", ["No, it is a fish that breathes with gills", "Yes, it breathes air", "Yes, it feeds its babies milk"], "A shark is a fish. It takes in air from the water through its gills."),
  q("fish-gills", "neighbours", null, "How does a fish breathe under water?", ["With gills", "With a blowhole", "It holds its breath"], "Fish have gills. Whales and dolphins have lungs and must come up for air."),
  q("tadpole-grow", "neighbours", "tadpole", "What does a tadpole grow into?", ["A frog", "A fish", "A mouse"], "Frogs lay frogspawn. The eggs hatch into tadpoles, which grow legs and become frogs."),
  q("reptile-skin", "neighbours", null, "What covers a snake's or a lizard's body?", ["Dry scales", "Soft fur", "Feathers"], "Reptiles have dry, scaly skin. Mammals have hair or fur."),
  q("tortoise-shell", "neighbours", "tortoise", "What does a tortoise do when it is scared?", ["Pulls its head into its shell", "Flies away", "Climbs a tree"], "A tortoise's hard shell is part of its body. It cannot take it off."),
  q("sea-turtle", "neighbours", null, "Where does a sea turtle spend most of its life?", ["In the sea", "In the desert", "Up a tree"], "Sea turtles swim in the ocean. The mothers come up onto beaches to lay their eggs."),
  q("egg-layers", "neighbours", null, "Which of these animals lays eggs?", ["A chicken", "A cow", "A horse"], "Birds, most reptiles, amphibians and fish lay eggs. Most mammals do not."),
  q("spider-legs", "neighbours", null, "How many legs does a spider have?", ["Eight", "Six", "Four"], "A spider has eight legs, so it is not an insect. Insects have six."),
  q("worm-legs", "neighbours", null, "How many legs does an earthworm have?", ["None", "Six", "Eight"], "An earthworm has no legs. It moves by stretching and squeezing its body."),
  q("owl-night", "neighbours", "owl", "When do most owls hunt?", ["At night", "Under the sea", "Inside a beehive"], "Most owls hunt at night. Their big eyes and sharp ears find mice and voles in the dark."),
  q("crocodile-what", "neighbours", "crocodile", "What kind of animal is a crocodile?", ["A reptile", "A mammal", "A fish"], "A crocodile is a reptile. It has scaly skin and lays eggs."),
  q("newt-what", "neighbours", "newt", "A newt lives in ponds and on land. What kind of animal is it?", ["An amphibian", "A mammal", "A bird"], "Amphibians, like frogs, toads and newts, start life in water and can live on land too."),
  q("octopus-arms", "neighbours", null, "How many arms does an octopus have?", ["Eight", "Two", "Twenty"], "An octopus has eight bendy arms and no bones at all."),
  q("jellyfish-beach", "neighbours", null, "We find a jellyfish on the beach. What should we do?", ["Do not touch it, and tell a grown-up", "Pick it up", "Poke it"], "Even a jellyfish on the sand can sting. Leave it alone and show a grown-up.", true),
  q("bee-near", "neighbours", null, "A bee buzzes near us. What should we do?", ["Stay calm and still, and tell a grown-up if it stings", "Swat it", "Grab it"], "Bees only sting if they are scared. Keep calm and let it fly away; a grown-up can help if it stings.", true),
];
