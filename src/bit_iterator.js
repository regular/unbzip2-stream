const BITMASK = [0, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff];

// returns a function that reads bits.
// takes a buffer iterator as input
function bitIterator(nextBuffer) {
  let bit = 0,
    byte = 0;
  let bytes = nextBuffer();
  const f = function (n) {
    if (n === null && bit != 0) {
      // align to byte boundary
      bit = 0;
      byte++;
      return;
    }
    let result = 0;
    while (n > 0) {
      if (byte >= bytes.length) {
        byte = 0;
        bytes = nextBuffer();
      }
      var left = 8 - bit;
      if (bit === 0 && n > 0) f.bytesRead++;
      if (n >= left) {
        result <<= left;
        result |= BITMASK[left] & bytes[byte++];
        bit = 0;
        n -= left;
      } else {
        result <<= n;
        result |=
          (bytes[byte] & (BITMASK[n] << (8 - n - bit))) >> (8 - n - bit);
        bit += n;
        n = 0;
      }
    }
    return result;
  };
  f.bytesRead = 0;
  return f;
}

export default bitIterator;
