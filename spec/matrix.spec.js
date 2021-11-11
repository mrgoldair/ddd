import { identity, mult4 } from '../matrix.js';

describe('multiply', () => {

  it('a matrix `m` with an identity matrix yields `m`', () => {

    let m = [
      1,0,0,0,
      0,2,0,0,
      0,0,3,0,
      0,0,0,4
    ];

    expect(mult4(m,identity)).toEqual(m);
  });

  it('the sum of component-wise products of each basis in n with each basis in m', () => {

    let m = [
      1,0,0,0,
      0,2,0,0,
      0,0,3,0,
      0,0,0,4
    ];

    let n = [
      4,0,0,0,
      0,3,0,0,
      0,0,1,0,
      0,0,0,1
    ];

    let mn = [
      4,0,0,0,
      0,6,0,0,
      0,0,3,0,
      0,0,0,4
    ];

    expect(mult4(m,n)).toEqual(mn)

  })
  
})