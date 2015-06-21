function translate (buffer, x, y, z) {
  buffer = buffer.vertices || buffer;
  for (var i = 0; i < buffer.length; i += 3) {
    buffer[i    ] += x;
    buffer[i + 1] += y;
    buffer[i + 2] += z;
  }
};

function scale (buffer, x, y, z) {
  buffer = buffer.vertices || buffer;
  for (var i = 0; i < buffer.length; i += 3) {
    buffer[i    ] *= x;
    buffer[i + 1] *= y;
    buffer[i + 2] *= z;
  }
};

