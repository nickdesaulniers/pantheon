function Floor () {
  var vertices = [
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0, -1.0, -1.0
  ];
  var indices = [
    0, 1, 2,  0, 2, 3
  ];
  var normals = [
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
  ];
  return {
    vertices: vertices,
    indices: indices,
    normals: normals,
  };
};

function Front () {
  return {
    vertices: [
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      0.0, 1.0, 1.0,
    ],
    indices: [
      0, 1, 2
    ],
    normals: [
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0
    ],
  };
};

