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
// are new drafts. The vocabulary plan grows the bank towards the Insects size (about 134).
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

  // Mothers & Young
  q("young-cat", "life-cycle", "kitten", "What is a young cat called?", ["A kitten", "A foal", "A lamb"], "A kitten is a young cat."),
  q("young-dog", "life-cycle", "puppy", "What is a young dog called?", ["A puppy", "A calf", "A kid"], "A puppy is a young dog."),
  q("young-sheep", "life-cycle", "lamb", "What is a young sheep called?", ["A lamb", "A cub", "A joey"], "A lamb is a young sheep."),
  q("young-horse", "life-cycle", "foal", "What is a young horse called?", ["A foal", "A kitten", "A puppy"], "A foal is a young horse. It can stand soon after it is born."),
  q("pouch", "life-cycle", "joey", "Where does a kangaroo joey stay when it is very small?", ["In its mother's pouch", "In an eggshell", "In a bird's nest"], "A very young joey grows and feeds in its mother's pouch."),
  q("calf-drink", "life-cycle", "calf", "What does a young calf drink?", ["Its mother's milk", "Sea water", "Honey"], "A calf drinks its mother's milk until it can eat grass."),

  // Food & Feeding
  q("cow-eats", "food", "cow", "What does a cow eat?", ["Grass", "Fish", "Insects"], "A cow eats grass and chews it for a long time."),
  q("habitat", "food", "dugong", "Where does a dugong find seagrass to eat?", ["In shallow sea water", "On a snowy mountain", "In a dry cave"], "Dugongs eat seagrass that grows in shallow sea water near the coast."),
  q("chew-teeth", "food", null, "What do mammals use to chew their food?", ["Their teeth", "Their ears", "Their tails"], "Mammals chew food with their teeth to break it into smaller pieces."),
  q("giraffe-leaves", "food", "giraffe", "How does a giraffe reach leaves high in the trees?", ["With its long neck", "By flying", "By digging"], "A giraffe's long neck lets it reach leaves that other animals cannot."),

  // Homes & Shelters
  q("burrow-what", "homes", "burrow", "What is a burrow?", ["A hole or tunnel in the ground", "A nest in a tree", "A boat"], "A burrow is a hole or tunnel that a mammal digs to live in."),
  q("rabbit-home", "homes", "rabbit", "Where do wild rabbits live?", ["In burrows under the ground", "In the sea", "On icebergs"], "Wild rabbits dig burrows and live in them in groups."),
  q("den-who", "homes", "den", "Which mammal often raises its cubs in a den?", ["A fox", "A dolphin", "A cow"], "A fox raises its cubs in a den, often dug under the ground."),

  // On the Move
  q("kangaroo-move", "movement", "kangaroo", "How does a kangaroo move fast?", ["It hops on its back legs", "It slides on its tummy", "It flies"], "A kangaroo hops on its strong back legs, using its tail for balance."),
  q("monkey-climb", "movement", "monkey", "What is a monkey good at?", ["Climbing trees", "Living under the sea", "Laying eggs"], "Monkeys climb with strong hands and feet, and many use their tails."),
  q("surface", "movement", "dolphin", "Where must a dolphin go to breathe?", ["Up to the water's surface", "Deep into the sand", "Inside a shell"], "A dolphin swims up and lifts its blowhole above the water to breathe."),
  q("wombat-dig", "movement", "wombat", "What does a wombat use its strong claws for?", ["Digging", "Flying", "Swimming"], "A wombat digs long burrows with its strong front claws."),

  // Senses & Survival
  q("air", "survival", "whale", "What does a whale breathe?", ["Air", "Sand", "Sea water"], "A whale breathes air with its lungs when it comes up to the surface."),
  q("dog-smell", "survival", "dog", "What is a dog very good at?", ["Smelling", "Flying", "Breathing under water"], "A dog's nose can smell things we cannot smell at all."),
  q("hide-why", "survival", "hide", "Why does a mouse hide?", ["To stay safe from animals that hunt it", "To keep warm in the sun", "To find the sea"], "A mouse hides so that owls, cats and foxes cannot catch it."),
  q("warm", "survival", null, "What does warm-blooded mean?", ["The body makes its own heat", "The animal must sit in hot water", "The fur is always hot"], "Mammals make their own body heat, even when the air or water is cold."),

  // Habitats & Seasons
  q("land-water", "habitats", null, "Which animal spends its whole life in water but breathes air?", ["A dolphin", "A horse", "A cow"], "A dolphin lives in water and comes up to breathe air."),
  q("polar-home", "habitats", "polar-bear", "Where does a polar bear live?", ["On the Arctic sea ice", "In a hot desert", "In a rainforest"], "Polar bears live on the sea ice around the North Pole and hunt seals."),
  q("camel-desert", "habitats", "camel", "Which mammal is good at living in the desert?", ["A camel", "A seal", "A polar bear"], "Camels can go a long time without water, so they live well in deserts."),
  q("walrus-food", "habitats", "walrus", "Where does a walrus find its food?", ["On the ocean floor", "At the top of a tree", "In a field of grass"], "A walrus finds clams and other food on the ocean floor."),

  // Animal Watching and staying safe (Staying Safe)
  q("wildlife", "watching", "seal", "A wild seal is resting on the beach. What should we do?", ["Stay back with a grown-up", "Touch its face", "Give it a snack"], "Wild animals need space. Watch from far away with a grown-up.", true),
  q("pet", "watching", "dog", "Before we stroke someone's dog, what should we do?", ["Ask the owner and our grown-up first", "Pull its tail", "Run up and shout"], "Always ask first. A grown-up and the owner can help us meet a dog safely.", true),
  q("hands", "watching", null, "What should we do after we touch a pet or a farm animal?", ["Wash our hands", "Lick our fingers", "Nothing at all"], "Washing our hands keeps us and the animals healthy.", true),
  q("baby-alone", "watching", null, "We find a baby animal on its own. What should we do?", ["Leave it and tell a grown-up", "Pick it up and take it home", "Chase it"], "Its mother is often close by. Leave it be and tell a grown-up.", true),
  q("quiet", "watching", null, "How can we watch wild animals without scaring them?", ["Stay still and quiet", "Shout and wave", "Throw things"], "Animals stay calm when we are still and quiet.", true),
  q("feed-wild", "watching", null, "Should we feed wild animals our snacks?", ["No, our food can make them ill", "Yes, always", "Only crisps"], "Wild animals need their own food. Our snacks can make them ill.", true),
];
