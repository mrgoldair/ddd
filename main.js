/**
 * Tatooine
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

let modelViewMatrix = m.identity(); //glMatrix.mat4.create();

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
    -10.0,  10.0,
     10.0,  10.0,
    -10.0, -10.0,
     10.0, -10.0
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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear everything
  gl.clearDepth(1.0);
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscur far things
  gl.depthFunc(gl.LEQUAL);
  // Clear the buffer with the specified colour;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const zNear  =   0.1;
  const zFar   = 100.0;
  const left   = -50;
  const right  =  50;
  const top    =  50;
  const bottom = -50;

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
  let perspective = (l, r, t, b, n, f) => {
    return new Float32Array([
      (2 * n) / (r - l), 0.0, 0.0, 0.0,
      0.0, (2 * n) / (t - b), 0.0, 0.0,
      (r + l) / (r - l), (t + b) / (t - b), -(f + n) / (f - n), -1.0,
      0.0, 0.0, -(2 * f * n) / (f - n), 0.0
    ]);
  }

  let pMatrix = perspective(left, right, top, bottom, zNear, zFar);

  glMatrix.mat4.translate(modelViewMatrix,  // destination matrix
                          modelViewMatrix,  // matrix to translate
                          [0.0, 0.0, -0.2]) // amount to translate

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
      2,          // Components per vertex :: Number - here's it's two becase our model data only specified x and y
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
    const vertexCount = 4; // 8 pieces of data in our buffer; 2 per vertex, hence 4
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
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
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ -1, 0, 0 ])
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
  window.onkeyup = updateModelViewMatrix(gl, program);

  function loop(){
    let frameId = requestAnimationFrame(loop);

    {
      // Clear the buffer with the specified colour;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const offset = 0;
      const vertexCount = 4; // 8 pieces of data in our buffer; 2 per vertex, hence 4
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

  // Begin the loop
  loop();
}

// Run main on the 'load' event
window.onload = main;

/* 
  keys({
    up:(m) => m
    down:(m) => m
  })
*/
// (ku,m) => m . m => ()
// (kd,m) => m