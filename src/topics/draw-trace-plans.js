// Hand-set tracing steps for the Draw & Trace outlines, keyed by picture id (as Insects). Owner, 25 November 2026:
// "its randomly drawing different parts" - without a plan the converter groups lines by colour and then by where they
// sit, so a mostly-brown picture (bats in the barn) mixes a wall, a beam and a bat in one step. A plan names each step
// and says where its lines are (see byPlan in src/core/line-art.js): a box [x0, y0, x1, y1], optionally led by a colour
// name; { c, path, d } for lines along a rough path; { c, ring: [cx, cy, rx, ry], d } for lines round an oval. A point
// goes to the smallest place that holds it. Drawing space is 1000 x 750. Keep 3 steps for Easy, 6 for Medium and 10 for
// Hard. Check a change with tools/art/plan-preview.html.
const ALL = [0, 0, 1000, 750];

export const drawTracePlans = {
  // Easy
  'easy-01-mouse': [
    { title: 'Draw the head, ears and body', find: [['brown', ...ALL]] },
    { title: 'Add the tail and feet', find: [['brown', 100, 270, 292, 645], ['brown', 290, 585, 660, 670]] },
    { title: 'Add the eye, nose and whiskers', find: [['black', ...ALL]] }
  ],
  'easy-02-whale': [
    { title: 'Draw the whale’s body and tail', find: [['blue', ...ALL]] },
    { title: 'Add the flipper and the spout', find: [['blue', 590, 60, 810, 244],
      { c: 'blue', path: [[650, 490], [600, 480], [540, 500], [490, 560], [455, 640], [470, 660], [550, 640], [600, 580], [650, 500]], d: 18, closed: true }] },
    { title: 'Add the eye and smile', find: [['black', ...ALL]] }
  ],
  'easy-03-cat': [
    { title: 'Draw the head and ears', find: [['brown', 200, 40, 540, 300], ['brown', 230, 300, 340, 345]] },
    { title: 'Draw the body, legs and tail', find: [['brown', ...ALL]] },
    { title: 'Add the eye, nose and whiskers', find: [['black', ...ALL]] }
  ],
  'easy-04-pig': [
    { title: 'Draw the body, legs and tail', find: [['pink', ...ALL]] },
    { title: 'Add the head, ear and snout', find: [['pink', 480, 105, 915, 445]] },
    { title: 'Add the eye, nostrils and hooves', find: [['black', ...ALL]] }
  ],
  'easy-05-rabbit': [
    { title: 'Draw the head and ears', find: [['brown', 515, 40, 780, 440], ['brown', 455, 40, 560, 300]] },
    { title: 'Draw the body, feet and grass', find: [['brown', ...ALL], ['green', ...ALL]] },
    { title: 'Add the eye, nose and whiskers', find: [['black', ...ALL]] }
  ],
  'easy-06-hedgehog': [
    { title: 'Draw the face, tummy and feet', find: [['brown', ...ALL]] },
    { title: 'Add the spikes', find: [{ c: 'brown', path: [[230, 580], [100, 500], [160, 455], [100, 390], [180, 355], [140, 290], [235, 280], [215, 190], [305, 215],
      [325, 135], [400, 180], [445, 100], [500, 165], [570, 105], [605, 185], [690, 145], [700, 225], [775, 210], [755, 290]], d: 25 }] },
    { title: 'Add the eye, nose and claws', find: [['black', ...ALL]] }
  ],
  'easy-07-fox': [
    { title: 'Draw the head and ears', find: [['orange', 205, 55, 550, 388]] },
    { title: 'Draw the body and the bushy tail', find: [['orange', ...ALL]] },
    { title: 'Add the eyes, nose and paws', find: [['black', ...ALL]] }
  ],
  'easy-08-sheep': [
    { title: 'Draw the woolly body and legs', find: [['brown', ...ALL]] },
    { title: 'Add the head and ear', find: [['brown', 570, 100, 910, 362]] },
    { title: 'Add the face, hooves and grass', find: [['black', ...ALL], ['green', ...ALL]] }
  ],
  'easy-09-bat': [
    { title: 'Draw the head and ears', find: [{ c: 'brown', ring: [500, 310, 115, 97], d: 15 }, ['brown', 320, 100, 680, 265]] },
    { title: 'Draw the body, wings and feet', find: [['brown', ...ALL]] },
    { title: 'Add the eyes, nose and smile', find: [['black', ...ALL]] }
  ],
  'easy-10-seal': [
    { title: 'Draw the rock', find: [{ c: 'brown', path: [[235, 495], [190, 515], [135, 580], [120, 615], [140, 632], [500, 637], [850, 630], [868, 600], [830, 530], [760, 485], [715, 472]], d: 22 }] },
    { title: 'Draw the seal', find: [['brown', ...ALL]] },
    { title: 'Add the eyes, whiskers and claws', find: [['black', ...ALL]] }
  ],

  // Medium
  'medium-01-squirrel-with-a-nut': [
    { title: 'Draw the branch', find: [['brown', ...ALL]] },
    { title: 'Add the leaves', find: [['green', ...ALL]] },
    { title: 'Draw the bushy tail', find: [['orange', 180, 80, 440, 300], ['orange', 180, 300, 322, 520]] },
    { title: 'Draw the head and ears', find: [['orange', 445, 55, 690, 292]] },
    { title: 'Draw the body, paws and feet', find: [['orange', ...ALL]] },
    { title: 'Add the acorn, face and claws', find: [['gold', ...ALL], ['black', ...ALL]] }
  ],
  'medium-02-rabbit-by-its-burrow': [
    { title: 'Draw the burrow mound', find: [['brown', 40, 380, 470, 630]] },
    { title: 'Add the burrow hole', find: [{ c: 'brown', ring: [262, 522, 80, 80], d: 14 }, ['black', 230, 450, 350, 530]] },
    { title: 'Add the grass', find: [['green', ...ALL]] },
    { title: 'Draw the rabbit’s head and ears', find: [['brown', 695, 95, 875, 385], ['brown', 630, 95, 695, 345]] },
    { title: 'Draw the body, tail and feet', find: [['brown', 475, 330, 860, 630]] },
    { title: 'Add the eye, nose and whiskers', find: [['black', 690, 280, 950, 380]] }
  ],
  'medium-03-elephant': [
    { title: 'Draw the head and trunk', find: [['brown', 430, 60, 930, 430]] },
    { title: 'Add the big ear', find: [{ c: 'brown', path: [[440, 200], [540, 175], [620, 210], [640, 280], [610, 360], [540, 430], [470, 370], [430, 280]], d: 20, closed: true }] },
    { title: 'Draw the back and the tail', find: [['brown', 80, 190, 720, 520], ['brown', 75, 440, 140, 555]] },
    { title: 'Add the four legs', find: [['brown', 130, 520, 720, 680]] },
    { title: 'Add the tusks', find: [['black', 690, 355, 905, 465]] },
    { title: 'Add the eye and toenails', find: [['black', ...ALL]] }
  ],
  'medium-04-lion': [
    { title: 'Draw the face', find: [{ c: 'gold', ring: [475, 300, 147, 140], d: 16 }] },
    { title: 'Add the ears', find: [['gold', 330, 130, 425, 225], ['gold', 530, 130, 630, 225]] },
    { title: 'Draw the mane', find: [['gold', 230, 45, 720, 495]] },
    { title: 'Draw the body, legs and paws', find: [['gold', ...ALL]] },
    { title: 'Add the tail', find: [['gold', 675, 330, 800, 600], ['black', 700, 315, 810, 440]] },
    { title: 'Add the eyes, nose, mouth and whiskers', find: [['black', ...ALL]] }
  ],
  'medium-05-giraffe': [
    { title: 'Draw the tree', find: [['green', ...ALL], ['brown', ...ALL]] },
    { title: 'Draw the head and horns', find: [['gold', 685, 50, 885, 182]] },
    { title: 'Draw the long neck', find: [['gold', 655, 135, 795, 355]] },
    { title: 'Draw the body, spots and tail', find: [['gold', 400, 340, 800, 495], ['gold', 400, 495, 470, 540]] },
    { title: 'Add the legs', find: [['gold', ...ALL]] },
    { title: 'Add the eye, nose, hooves and tail tip', find: [['black', ...ALL]] }
  ],
  'medium-06-kangaroo-and-joey': [
    { title: 'Draw the mother’s head and ears', find: [['orange', 490, 45, 705, 250]] },
    { title: 'Draw her body and arms', find: [['orange', ...ALL]] },
    { title: 'Add the big tail', find: [['orange', 140, 560, 385, 665]] },
    { title: 'Add the legs and feet', find: [['orange', 385, 585, 705, 672]] },
    { title: 'Draw the joey in the pouch', find: [['orange', 515, 362, 648, 495], ['black', 560, 405, 650, 440]] },
    { title: 'Add her eye, nose and the ground', find: [['black', ...ALL], ['brown', ...ALL]] }
  ],
  'medium-07-otter-floating': [
    { title: 'Draw the head and ears', find: [['brown', 125, 80, 415, 285]] },
    { title: 'Draw the body and tail', find: [['brown', ...ALL]] },
    { title: 'Add the front paws', find: [['brown', 230, 280, 465, 400]] },
    { title: 'Add the back feet', find: [['brown', 450, 375, 755, 548]] },
    { title: 'Add the eyes, nose and whiskers', find: [['black', ...ALL]] },
    { title: 'Add the water', find: [['blue', ...ALL]] }
  ],
  'medium-08-zebra': [
    { title: 'Draw the head and ears', find: [['brown', 650, 50, 875, 305]] },
    { title: 'Add the mane', find: [['brown', 470, 70, 650, 280]] },
    { title: 'Draw the body and tail', find: [['brown', 110, 240, 720, 465]] },
    { title: 'Add the legs', find: [['brown', ...ALL]] },
    { title: 'Add the stripes', find: [['black', 240, 150, 700, 470], ['black', 225, 515, 680, 575]] },
    { title: 'Add the eye, nose, hooves and tail tip', find: [['black', ...ALL]] }
  ],
  'medium-09-cow-and-calf': [
    { title: 'Draw the cow’s head and horns', find: [['brown', 385, 105, 645, 315]] },
    { title: 'Draw the cow’s body, legs and tail', find: [['brown', 70, 200, 525, 580]] },
    { title: 'Draw the calf', find: [['brown', 545, 305, 925, 580]] },
    { title: 'Add the patches', find: [['black', 155, 250, 405, 415], ['black', 610, 370, 780, 480]] },
    { title: 'Add the eyes, noses and hooves', find: [['black', ...ALL]] },
    { title: 'Add the ground and grass', find: [['brown', 60, 578, 935, 600], ['green', ...ALL]] }
  ],
  'medium-10-dolphin-jumping': [
    { title: 'Draw the dolphin’s body', find: [['blue', ...ALL]] },
    { title: 'Add the fin on its back', find: [['blue', 405, 65, 470, 165], ['blue', 470, 65, 570, 130]] },
    { title: 'Add the flipper', find: [{ c: 'blue', path: [[525, 312], [560, 290], [610, 276], [605, 320], [575, 365], [530, 398], [495, 390], [505, 350]], d: 14, closed: true }] },
    { title: 'Add the tail', find: [['blue', 135, 395, 375, 535]] },
    { title: 'Add the splash and the waves', find: [['blue', 180, 470, 820, 680]] },
    { title: 'Add the eye, blowhole and mouth', find: [['black', ...ALL]] }
  ],

  // Hard
  'hard-01-rabbit-warren': [
    { title: 'Draw the ground', find: [['brown', 60, 225, 940, 282]] },
    { title: 'Add the burrow holes', find: [['brown', 625, 230, 735, 282], ['brown', 225, 252, 355, 282]] },
    { title: 'Add the grass', find: [['green', ...ALL]] },
    { title: 'Draw the rabbit on top', find: [['brown', 215, 45, 355, 252], ['black', 220, 135, 355, 175]] },
    { title: 'Dig the tunnels', find: [['brown', 175, 275, 800, 440]] },
    { title: 'Dig the three rooms', find: [['brown', 55, 435, 945, 710], { c: 'brown', ring: [202, 567, 137, 128], d: 14 },
      { c: 'brown', ring: [490, 565, 130, 125], d: 14 }, { c: 'brown', ring: [785, 570, 150, 130], d: 14 }] },
    { title: 'Add the sleeping rabbit', find: [['brown', 95, 480, 320, 655]] },
    { title: 'Add the mother rabbit', find: [['brown', 658, 460, 812, 655]] },
    { title: 'Add the baby rabbit', find: [['brown', 812, 535, 905, 655]] },
    { title: 'Add their faces', find: [['black', ...ALL]] }
  ],
  'hard-02-farm-friends': [
    { title: 'Draw the barn', find: [['brown', 80, 55, 360, 250], ['brown', 95, 195, 130, 420], ['brown', 320, 195, 345, 305], ['brown', 70, 395, 150, 425]] },
    { title: 'Add the barn door', find: [['red', ...ALL]] },
    { title: 'Draw the fence', find: [['brown', 345, 215, 925, 415]] },
    { title: 'Add the bush', find: [['green', 695, 160, 925, 330]] },
    { title: 'Draw the ground and grass', find: [['brown', 75, 520, 925, 548], ['brown', 70, 665, 925, 690], ['green', ...ALL]] },
    { title: 'Draw the cow', find: [['brown', 375, 270, 560, 405], ['brown', 560, 270, 600, 335], ['brown', 150, 300, 495, 535],
      { c: 'brown', path: [[446, 290], [442, 262], [450, 244]], d: 14 }, { c: 'brown', path: [[530, 290], [540, 262], [548, 245]], d: 14 }] },
    { title: 'Add the cow’s patches', find: [['black', 195, 310, 330, 470]] },
    { title: 'Draw the sheep', find: [['brown', 590, 315, 905, 530]] },
    { title: 'Draw the pig', find: [['pink', ...ALL]] },
    { title: 'Add the eyes, noses and hooves', find: [['black', ...ALL]] }
  ],
  'hard-03-badger-at-its-sett': [
    { title: 'Draw the treetop', find: [['green', 140, 55, 470, 265]] },
    { title: 'Draw the trunk and roots', find: [['brown', 185, 230, 415, 445]] },
    { title: 'Draw the sett and the ground', find: [{ c: 'brown', path: [[60, 595], [80, 500], [130, 420], [200, 375], [280, 355], [360, 365], [420, 395], [470, 440]], d: 15 },
      ['brown', 395, 375, 455, 440],
      { c: 'brown', path: [[55, 585], [104, 566], [160, 563], [270, 562], [400, 570], [455, 578], [700, 580], [810, 577], [935, 587]], d: 14 }] },
    { title: 'Dig the two holes', find: [['brown', 110, 430, 265, 580], ['brown', 280, 465, 400, 580], ['black', 140, 450, 370, 520]] },
    { title: 'Add the ferns', find: [['green', 70, 265, 215, 390], ['green', 380, 265, 550, 415]] },
    { title: 'Draw the badger’s body', find: [['brown', 430, 355, 940, 625]] },
    { title: 'Draw its head and ears', find: [['brown', 705, 315, 915, 470], ['brown', 800, 470, 915, 515]] },
    { title: 'Add the face stripes', find: [['black', 715, 325, 915, 515]] },
    { title: 'Add the claws', find: [['black', ...ALL]] },
    { title: 'Add the grass', find: [['green', ...ALL]] }
  ],
  'hard-04-beaver-lodge': [
    { title: 'Draw the river bank', find: [['brown', 70, 395, 560, 500]] },
    { title: 'Draw the beaver’s head and ears', find: [['brown', 245, 60, 460, 250]] },
    { title: 'Draw its body', find: [['brown', 200, 252, 420, 400]] },
    { title: 'Add the flat tail', find: [['brown', 125, 335, 215, 400]] },
    { title: 'Add the paws and the stick', find: [['brown', 300, 250, 515, 320]] },
    { title: 'Add the eye, nose and teeth', find: [['black', ...ALL]] },
    { title: 'Build the lodge', find: [['brown', 550, 330, 900, 495]] },
    { title: 'Add the reeds and grass', find: [['green', ...ALL]] },
    { title: 'Draw the water’s edge', find: [['blue', 70, 480, 930, 500]] },
    { title: 'Add the ripples', find: [['blue', ...ALL]] }
  ],
  'hard-05-stag-in-the-forest': [
    { title: 'Draw the tree on the left', find: [['green', 55, 300, 280, 500], ['brown', 125, 470, 210, 625]] },
    { title: 'Draw the tree on the right', find: [['green', 715, 300, 945, 500], ['brown', 780, 470, 865, 625]] },
    { title: 'Draw the stag’s head and ear', find: [['brown', 230, 165, 470, 285]] },
    { title: 'Add the antlers', find: [['brown', 315, 40, 600, 200]] },
    { title: 'Draw the neck and chest', find: [['brown', 270, 280, 440, 500]] },
    { title: 'Draw the body and tail', find: [['brown', 430, 330, 705, 500]] },
    { title: 'Add the front legs', find: [['brown', 280, 450, 450, 670]] },
    { title: 'Add the back legs', find: [['brown', 450, 450, 700, 670]] },
    { title: 'Add the eye, nose and hooves', find: [['black', ...ALL]] },
    { title: 'Add the grass', find: [['green', ...ALL]] }
  ],
  'hard-06-hedgehog-in-leaves': [
    { title: 'Draw the bush', find: [['green', ...ALL]] },
    { title: 'Draw the hedgehog’s spikes', find: [['brown', 300, 185, 700, 440]] },
    { title: 'Draw its round tummy', find: [['brown', 380, 440, 700, 550]] },
    { title: 'Add the face and ear', find: [['brown', 372, 290, 530, 470]] },
    { title: 'Add the paws', find: [['brown', 355, 415, 485, 470]] },
    { title: 'Add the eye and nose', find: [['black', ...ALL]] },
    { title: 'Add the leaves on the left', find: [['orange', 90, 225, 330, 630], ['gold', 95, 355, 270, 475]] },
    { title: 'Add the leaves on the right', find: [['orange', 700, 345, 895, 475], ['gold', 690, 240, 910, 635]] },
    { title: 'Add the leaves at the bottom', find: [['orange', 490, 540, 670, 675], ['gold', 285, 540, 485, 685]] },
    { title: 'Add the twigs', find: [['brown', 90, 625, 275, 690], ['brown', 650, 630, 845, 695]] }
  ],
  'hard-07-bats-in-the-barn': [
    { title: 'Draw the barn roof', find: [['brown', 70, 55, 930, 225]] },
    { title: 'Draw the barn walls', find: [['brown', 80, 215, 920, 690]] },
    { title: 'Draw the open door', find: [{ c: 'brown', path: [[510, 245], [878, 245], [878, 672], [510, 672]], d: 14, closed: true }] },
    { title: 'Add the beam', find: [['brown', 100, 312, 472, 358]] },
    { title: 'Add the moon', find: [['gold', ...ALL]] },
    { title: 'Hang the first bat', find: [['brown', 110, 342, 215, 548]] },
    { title: 'Hang the second bat', find: [['brown', 235, 342, 335, 548]] },
    { title: 'Hang the third bat', find: [['brown', 358, 342, 460, 548]] },
    { title: 'Draw the flying bat’s head and body', find: [['brown', 615, 380, 765, 610]] },
    { title: 'Add its wings', find: [['brown', 518, 425, 872, 575]] }
  ],
  'hard-08-elephant-family': [
    { title: 'Draw the tree', find: [['green', 95, 75, 490, 185], ['brown', 165, 155, 385, 320]] },
    { title: 'Draw the waterhole', find: [['blue', ...ALL]] },
    { title: 'Draw the baby elephant', find: [['brown', 62, 345, 262, 548]] },
    { title: 'Draw the mother’s head and ear', find: [['brown', 350, 240, 590, 400], ['brown', 492, 380, 550, 485]] },
    { title: 'Draw her body and legs', find: [['brown', 275, 290, 520, 548]] },
    { title: 'Draw the father’s head and ear', find: [['brown', 660, 232, 928, 415], ['brown', 806, 380, 880, 500]] },
    { title: 'Draw his body and legs', find: [['brown', 585, 280, 830, 548]] },
    { title: 'Add the tusks', find: [['black', 455, 345, 590, 400], ['black', 750, 335, 915, 400]] },
    { title: 'Add the eyes and toenails', find: [['black', ...ALL]] },
    { title: 'Add the grass', find: [['green', ...ALL]] }
  ],
  'hard-09-seal-and-pup': [
    { title: 'Draw the waves', find: [['blue', ...ALL]] },
    { title: 'Draw the mother seal’s body', find: [['brown', 70, 150, 810, 415]] },
    { title: 'Add her tail flippers', find: [['brown', 70, 240, 210, 405]] },
    { title: 'Add her front flipper', find: [['brown', 455, 310, 600, 415], ['black', 465, 350, 540, 415]] },
    { title: 'Add her face', find: [['black', 600, 170, 815, 290]] },
    { title: 'Draw the pup’s body', find: [['brown', 360, 390, 885, 590]] },
    { title: 'Add the pup’s tail flippers', find: [['brown', 355, 455, 465, 580]] },
    { title: 'Add the pup’s front flipper', find: [['brown', 640, 505, 750, 592], ['black', 645, 525, 705, 585]] },
    { title: 'Add the pup’s face', find: [['black', ...ALL]] },
    { title: 'Draw the rocks and the sand', find: [['brown', 60, 590, 940, 695]] }
  ],
  'hard-10-monkeys-in-the-trees': [
    // the trunk, both branches and the hanging monkey's tail are one joined brown line: paths keep each edge apart
    { title: 'Draw the tree trunk', find: [['brown', 85, 150, 240, 700],
      { c: 'brown', path: [[253, 180], [247, 210], [251, 238]], d: 14 },
      { c: 'brown', path: [[260, 299], [232, 360], [219, 427], [223, 505]], d: 14 },
      { c: 'brown', path: [[264, 590], [264, 631], [290, 680]], d: 14 }] },
    { title: 'Add the top branch', find: [
      { c: 'brown', path: [[257, 237], [288, 216], [357, 182], [410, 155], [590, 130]], d: 14 },
      { c: 'brown', path: [[590, 130], [663, 122], [734, 126], [774, 125], [870, 126], [890, 150], [860, 160], [792, 164], [740, 164], [670, 164], [607, 164], [582, 166]], d: 10 },
      { c: 'brown', path: [[582, 166], [381, 209], [260, 299]], d: 14 }] },
    { title: 'Add the bottom branch', find: [['brown', 270, 520, 900, 580],
      { c: 'brown', path: [[223, 514], [285, 535], [345, 536]], d: 14 },
      { c: 'brown', path: [[301, 569], [264, 586]], d: 14 }] },
    { title: 'Draw the leaves at the top', find: [['green', 80, 45, 420, 225]] },
    { title: 'Add the vines', find: [['green', 330, 185, 560, 325], ['green', 480, 560, 785, 690]] },
    { title: 'Draw the sitting monkey', find: [['brown', 240, 320, 505, 555]] },
    { title: 'Draw the swinging monkey', find: [['brown', 575, 95, 805, 445]] },
    { title: 'Add the banana', find: [['gold', ...ALL]] },
    { title: 'Add the monkeys’ faces', find: [['black', ...ALL]] },
    { title: 'Add the leafy bush', find: [['green', ...ALL]] }
  ]
};
