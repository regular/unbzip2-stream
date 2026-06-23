import test from "node:test";
import assert from "node:assert";

import bitIterator from "../src/bit_iterator.js";

test("should return the correct bit pattern across byte boundaries", () => {
  const bi = bitIterator(() => {
    return Buffer.from([0x0f, 0x10, 0x01, 0x80]);
  });

  assert.strictEqual(bi(16), 0x0f10);
  assert.strictEqual(bi(7), 0x0);
  assert.strictEqual(bi(2), 0x03);
  assert.strictEqual(bi(7), 0x0);
  assert.strictEqual(bi.bytesRead, 4);
});

test("should correctly switch from one buffer to the next", () => {
  let i = 0;
  const buffs = [[0x01], [0x80]];
  const bi = bitIterator(() => {
    return buffs[i++];
  });

  assert.strictEqual(bi(7), 0x0);
  assert.strictEqual(bi(2), 0x03);
  assert.strictEqual(bi(7), 0x0);
  assert.strictEqual(bi.bytesRead, 2);
});

test("each iterator has an independent bytesRead property", () => {
  let i = 0,
    ii = 0;
  const buffs = [[0x01], [0x80]];

  const bi1 = bitIterator(() => {
    return buffs[i++];
  });
  const bi2 = bitIterator(() => {
    return buffs[ii++];
  });

  assert.strictEqual(bi1.bytesRead, 0);
  assert.strictEqual(bi2.bytesRead, 0);

  bi1(9);
  assert.strictEqual(bi1.bytesRead, 2);
  assert.strictEqual(bi2.bytesRead, 0);

  bi2(7);
  assert.strictEqual(bi1.bytesRead, 2);
  assert.strictEqual(bi2.bytesRead, 1);
});

test("aligns to the byte boundary when passed null", () => {
  const bi = bitIterator(() => {
    return Buffer.from([0x0f, 0x10, 0x01, 0x80]);
  });

  assert.strictEqual(bi(7), 0x7);
  bi(null);
  assert.strictEqual(bi.bytesRead, 1);
  assert.strictEqual(bi(4), 0x1);
});
