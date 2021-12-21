/**
 * Tatooine – Heavily commented
 */

import * as m from './matrix.js';

const vsSource = `
  attribute vec4 aVertexPosition;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

const fsSource = `
  void main() {
    gl_FragColor = vec4(0.76, 0.2, 0.33, 1.0);
  }
`;

//
let modelViewMatrix = m.identity;

let state = {

}

/**
 * 
 * @returns Entry point / composition root
 */
function main() {

  let canvas = document.querySelector("#glCanvas");

  let gl = canvas.getContext("webgl");

  // Only continue if we can get a WebGL2 context
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }

  // Our compiled shader
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Combined info that will provide locations from our compiled shader
  // We need a compiled shader program in order to look up attribute and uniform positions
  let programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
    },
    matrices: {
      view: null
    }
  }

  // Create and add vertex data buffer
  let buffers = initBuffers(gl);

  // Setup matrices
  // Initial draw
  setup(gl, programInfo, buffers);

  // Start app loop
  start(gl, programInfo);
}

/**
 * 
 * @param {*} gl - The WebGL context
 * @param {*} vsSource Textual source of vertex shader
 * @param {*} fsSource Textual source of frament shader
 * @returns void
 * 
 * Compiles shaders and attaches them to a shader program
 */
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  let shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ', + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

/**
 * 
 * @param {*} gl - The WebGL context
 * @param {*} type - gl.FRAGMENT_SHADER / gl.VERTEX_SHADER
 * @param {*} source - Textual source of shader
 * @returns - Compiled WebGL shader
 */
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occured compiling the shader: ' + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

/**
 * Hard-coded plane.
 * Loading mesh data should take an array of numbers
 * representing our vertices (x,y,z) and load them
 * into buffers dynamically
 * @param {*} gl - WebGL Context
 * @returns - Object containing buffer objects
 */
function initBuffers(gl, vertices = null) {

  /*
  *  bufferData(a,d)    bindBuffer(a,b)
  *      \|/                 \|/
  *       |                   |
  *     --|-------------------|--
  *    |  -›  ARRAY_BUFFER   ›-  |
  *    |           |             |
  *    |          /|\            |
  *    | (bindBuffer,bufferData) |
  *     -------------------------
  */

  // Create our gl buffer to fill with model vertices
  const positionBuffer = gl.createBuffer();

  /* WebGL lets us manipulate many WebGL resources on global bind points - here gl.ARRAY_BUFFER.
     You can think of bind points as internal global variables inside WebGL.
     First you bind a resource to a bind point. Then, subsequent functions
     refer to the resource through the bind point.

     Here we bind the `positionBuffer` to ARRAY_BUFFER bind point
  */
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Values we'll use as our attribute values
  const positions = [
    //front
    -50,  50, -50,
     50,  50, -50,
    -50, -50, -50,
    -50, -50, -50,
     50,  50, -50,
     50, -50, -50,
    // left
    -50, -50, -50,
    -50,  50, -50,
    -50,  50,  50,
    -50,  50,  50,
    -50, -50,  50,
    -50, -50, -50,
    // right
     50, -50, -50,
     50,  50, -50,
     50,  50,  50,
     50,  50,  50,
     50, -50,  50,
     50, -50, -50,
    // // right
    //  10.0, -10.0, -10.0,
    //  10.0,  10.0, -10.0,
    //  10.0,  10.0,  10.0,
    //  10.0, -10.0,  10.0,
    // // top
    // -10.0,  10.0,  10.0,
    // -10.0,  10.0, -10.0,
    //  10.0,  10.0, -10.0,
    //  10.0,  10.0,  10.0,
    // // bottom
    // -10.0, -10.0,  10.0,
    // -10.0, -10.0, -10.0,
    //  10.0, -10.0, -10.0,
    //  10.0, -10.0,  10.0
  ];

  // Notice we buffer data via our bind point (ARRAY_BUFFER) not the `positionBuffer` directly
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer
  };
}

/**
 * Static setup and initial draw - details that don't change after creation
 * or at the arrival of events
 * @param {*} gl 
 * @param {*} programInfo 
 * @param {*} buffers 
 */
function setup(gl, programInfo, buffers) {

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
  glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ -0, 0, -155.0 ]);
  // state.position = m.translate( [ 0, 0, -155.0 ], state.position )

  // How we setup our attributes and uniforms
  // Tell WebGL how to pull the data from our buffer
  {

    // Like `initBuffer` we're wanting to affect our position buffer so we bind to gl.ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

    /**
     * `vertexAttribPointer` implicitly binds to ARRAY_BUFFER
     * 
     * "A hidden part of gl.vertexAttribPointer is that it binds the current ARRAY_BUFFER to the attribute.
     * In other words now this attribute is bound to positionBuffer. That means we're free to bind something
     *  else to the ARRAY_BUFFER bind point. The attribute will continue to use positionBuffer."
     */
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      3,          // Components per vertex :: Number - here's it's two becase our model data only specified x and y
      gl.FLOAT,   // Type – The type of values we're expecting - we converted our position values to Float32
      false,      // Normalize :: Boolean - Don't convert to the range 0 -> 1
      0,          // Stride :: Number – 0 = move forward component-per-vert * sizeof(type)
      0           // Offset :: Number – Where to start taking values in the buffer - 0 is the start, no offset
    );

    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition
    );
  }

  gl.useProgram(programInfo.program);

  // Using uniform locations from the compiled program, set our matrices
  // These will be combined within the vertex shader
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    pMatrix
  );

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    const offset = 0;
    const vertexCount = 18; // 8 pieces of data in our buffer; 2 per vertex, hence 4
    gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
  }
}

/**
 * Effecting program through key events
 * @param {*} gl - WebGL context
 * @param {*} programInfo - Compiled shader details
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

function start(gl, program) {

  // key->vector . (mult m) v . set(program, ["matrices", "viewModel"])
  // compose( key)
  // Calculate matrix when a direction key is pressed
  // Being an event handler, this is a sink. We stop processing at the end; we 
  // use the event notification to time side-effects.
  window.onkeyup = updateModelViewMatrix(gl, program);

  let rotate = 0;
  window.onmousemove = function({ movementX, screenX, screenY }) {
    rotate = (screenX * ((2 * Math.PI) / 800))
    let rm = m.rotateX(rotate)
    let mm = m.mult4(rm, modelViewMatrix);

    gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix, false, mm);
  }

  function loop(){
    let frameId = requestAnimationFrame(loop);

    {
      // Clear the buffer with the specified colour;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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