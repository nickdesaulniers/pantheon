(function () {

function loaded (errors, gl, programs, images) {
  window.gl = gl;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(programs[0].program);

  setUniforms(gl, programs[0].uniforms);
  var combined = generateGeometries(gl, programs[0].attributes);

  render(gl, combined.indices.length);

  window.addEventListener('resize', function () {
    fitCanvasToScreen(canvas);
    setUniforms(gl, programs[0].uniforms);
    gl.viewport(0, 0, canvas.width, canvas.height);
    render(gl, combined.indices.length);
  });
};

function render (gl, n) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // fun fact, the offset must be a multiple of the type
  // type: gl.UNSIGNED_SHORT (2 bytes)
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
};

Cylinder = memoize(Cylinder);
Cone = memoize(Cone);
Cube = memoize(Cube);
var Tree = memoize(function Tree () {
  const HEIGHT = 0.25;
  var cylinder = Cylinder();
  scale(cylinder.vertices, 0.25 * HEIGHT, 0.25 * HEIGHT, 0.25 * HEIGHT);
  translate(cylinder.vertices, 0, 0.25 * HEIGHT, 0);
  var cone = Cone();
  scale(cone.vertices, 0.5 * HEIGHT, 0.75 * HEIGHT, 0.5 * HEIGHT);
  translate(cone.vertices, 0, 0.25 * HEIGHT + HEIGHT, 0);
  var tree = combineGeometries(cylinder, cone);
  translate(tree.vertices, 0, -1, 0);
  // TODO: memoize?
  return tree;
});

function copyPrim (prim) {
  return {
    vertices: prim.vertices.slice(),
    indices: prim.indices.slice(),
    normals: prim.normals.slice(),
  };
};

function memoize (ctor) {
  var original = ctor();
  return function () {
    return copyPrim(original);
  };
};

const FLOOR_HEIGHT = 0.05;
function Pillar () {
  var cylinder = Cylinder();
  scale(cylinder, 0.05, 0.1, 0.05);
  translate(cylinder, 0, -1 + FLOOR_HEIGHT + 0.15, 0);
  return cylinder;
};

function Pantheon () {
  var floor = Cube();
  scale(floor, 0.2, FLOOR_HEIGHT, 0.4);
  translate(floor, 0, -1 + FLOOR_HEIGHT, 0);
  var pillar1 = Pillar();
  translate(pillar1, 0.1, 0, 0.3);
  var pillar2 = Pillar();
  translate(pillar2, -0.1, 0, 0.3);
  var pillar3 = Pillar();
  translate(pillar3, 0.1, 0, -0.3);
  var pillar4 = Pillar();
  translate(pillar4, -0.1, 0, -0.3);
  var roof = Cube();
  scale(roof, 0.2, FLOOR_HEIGHT, 0.4);
  translate(roof, 0, -1 + FLOOR_HEIGHT + 0.15 + 0.125, 0);
  return combineGeometries(floor, pillar1, pillar2, pillar3, pillar4, roof);
};

function genTrees (n) {
  const SPREAD = 1.5;
  var trees = [];
  for (var i = 0; i < n; ++i) {
    var tree = Tree();
    var x = (Math.random() - 0.5) * SPREAD;
    var z = (Math.random() - 0.5) * SPREAD;
    //console.log(x, z);
    translate(tree.vertices, x, 0, z);
    trees.push(tree);
  }
  return combineGeometries.apply(null, trees);
};

function generateGeometries (gl, attributes) {
  console.time('geometry generation');
  var floor = Floor();
  var trees = genTrees(10);
  var pantheon = Pantheon();
  translate(pantheon, 0.5, 0, -0.4);
  var combined = combineGeometries(floor, trees, pantheon);
  console.timeEnd('geometry generation');
  initBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(combined.vertices), 3,
             attributes.aPosition);
  initBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(combined.normals), 3,
             attributes.aNormal);
  initBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(combined.indices));
  //console.log(combined);
  return combined;
};

function combineGeometries () { // variadic
  var vertices = [];
  var indices = [];
  var normals = [];
  var vertexOffset = 0;
  var indexOffset = 0;
  var total = arguments.length;

  for (var i = 0; i < total; ++i) {
    var geometry = arguments[i];
    var vertexStride = geometry.vertices.length / 3;

    vertices.push.apply(vertices, geometry.vertices);
    normals.push.apply(normals, geometry.normals);

    if (i === 0) {
      indices.push.apply(indices, geometry.indices);
    } else {
      for (var j = 0; j < geometry.indices.length; ++j) {
        indices.push(geometry.indices[j] + vertexOffset);
      }
    }

    vertexOffset += vertexStride;
  }

  return {
    vertices: vertices,
    indices: indices,
    normals: normals,
    numGeometries: total,
  };
};

function initBuffer (gl, type, data, elemPerVertex, attribute) {
  var buffer = gl.createBuffer();
  if (!buffer) throw new Error('Failed to create buffer');
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, gl.STATIC_DRAW);
  if (type === gl.ARRAY_BUFFER) {
    gl.vertexAttribPointer(attribute, elemPerVertex, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribute);
  }
  return buffer;
};

function setUniforms (gl, uniforms) {
  var model = mat4.create();
  gl.uniformMatrix4fv(uniforms.uModel, false, model);

  var view = mat4.create();
  var eye = vec3.fromValues(3, 2, 5);
  var center = vec3.fromValues(0, 0, 0);
  var up = vec3.fromValues(0, 1, 0);
  mat4.lookAt(view, eye, center, up);
  gl.uniformMatrix4fv(uniforms.uView, false, view);

  var proj = mat4.create();
  mat4.perspective(proj, d2r(35), canvas.width / canvas.height, 1, 10);
  gl.uniformMatrix4fv(uniforms.uProj, false, proj);
};

function fitCanvasToScreen (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

function d2r (deg) { return deg * Math.PI / 180.0 };

var canvas = document.getElementById('canvas');
fitCanvasToScreen(canvas);

var shaderURLs = ['prims/test/lambert.vert', 'prims/test/perFragment.frag'];
var imageURLs = [];
WebGLShaderLoader.load(canvas, shaderURLs, imageURLs, loaded);

})();
