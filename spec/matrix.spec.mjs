import { identity, mult4, rads, rotateY, rotateX } from '../matrix.js';

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

describe('rotate around x', () => {
  it('should leave x unchanged', () => {

    let rotated = rotateX(rads(90));

    expect(rotated[0]).toEqual(1)
    expect(rotated[1]).toEqual(0)
    expect(rotated[2]).toEqual(0)
    expect(rotated[3]).toEqual(0)
  })

  it('should rotate `y` and `z`', () => {

    let rotated = rotateX(rads(90));
    // y -> z
    expect(rotated[4]).toEqual(0)
    expect(Number(rotated[5].toFixed(1))).toEqual(0)
    expect(Number(rotated[6].toFixed(1))).toEqual(1)
    expect(rotated[7]).toEqual(0)
    // z -> -y
    expect(rotated[8]).toEqual(0)
    expect(Number(rotated[9].toFixed(1))).toEqual(-1)
    expect(Number(rotated[10].toFixed(1))).toEqual(0)
    expect(rotated[11]).toEqual(0)
  })
})

describe('rotate around y', () => {
  it('should leave y unchanged', () => {

    let rotated = rotateY(rads(-90));

    // expect(rotated.y).toEqual([0,1,0,0])
    expect(rotated[4]).toEqual(0)
    expect(rotated[5]).toEqual(1)
    expect(rotated[6]).toEqual(0)
    expect(rotated[7]).toEqual(0)
  })

  it('should rotate `x` and `z`', () => {

    let rotated = rotateY(rads(-90));

    expect(Number(rotated[0].toFixed(1))).toEqual(0)
    expect(rotated[1]).toEqual(0)
    expect(rotated[2]).toEqual(-1)
    expect(rotated[3]).toEqual(0)

    expect(rotated[8]).toEqual(1)
    expect(Number(rotated[9].toFixed(1))).toEqual(0)
    expect(Number(rotated[10].toFixed(1))).toEqual(0)
    expect(rotated[11]).toEqual(0)
  })
})
