/**
 * Tatooine – Heavily commented
 */
import { compile, buffer } from './webgl.js';
import cube from './mesh/cube.js';
import * as m from './matrix.js';

const vsSource = `#version 300 es

  in vec4 a_position;

  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_projection;

  void main() {
    gl_Position = u_projection * u_view * u_model * a_position;
  }
`;

const fsSource = `#version 300 es
  precision mediump float;

  out vec4 colour;

  void main() {
    colour = vec4(0.76, 0.2, 0.33, 1.0);
  }
`;

// let state = {
//   // User space
//   app: {
//     position: [ 0, 0, -155 ],
//     matrices: {
//       view: null
//     },
//     vao: null,
//     mesh: {
//       // imported from meshes/cube
//       cube
//     },
//   },
//   // WebGL space
//   gl: {
//     shader,
//     attribLocations: {
//       position: 0,
//       normal: 1
//     },
//     uniformLocations: {
//       projectionMatrix: gl.getUniformLocation(shader, 'uProjectionMatrix'),
//       modelViewMatrix: gl.getUniformLocation(shader, 'uModelViewMatrix')
//     },
//   }
// }

/**
 * Entry point / composition root
 */
function main() {
  // Get our WebGL context from the browser or alert
  let canvas = document.querySelector("#glCanvas");
  let gl = canvas.getContext("webgl2");

  // Only continue if we can get a WebGL2 context
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }

  // Our compiled shader
  const shader = compile(gl, vsSource, fsSource);

  // Combined info that will provide locations from our compiled shader
  // We need a compiled shader program in order to look up attribute and uniform positions
  let program = {
    // User space
    state: {
      position: [ 0, 0, -155 ],
      matrices: {
        view: m.identity
      },
      vao: null
    },
    meshes: {
      cube
    },
    // WebGL space
    shader,
    attribLocations: {
      position: 0,
      normal: 1
    },
    uniformLocations: {
      model: gl.getUniformLocation(shader, 'u_model'),
      view: gl.getUniformLocation(shader, 'u_view'),
      projection: gl.getUniformLocation(shader, 'u_projection')
    },
  }

  // Setup matrices, uniforms, mesh vaos
  setup(gl, program);

  // Start app loop
  run(gl, program);
}

/**
 * Static setup - details that don't change per render
 * e.g. uniforms, vao
 * @param {*} gl
 * @param {*} program 
 */
function setup(gl, program) {
  
  let { state: { matrices } } = program

  // Set the clear color to black, fully opaque
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  // Clear everything
  gl.clearDepth(1.0);
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscur far things
  gl.depthFunc(gl.LEQUAL);
  // Clear the buffer with the specified colour;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Because z
  const zNear  =   50;
  const zFar   = 1000;
  const left   = -100;
  const right  =  100;
  const top    =  100;
  const bottom = -100;

  /**
   * Create a perspective frustum from a description of edges
   * - The resulting matrix is in row-order
   * - Maybe in a `Matrix` module
   * @param {*} l - left
   * @param {*} r - right
   * @param {*} t - top
   * @param {*} b - bottom
   * @param {*} n - near
   * @param {*} f - far
   * @returns 
   */
  let perspective =
    (l, r, t, b, n, f) => {
      return new Float32Array([
        (2 * n) / (r - l),               0.0,                    0.0,  0.0,
                      0.0, (2 * n) / (t - b),                    0.0,  0.0,
                      0.0,               0.0,     -(f + n) / (f - n), -1.0,
        (r + l) / (r - l), (t + b) / (t - b), -(2 * f * n) / (f - n),  1.0
      ]);
    }

  // Setup our persepective projection matrix
  let pMatrix = perspective(left, right, top, bottom, zNear, zFar);

  /**
   * `modelViewMatrix` is comprised (logically) of a model and view matrix.
   * The model matrix moves a mesh with respect to it's own local coord system.
   * The view will be used to position the camera and effectively move everything
   * within the frame – view matrix is the inverse of a camera matrix. Here they're
   * collapsed into one becuase we don't have any separate model matrix. The matrix
   * is positioned at this negative value so that it's not sitting atop (and obscured by)
   * the near clipping plane.
   */
  //glMatrix.mat4.translate(matrices.view, matrices.view, [ 0, 0, -155.0 ]);
  matrices.view = m.translate( [ 0, 0, -155.0, 1 ], matrices.view )

  // Create our mesh vaos - Vertex Array Object
  // Each key of named meshes e.g. 'cube'
  for (const mesh in program.meshes) {
    // Create the VAO to hold our attributes
    let vao = gl.createVertexArray()
    // Bind before any GL functions
    gl.bindVertexArray(vao)
    // Iterate each attr type within our mesh e.g. position or normal
    for (const attr in program.meshes[mesh]) {
      // Grab our mesh attribute and create a data buffer
      let buff = buffer(gl,program.meshes[mesh][attr])
      // Bind that buffer for later retrieval
      gl.bindBuffer(gl.ARRAY_BUFFER, buff);
      // Link the attribute to the previous buffer; the plugs are connected - gl.ARRAY_BUFFER is now free
      gl.vertexAttribPointer(
        program.attribLocations[attr],
        3,          // Components per vertex :: Number
        gl.FLOAT,   // Type – The type of values we're expecting - we converted our position values to Float32
        false,      // Normalize :: Boolean - Don't convert to the range 0 -> 1
        0,          // Stride :: Number – 0 = move forward component-per-vert * sizeof(type)
        0           // Offset :: Number – Where to start taking values in the buffer - 0 is the start, no offset
      );

      // Enable it so we can pull values
      gl.enableVertexAttribArray(
        program.attribLocations.vertexPosition
      );
      
      // Save this VAO back into our state for later access
      program.state.vao = vao;

      // Unbind so to prevent bad state
      gl.bindVertexArray(null);
    }
  }

  gl.useProgram(program.shader);

  // Using uniform locations from the compiled program, set our matrices
  // These will be combined within the vertex shader
  gl.uniformMatrix4fv(
    program.uniformLocations.model,
    false,
    m.identity
  );

  gl.uniformMatrix4fv(
    program.uniformLocations.view,
    false,
    matrices.view
  );

  gl.uniformMatrix4fv(
    program.uniformLocations.projection,
    false,
    pMatrix
  );

}

/**
 * Effecting program through key events
 * @param {*} gl - WebGL context
 * @param {*} program - Compiled shader details
 */
const updateModelViewMatrix = (gl, programInfo) => e => {

  // Calculate a new matrix
  switch (e.keyCode) {
    case 37:
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ -10, 0, 0 ])
      console.log(modelViewMatrix);
      break;
    case 38:
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ 0, 0.5, 0 ])
      console.log(modelViewMatrix);
      break;
    case 39:
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ 1, 0, 0 ])
      console.log(modelViewMatrix);
      break;
    case 40:
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ 0, -0.5, 0 ])
      console.log(modelViewMatrix);
      break;
    default:
      console.log("other");
  }

  // Set our newly calculated matrix
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
}

/**
 * Run - update details that may changer per render
 * @param {*} gl - The WebGL context
 * @param {*} program - Our program state
 */
function run(gl, program) {

  // key->vector . (mult m) v . set(program, ["matrices", "viewModel"])
  // compose( key)
  // Calculate matrix when a direction key is pressed
  // Being an event handler, this is a sink. We stop processing at the end; we 
  // use the event notification to time side-effects.
  window.onkeyup = function(){

  }

  // let rotate = 0;
  // window.onmousemove = function({ movementX, screenX, screenY }) {
  //   rotate = (screenX * ((2 * Math.PI) / 800))
  //   let rm = m.rotateX(rotate)
  //   let mm = m.mult4(rm, modelViewMatrix);

  //   gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix, false, mm);
  // }

  function loop(){
    // Set aside our frame id in case we need to cancel
    let frameId = requestAnimationFrame(loop);
    // Perform one loop of the render
    {
      // Clear the buffer with the specified colour;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // Select the mesh to render
      gl.bindVertexArray(program.state.vao);
      // 
      const offset = 0;
      const vertexCount = 18; // 8 pieces of data in our buffer; 2 per vertex, hence 4
      gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }
  }

  // Begin the render loop
  loop();
}

// Run `main()` on the `load` event
window.onload = main;