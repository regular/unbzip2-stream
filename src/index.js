import { Transform } from "node:stream";
import bz2 from "./bzip2.js";
import bitIterator from "./bit_iterator.js";

function unbzip2Stream() {
  let bufferQueue = [];
  let hasBytes = 0;
  let blockSize = 0;
  let broken = false;
  let bitReader = null;
  let streamCRC = null;

  function decompressBlock(push) {
    if (!blockSize) {
      blockSize = bz2.header(bitReader);
      streamCRC = 0;
      return true;
    } else {
      const bufsize = 100000 * blockSize;
      const buf = new Int32Array(bufsize);

      const chunk = [];
      const f = function (b) {
        chunk.push(b);
      };

      streamCRC = bz2.decompress(bitReader, f, buf, bufsize, streamCRC);
      if (streamCRC === null) {
        blockSize = 0;
        return false;
      } else {
        push(Buffer.from(chunk));
        return true;
      }
    }
  }

  let outlength = 0;
  function decompressAndQueue(stream) {
    if (broken) return;
    try {
      return decompressBlock(function (d) {
        if (d !== null) {
          stream.push(d);
          outlength += d.length;
        }
      });
    } catch (e) {
      stream.emit("error", e);
      broken = true;
      return false;
    }
  }

  return new Transform({
    transform(data, encoding, callback) {
      bufferQueue.push(data);
      hasBytes += data.length;
      if (bitReader === null) {
        bitReader = bitIterator(function () {
          return bufferQueue.shift();
        });
      }
      while (
        !broken &&
        hasBytes - bitReader.bytesRead + 1 >= (25000 + 100000 * blockSize || 4)
      ) {
        decompressAndQueue(this);
      }
      callback();
    },

    flush(callback) {
      while (!broken && bitReader && hasBytes > bitReader.bytesRead) {
        decompressAndQueue(this);
      }
      if (!broken) {
        if (streamCRC !== null) {
          this.emit("error", new Error("input stream ended prematurely"));
        }
        this.push(null);
      }
      callback();
    },
  });
}

export default unbzip2Stream;
