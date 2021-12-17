/**
 * Matrix utility library for easier creation and calculation of matrices and Vecs
 */

// x,y
type Vec2 = [ number, number ];
// x,y,z
type Vec3 = [ number, number, number ];
// x,y,z,w
type Vec4 = [ number, number, number, number ];
// General type that represents the vector dimensions we're interested in
type Vec = Vec2 | Vec3 | Vec4;

type Mat<V extends Vec> =
{
  [ B in keyof V ]: V
}

/**
 * Scale vector `v` by integer `n`
 * @param n - a number to scale each component of
 * @param v - a vector of 2,3 or 4 components
 * @returns - vector of 2,3 or 4 components
 */
function scale(n:number, v:Vec2):Vec2;
function scale(n:number, v:Vec3):Vec3;
function scale(n:number, v:Vec4):Vec4;
function scale(n:number, v:Vec):Vec {
  return v.map(c => c * n) as Vec
}

/**
 * Component-wise addition of two vectors `a` and `b`
 * @param a - vector of 2,3 or 4 components to add
 * @param b - vector of 2,3 or 4 components to add
 * @returns - vector of 2,3 or 4 components
 */
function add(a:Vec2, b:Vec2):Vec2;
function add(a:Vec3, b:Vec3):Vec3;
function add(a:Vec4, b:Vec4):Vec4;
function add(a:Vec, b:Vec):Vec {
  return a.map((c,i) => c + b[i]) as Vec
}

/**
 * Groups components of `vector` with their corresponding basis
 * from `matrix`. The matrix dimension must must match the length
 * of the vector e.g. a 2x2 matrix must be paired with a vector of 2.
 * 
 * Used by `mult` in its expression of matrix multiplication. Instead
 * of multiplying each vector component with its basis component across the
 * basis vectors and then summing (ala regular matrix multiplication), we tease
 * apart these two operations – we first scale each matrix basis by its matching
 * vector component (this function assembles those tuples, but doesn't perform
 * the multiply), then we sum those resulting vectors.
 * @param a 
 * @param b 
 * @returns - An array of tuples, matching each component of the 
 * input vector `vector` with it's basis vector within `matrix`
 */
function traverse(matrix:Mat<Vec2>, vector:Vec2):[Vec2,number][];
function traverse(matrix:Mat<Vec3>, vector:Vec3):[Vec3,number][];
function traverse(matrix:Mat<Vec4>, vector:Vec4):[Vec4,number][];
function traverse(matrix:any, vector:any):[any,any][] {
  if (matrix.length != vector.length)
    throw new Error("a and b must be the same length");
  // 
  let r:[ Vec, number ][] = [];
  //
  for (let index = 0; index < matrix.length; index++) {
    r.push([ matrix[index], vector[index] ])
  }
  return r;
}

/**
 * Multiply `vector` by `matrix`
 * @param matrix 
 * @param v 
 */
function mult(matrix:Mat<Vec2>, vec:Vec2):Vec2;
function mult(matrix:Mat<Vec3>, vec:Vec3):Vec3;
function mult(matrix:Mat<Vec4>, vec:Vec4):Vec4;
function mult(matrix:any, vec:any):any {
  // Traverse assembles our tuples that are the basis of our scale
  return traverse(matrix,vec)
          // Perform the scale
          .map(([ vec,n ]) => scale(n,vec))
          // Sum our scaled basis vectors
          .reduce(( acc,curr ) => add(acc,curr))
}

/**
 * 
 * @param m 
 * @param n 
 */
function mult2(m:Mat<Vec2>, n:Mat<Vec2>):Mat<Vec2>;
function mult2(m:Mat<Vec3>, n:Mat<Vec3>):Mat<Vec3>;
function mult2(m:Mat<Vec4>, n:Mat<Vec4>):Mat<Vec4>;
function mult2(m:any, n:any):any {
  //
  return n.map((b:any) => mult(m,b))
}

export {
  add,
  scale,
  mult,
  mult2,
  traverse
}