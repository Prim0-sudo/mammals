// Crafts (Arts & Crafts): real mammal crafts for home or class, shown one step at a time
// (the Insects pattern, 21 November 2026). Until Codex craft paintings arrive (finished craft plus
// one per step), each craft shows its animal's word picture and the steps show that picture too.
// When the art is in, set `art: true` on the craft and its files are used:
// assets/crafts/<id>-v1.webp and assets/crafts/<id>-step-<n>-v1.webp.
// `grownUp: true` marks a step that needs a grown-up (scissors, a stapler). Draft wording for teacher review.
const word = (name) => `assets/topics/mammals/vocabulary/${name}.webp`;

export const crafts = [
  { id: 'paper-plate-lion', name: 'Paper plate lion', fallback: word('lion'),
    need: ['A paper plate', 'Yellow and orange paint and a brush', 'Orange and brown paper', 'A black pen', 'Glue', 'Scissors'],
    steps: [
      { text: 'Paint the plate yellow. Let it dry.' },
      { text: 'Cut lots of strips of orange and brown paper.', grownUp: true },
      { text: 'Glue the strips all round the edge of the plate. This is the mane.' },
      { text: 'Draw two eyes, a nose and a mouth in the middle.' },
      { text: 'Add whiskers. Only grown-up male lions have a big mane!' }
    ] },
  { id: 'tube-rabbit', name: 'Cardboard tube rabbit', fallback: word('rabbit'),
    need: ['A cardboard tube', 'White or brown paper', 'A cotton wool ball', 'A pen', 'Glue', 'Scissors'],
    steps: [
      { text: 'Wrap the tube in paper and glue it in place.' },
      { text: 'Cut two long ears from the paper.', grownUp: true },
      { text: 'Glue the ears inside the top of the tube.' },
      { text: 'Draw a face with a nose and long whiskers.' },
      { text: 'Glue a cotton wool tail on the back. A rabbit uses its long ears to listen for danger.' }
    ] },
  { id: 'paper-plate-hedgehog', name: 'Paper plate hedgehog', fallback: word('hedgehog'),
    need: ['A paper plate', 'Brown paper', 'Brown paint and a brush', 'A black pen', 'Glue', 'Scissors'],
    steps: [
      { text: 'Fold the plate in half to make the body.' },
      { text: 'Paint the round edge brown. Let it dry.' },
      { text: 'Cut lots of thin, pointed strips of brown paper. These are the spines.', grownUp: true },
      { text: 'Glue the spines along the round edge.' },
      { text: 'Draw an eye and a little black nose at the pointed end. A hedgehog rolls into a ball to stay safe.' }
    ] },
  { id: 'kangaroo-pouch', name: 'Kangaroo with a pocket pouch', fallback: word('kangaroo'),
    need: ['Brown card', 'A small piece of brown paper', 'A pen', 'Glue', 'Scissors'],
    steps: [
      { text: 'Draw a big kangaroo on the card, with long back legs and a long tail.' },
      { text: 'Cut it out.', grownUp: true },
      { text: 'Cut a small half circle of paper for the pouch.', grownUp: true },
      { text: 'Glue only the sides and bottom of the pouch onto the tummy, so it opens at the top.' },
      { text: 'Draw a tiny joey, cut it out and pop it in the pouch.' }
    ] },
  { id: 'paper-whale', name: 'Spouting paper whale', fallback: word('whale'),
    need: ['Blue paper', 'White paper or tissue paper', 'A pen', 'Glue', 'Scissors'],
    steps: [
      { text: 'Fold the blue paper in half and draw half a whale against the fold.' },
      { text: 'Cut it out and open it up.', grownUp: true },
      { text: 'Draw an eye and a smile.' },
      { text: 'Cut thin strips of white paper and glue them to the top of the head. This is the spout from the blowhole.' },
      { text: 'A whale breathes air through its blowhole, then dives back down.' }
    ] },
  { id: 'sock-elephant', name: 'Elephant trunk puppet', fallback: word('elephant'),
    need: ['An old grey sock', 'Grey card', 'Two buttons or googly eyes', 'Glue', 'Scissors'],
    steps: [
      { text: 'Put the sock on your hand. Your arm is the trunk!' },
      { text: 'Cut two big round ears from the card.', grownUp: true },
      { text: 'Glue the ears to the sides of the sock, near your wrist.' },
      { text: 'Glue on two eyes above the ears.' },
      { text: 'Wave the trunk. An elephant uses its trunk to smell, drink and pick things up.' }
    ] },
];

for (const craft of crafts) {
  craft.picture = craft.art ? `assets/crafts/${craft.id}-v1.webp` : craft.fallback;
  craft.steps.forEach((step, i) => { step.picture = craft.art ? `assets/crafts/${craft.id}-step-${i + 1}-v1.webp` : craft.fallback; });
}

export const craft = (id) => crafts.find((c) => c.id === id) || null;
