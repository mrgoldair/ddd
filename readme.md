# Tatooine

## An experiment in WebGL

##### Screen Space

> ...perform a perspective divide on the points in camera space to compute their coordinates in screen space
>
> – [www.scratchpixel.com](https://www.scratchapixel.com/lessons/3d-basic-rendering/3d-viewing-pinhole-camera/virtual-pinhole-camera-model)



##### World Space

##### Camera Space

##### NDC Space

##### Homogenous Coordinates

Are something to help us deal with affine transformations. An affine transformation is one that preserves parallel relationships – think translation.

> In fact, the typical perspective projection matrix uses the division by the w component to achieve its transformation



##### Vertex shaders

> ...(a vertex shader's) job is to transform vertices making up the 3D objects of your scene from *camera space to clip space*
>
> [– www.scratchapixel.com](https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix)

> <u>Each time a shape is rendered</u>, the vertex shader is run for each vertex in the shape. Its job is to transform the input vertex from its original coordinate system into the <u>clip space</u> coordinate system.
>
> [– MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context)

What determines when a shape is rendered?

- `gl.drawArrays(..)`

What are clip space coordinates?

- Coordinates in the range [-1, 1]



##### Fragment shaders

> The fragment shader is called once for every pixel on each shape to be drawn.

The fragment shader is to deliver a colour for each pixel of the shape by calculating the corresponding <u>texel</u> and applying lighting to result in an overall colour.



##### Varyings

##### Texel



##### Attributes

Provides values for the vertex shader.

Receive values from buffers.

> Each iteration of the vertex shader receives the next value from the buffer assigned to that attribute



##### Uniforms

Stay the same for all iterations of a shader e.g. view model matrix



##### Buffer

##### Creating a program

Using `gl`, create a shader object sending it the source and compile the shader. Do this for each shader.

```javascript
const shader = gl.createShader(type)
gl.shaderSource(shader, source)
gl.compileShader(shader)
```

Using `gl`, create a program, attach the shaders then call `linkProgram()`

```javascript
let shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
```



When a vertex shader specifies attributes or uniforms, these are called <u>inputs</u>. The compiled program has a set memory layout and in order to get our data into these <u>inputs</u> we need to know where in memory they have been located, which means we need to compile our sources in order to find out where they go.

> After we've created a shader program we need to look up the locations that WebGL assigned to our inputs.

```javascript
let programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPositions: gl.getAttributeLocation(shaderProgram, 'aVertexPosition'),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
  }
}
```



To get data into <u>inputs</u> we use <u>buffers</u> 
