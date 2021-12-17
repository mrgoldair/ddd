let { add, scale, mult, mult2, traverse } = require('../out/Matrix.js')

describe('Vectors', () => {
  it('The sum of two vectors should equal the sum of their components', () => {
    let a = [ 1,0,0 ];
    let b = [ 0,1,0 ];

    expect(add(a,b)).toEqual([1,1,0]);
  })

  it('A scaled vector should be equal each component weighted by some constant', () => {
    expect(scale(2, [ 1,2,3 ])).toEqual([2,4,6])
  })
})

describe('Matrix & Vectors', () => {
  it('A 2-component vector multiplied with a 2x2 matrix yields a vector of length 2', () => {
    let m = [
      [ 1,0 ],
      [ 2,1 ]
    ];

    let v = [ 1, 2 ];

    expect(mult(m,v).length).toEqual(2);
  })

  it('A 2-component vector multiplied with a 2x2 matrice yields a 2-component vector', () => {
    let m = [
      [ 1, 2 ],
      [ 3, 4 ]
    ]

    let v = [ 1, 2 ];

    expect(mult(m,v)).toEqual([ 7, 10 ])
  })

  it('A 3-component vector multiplied with a 3x3 matrix yields vector of length 3', () => {
    let m = [
      [ 1, 0, 0 ],
      [ 2, 1, 0 ],
      [ 0, 1, 1 ]
    ];

    let v = [ 1, 2, 1 ];

    expect(mult(m,v).length).toEqual(3);
  })

  it('A 3-component vector multiplied with a 3x3 matrice yields a 3-component vector', () => {
    let m = [
      [ 1, 2, 2 ],
      [ 3, 4, 6 ],
      [ 0, 1, 0 ]
    ]

    let v = [ 1, 2, 9 ];

    expect(mult(m,v)).toEqual([ 7, 19, 14 ])
  })

  it('Multiplying two matrices yields a new matrix', () => {
    let m = [
      [ 1, 0, 0 ],
      [ 0, 1, 0 ],
      [ 0, 0, 1 ]
    ];

    let n = [
      [ 1, 0, 0 ],
      [ 0, 1, 0 ],
      [ 0, 0, 1 ]
    ];

    expect(mult2(m,n)).toEqual(m);
  })

})

describe('Traverse', () => {
  it('Gathers the nth element of two same-sized arrays into a array of tuples', () => {
    let m = [
      [ 1,2,3 ],
      [ 4,5,6 ],
      [ 7,8,9 ]
    ];

    let v = [ 1, 2, 3 ];

    expect(traverse(m,v)).toEqual([
      [[1,2,3], 1],
      [[4,5,6], 2],
      [[7,8,9], 3]
    ])
  })
})