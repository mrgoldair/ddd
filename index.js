/**
 * Tatooine
 */

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

let modelViewMatrix = glMatrix.mat4.create();

function main() {

  let canvas = document.querySelector("#glCanvas");

  let gl = canvas.getContext("webgl");

  // Only continue if we can get a WebGL2 context
  if (gl === null){
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
    }
  }

  // Create and add vertex data buffer
  let buffers = initBuffers(gl);

  // Setup matrices and draw the scene
  setup(gl, programInfo, buffers);

  window.onkeyup = draw(gl, programInfo);
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
function loadShader(gl, type, source){
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
 * 
 * @param {*} gl - WebGL Context
 * @returns - Object containing buffer objects
 */
function initBuffers(gl){
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -10.0,  10.0,
     10.0,  10.0,
    -10.0, -10.0,
     10.0, -10.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);

  return {
    position: positionBuffer
  };
}

/**
 * Static setup - details that don't change after creation
 * or at the arrival of events
 * @param {*} gl 
 * @param {*} programInfo 
 * @param {*} buffers 
 */
function setup(gl, programInfo, buffers){

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

  const zNear = 0.1;
  const zFar = 100.0;
  const left = -50;
  const right = 50;
  const top = 50;
  const bottom = -50;

  let perspective = (l,r,t,b,n,f) => {
    return new Float32Array([
      (2*n)/(r-l),         0.0,            0.0,  0.0,
              0.0, (2*n)/(t-b),            0.0,  0.0,
      (r+l)/(r-l), (t+b)/(t-b),   -(f+n)/(f-n), -1.0,
              0.0,         0.0, -(2*f*n)/(f-n),  0.0
    ]);
  }

  let pMatrix = perspective(left, right, top, bottom, zNear, zFar);

  glMatrix.mat4.translate(modelViewMatrix,    // destination matrix
                          modelViewMatrix,    // matrix to translate
                          [ 0.0, 0.0, -0.2 ]) // amount to translate

  // How we setup our attributes and uniforms
  // Tell WebGL how to pull the data from our buffer
  {
    // Constitutes one iteration of the vertex shader.
    // Two components; one for each of 'x' and 'y'. The
    // remainder of the vec4 are automatically filled with 0s
    const numComponents = 2;
    // Help to specify how many bits to take; the boundary of our floats
    const type = gl.FLOAT;
    // Don't convert to the range 0 -> 1
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition
    );
  }

  gl.useProgram(programInfo.program);

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
 * draw :: (GL, ProgramInfo) => Event => Void
 * Dynamic draw - handle events that recompute WebGL state
 * @param {*} gl - WebGL context
 * @param {*} programInfo - Compiled shader details
 */
const draw = (gl, programInfo) => e => {

  switch (e.keyCode){
    case 37:
      console.log("left");
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ -1.0, 0.0, 0.0 ])
      break;
    case 38:
      console.log("up")
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ 0.0, 0.0, -0.05 ])
      break;
    case 39:
      console.log("right")
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ 1.0, 0.0, 0.0 ])
      break;
    case 40:
      console.log("down")
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [ 0.0, 0.0, 0.05 ])
      break;
    default:
      console.log("other");
  }
  
  // Set our updated matrix
  gl.uniformMatrix4fv( programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
  
  // Clear the buffer with the specified colour;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  {
    const offset = 0;
    const vertexCount = 4; // 8 pieces of data in our buffer; 2 per vertex, hence 4
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

// Run main on the 'load' event
window.onload = main;
