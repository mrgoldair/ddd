/**
 * Matrix functions
 */

/**
 * basis vectors in row-major order
 */
export const identity = 
  ([x,y,z]=[0,0,0]) => [
    1, 0, 0, 0, // x
    0, 1, 0, 0, // y
    0, 0, 1, 0, // z
    x, y, z, 1  // w
  ];

export const normalise =
  ([x, y, z]) => {
    let magnitude = Math.sqrt(x*x + y*z + z*z)
    return [ x/magnitude, y/magnitude, z/magnitude ]
  }

export const add =
  ([ ax, ay, az], [ bx, by, bz ]) =>
    [ ax+bx, ay+by, az+bz ]

export const scale =
  (n, [x,y,z]) =>
    [ n*x, n*y, n*z, 1 ]

/**
 * Multiply two 4x4 matrices
 * @param {*} m 
 * @param {*} n 
 */
export const mult4 = (a,b) => {
  let m = Array.from(a);
  let n = Array.from(b);
  // Row-major matrices
  let x = [
    (m[0] * n[0] + m[1] * n[4] + m[2] *  n[8] + m[3] * n[12]),
    (m[0] * n[1] + m[1] * n[5] + m[2] *  n[9] + m[3] * n[13]),
    (m[0] * n[2] + m[1] * n[6] + m[2] * n[10] + m[3] * n[14]),
    (m[0] * n[3] + m[1] * n[7] + m[2] * n[11] + m[3] * n[15])
  ];

  let y = [
    (m[4] * n[0] + m[5] * n[4] + m[6] *   n[8] + m[7] * n[12]),
    (m[4] * n[1] + m[5] * n[5] + m[6] *   n[9] + m[7] * n[13]),
    (m[4] * n[2] + m[5] * n[6] + m[6] *  n[10] + m[7] * n[14]),
    (m[4] * n[3] + m[5] * n[7] + m[6] *  n[11] + m[7] * n[15])
  ];

  let z = [
    (m[8] * n[0] + m[9] * n[4] + m[10] *  n[8] + m[11] * n[12]),
    (m[8] * n[1] + m[9] * n[5] + m[10] *  n[9] + m[11] * n[13]),
    (m[8] * n[2] + m[9] * n[6] + m[10] * n[10] + m[11] * n[14]),
    (m[8] * n[3] + m[9] * n[7] + m[10] * n[11] + m[12] * n[15]) 
  ];

  let w = [
    (m[12] * n[0] + m[13] * n[4] + m[14] *  n[8] + m[15] * n[12]),
    (m[12] * n[1] + m[13] * n[5] + m[14] *  n[9] + m[15] * n[13]),
    (m[12] * n[2] + m[13] * n[6] + m[14] * n[10] + m[15] * n[14]),
    (m[12] * n[3] + m[13] * n[7] + m[14] * n[11] + m[15] * n[15])
  ]

  return [
    ...x, ...y, ...z, ...w
  ];
}

/**
 * Return matrix with `w` basis augmented by vector `v`
 * @param {*} matrix 
 * @param {*} v 
 * @returns 
 */
export const translate = (v, matrix) => {
  // Copy
  let m = Array.of(...matrix);
  // Update
  m[12] += v[0];
  m[13] += v[1];
  m[14] += v[2];

  return m;
}

export const rads = degrees => degrees * (Math.PI / 180)

/**
 * Rotate matrix `m` about `z` by angle `theta`
 * @param {*} matrix 
 * @param {*} ø - angle in radians
 * @returns 
 */
export const rotateZ = (ø) => {
  return [
     Math.cos(ø), Math.sin(ø), 0, 0,
    -Math.sin(ø), Math.cos(ø), 0, 0,
                   0,       0, 1, 0,
                   0,       0, 0, 1
  ];
}

export const rotateX = (theta) => {
  return [
    1,                0,               0, 0,
    0,  Math.cos(theta), Math.sin(theta), 0,
    0, -Math.sin(theta), Math.cos(theta), 0,
    0,                0,               0, 1
  ];
}

/**
 * Return an identity matrix rotated by `theta`
 * @param {*} theta - the angle (in radians) to rotate by
 * @returns 
 */
export const rotateY = (theta) => {
  return [
    Math.cos(theta), 0, -Math.sin(theta), 0,
                  0, 1,                0, 0,
    Math.sin(theta), 0,  Math.cos(theta), 0,
                  0, 0,                0, 1
  ];
};

export function perspective(fov, aspect, near, far) {
  let f = 1.0 / Math.tan(fov * 0.5);

  return new Float32Array([
  //i         j                              k   w
    f/aspect, 0,                             0,  0,
    0       , f,                             0,  0,
    0       , 0,     (near + far)/(near - far), -1,
    0       , 0, (2 * far * near)/(near - far),  0
  ]);
}