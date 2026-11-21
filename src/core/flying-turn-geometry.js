export const turnGeometry = {
  "frameSize": [
    512,
    512
  ],
  "viewNaming": "left/right describe the screen direction of the face",
  "timingsMs": {
    "first45": 80,
    "front": 100,
    "second45": 80
  },
  "sequences": {
    "leftToRight": [
      "existing-left-flight",
      "45-left",
      "front",
      "45-right",
      "existing-right-flight"
    ],
    "rightToLeft": [
      "existing-right-flight",
      "45-right",
      "front",
      "45-left",
      "existing-left-flight"
    ]
  },
  "insects": {
    "butterfly": {
      "existingLeftPivotApprox": [
        222,
        323
      ],
      "existingRightPivotApprox": [
        290,
        323
      ],
      "poses": {
        "45-left": {
          "file": "assets/butterfly-turn-45-left.png",
          "pivot": [
            256,
            320
          ],
          "sourcePivot": [
            540,
            824
          ],
          "exportScale": 0.34,
          "exportTranslation": [
            72,
            40
          ]
        },
        "front": {
          "file": "assets/butterfly-turn-front.png",
          "pivot": [
            256,
            320
          ],
          "preservedFromV1": true
        },
        "45-right": {
          "file": "assets/butterfly-turn-45-right.png",
          "pivot": [
            256,
            320
          ],
          "sourcePivot": [
            714,
            824
          ],
          "exportScale": 0.34,
          "exportTranslation": [
            13,
            40
          ]
        }
      }
    },
    "ladybug": {
      "existingLeftPivotApprox": [
        260,
        322
      ],
      "existingRightPivotApprox": [
        252,
        322
      ],
      "poses": {
        "45-left": {
          "file": "assets/ladybug-turn-45-left.png",
          "pivot": [
            256,
            320
          ],
          "sourcePivot": [
            630,
            747
          ],
          "exportScale": 0.3,
          "exportTranslation": [
            67,
            96
          ]
        },
        "front": {
          "file": "assets/ladybug-turn-front.png",
          "pivot": [
            256,
            320
          ],
          "preservedFromV1": true
        },
        "45-right": {
          "file": "assets/ladybug-turn-45-right.png",
          "pivot": [
            256,
            320
          ],
          "sourcePivot": [
            650,
            747
          ],
          "exportScale": 0.3,
          "exportTranslation": [
            61,
            96
          ]
        }
      }
    },
    // Codex's painted fliers (18 November 2026). Measured by Claude on the delivered 512 frames: each point
    // sits a fixed distance under the thorax, so the body stays put through the turn, and the side views
    // keep y 320 so the bugs still perch where they did.
    "bee": {
      "existingLeftPivotApprox": [262, 320],
      "existingRightPivotApprox": [250, 320],
      "poses": {
        "45-left": { "file": "assets/painted/landing/bee-turn-45-left.webp", "pivot": [244, 333] },
        "front": { "file": "assets/painted/landing/bee-turn-front.webp", "pivot": [256, 310] },
        "45-right": { "file": "assets/painted/landing/bee-turn-45-right.webp", "pivot": [237, 338] }
      }
    },
    "dragonfly": {
      "existingLeftPivotApprox": [150, 320],
      "existingRightPivotApprox": [362, 320],
      "poses": {
        "45-left": { "file": "assets/painted/landing/dragonfly-turn-45-left.webp", "pivot": [228, 328] },
        "front": { "file": "assets/painted/landing/dragonfly-turn-front.webp", "pivot": [256, 227] },
        "45-right": { "file": "assets/painted/landing/dragonfly-turn-45-right.webp", "pivot": [273, 331] }
      }
    }
  },
  "alignmentNote": "Keep the chosen local body pivot at one world coordinate. Pivots are visual estimates; verify at the production display size. Use imageLeft = worldPivotX - localPivotX * displayScale and the equivalent formula for top."
};
