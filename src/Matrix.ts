/**
 * Matrix utility library for easier creation and calculation of matrices and Vecs
 */

// Our types

// x,y
type Vec2 = [ number, number ];
// x,y,z
type Vec3 = [ number, number, number ];
// x,y,z,w
type Vec4 = [ number, number, number, number ];
// 
type Vec = Vec2 | Vec3 | Vec4;

// We don't care about the property name hence the _
type Mat<V extends Vec> =
{
  [ B in keyof V ]: V
}

function scale(n:number, v:Vec2):Vec2;
function scale(n:number, v:Vec3):Vec3;
function scale(n:number, v:Vec4):Vec4;
function scale(n:number, v:Vec):Vec {
  return v.map(c => c * n) as Vec
}

function add(a:Vec2, b:Vec2):Vec2;
function add(a:Vec3, b:Vec3):Vec3;
function add(a:Vec4, b:Vec4):Vec4;
function add(a:Vec, b:Vec):Vec {
  return a.map((c,i) => c + b[i]) as Vec
}

function traverse(a:Mat<Vec2>, b:Vec2):[Vec2,number][];
function traverse(a:Mat<Vec3>, b:Vec3):[Vec3,number][];
function traverse(a:Mat<Vec4>, b:Vec4):[Vec4,number][];
function traverse(a:any, b:any):[any,any][] {
  if (a.length != b.length)
    throw new Error("a and b must be the same length");
  //
  let r:[ Vec, number ][] = [];
  //
  for (let index = 0; index < a.length; index++) {
    r.push([ a[index], b[index] ])
  }
  return r;
}

function mult(m:Mat<Vec2>, v:Vec2):Vec2;
function mult(m:Mat<Vec3>, v:Vec3):Vec3;
function mult(m:Mat<Vec4>, v:Vec4):Vec4;
function mult(m:any, v:any):any {
  return traverse(m,v)
          .map(([v,n]) => scale(n,v))
          .reduce((acc,curr) => add(acc,curr))
}

function mult2(m:Mat<Vec2>, n:Mat<Vec2>):Mat<Vec2>;
function mult2(m:Mat<Vec3>, n:Mat<Vec3>):Mat<Vec3>;
function mult2(m:Mat<Vec4>, n:Mat<Vec4>):Mat<Vec4>;
function mult2(m:any, n:any):any {
  return n.map((b:any) => mult(m,b))
}

export {
  add,
  scale,
  mult,
  traverse
}