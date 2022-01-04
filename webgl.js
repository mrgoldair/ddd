
/**
 * 
 * @param {*} gl - The WebGL context
 * @param {*} vsSource Textual source of vertex shader
 * @param {*} fsSource Textual source of frament shader
 * @returns void
 * 
 * Compiles shaders and attaches them to a shader program
 */
 function compile(gl, vsSource, fsSource) {
  const vertexShader = shader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = shader(gl, gl.FRAGMENT_SHADER, fsSource);

  let program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.bindAttribLocation(program, 0, 'a_position');

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ', + gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

/**
 * 
 * @param {*} gl - The WebGL context
 * @param {*} type - gl.FRAGMENT_SHADER / gl.VERTEX_SHADER
 * @param {*} source - Textual source of shader
 * @returns - Compiled WebGL shader
 */
function shader(gl, type, source) {
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
 * Loading mesh data should take an array of numbers
 * representing our vertices (x,y,z) and load them
 * into buffers dynamically
 * @param {*} gl - WebGL Context
 * @returns - Object containing buffer objects
 */
 function buffer(gl, data = null) {

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
  const buffer = gl.createBuffer();

  /* WebGL lets us manipulate many WebGL resources on global bind points - here gl.ARRAY_BUFFER.
     You can think of bind points as internal global variables inside WebGL.
     First you bind a resource to a bind point. Then, subsequent functions
     refer to the resource through the bind point.

     Here we bind the `positionBuffer` to ARRAY_BUFFER bind point
  */
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // Notice we buffer data via our bind point (ARRAY_BUFFER) not the `positionBuffer` directly
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  return buffer;
}

export {
  compile,
  buffer
}