import { identity, mul4 } from '../matrix.js';

it('Multiplying matrix `m` with identity yields `m`', () => {

  let m = [
    1,0,0,0,
    0,2,0,0,
    0,0,3,0,
    0,0,0,4
  ];

  let i = identity();

  expect(mul4(m,i)).toEqual(m);
});