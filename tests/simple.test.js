import fs from "node:fs";
import test from "node:test";
import assert from "node:assert";
import { text } from "node:stream/consumers";

import unbzip2Stream from "../src/index.js";

test("accepts data in both write and end", async () => {
  const compressed = fs.readFileSync("tests/fixtures/text.bz2");
  const unbz2 = unbzip2Stream();

  const processStream = text(unbz2);

  unbz2.write(compressed.subarray(0, 4));
  unbz2.end(compressed.subarray(4));

  const data = await processStream;
  const expected = "Hello World!\nHow little you are. now.\n\n";
  assert.strictEqual(data, expected);
});

test("accepts concatenated bz2 streams", async () => {
  const compressed = fs.readFileSync("tests/fixtures/concatenated.bz2");
  const unbz2 = unbzip2Stream();

  const processStream = text(unbz2);
  unbz2.end(compressed);

  const data = await processStream;
  const expected = "ab\n";
  assert.strictEqual(data, expected);
});

test("should emit error when stream is broken", (t, done) => {
  const compressed = fs.readFileSync("tests/fixtures/broken");
  const unbz2 = unbzip2Stream();

  unbz2.on("error", (err) => {
    assert.ok(err.message);
    done();
  });

  unbz2.on("data", () => {
    assert.fail("we should not get here");
  });

  unbz2.end(compressed);
});

test("should emit error when crc is broken", (t, done) => {
  const compressed = fs.readFileSync("tests/fixtures/brokencrc.bz2");
  const unbz2 = unbzip2Stream();

  unbz2.on("error", (err) => {
    assert.ok(err.message);
    done();
  });

  unbz2.on("data", () => {
    assert.fail("we should not get here");
  });

  unbz2.end(compressed);
});

test("decompresses empty stream", async () => {
  const compressed = fs.readFileSync("tests/fixtures/empty.bz2");
  const unbz2 = unbzip2Stream();

  const processStream = text(unbz2);
  unbz2.end(compressed);

  const data = await processStream;
  assert.strictEqual(data, "");
});

test("decompresses empty input", async () => {
  const unbz2 = unbzip2Stream();

  const processStream = text(unbz2);
  unbz2.end();

  const data = await processStream;
  assert.strictEqual(data, "");
});

test("should emit error when block crc is wrong", (t, done) => {
  const compressed = fs.readFileSync("tests/fixtures/brokenblockcrc.bz2");
  const unbz2 = unbzip2Stream();

  unbz2.on("error", (err) => {
    assert.ok(err.message);
    done();
  });

  unbz2.end(compressed);
});

test("should emit error when stream is broken in a different way?", (t, done) => {
  const truncated = fs.readFileSync("tests/fixtures/truncated.bz2");
  const unbz2 = unbzip2Stream();

  let errored = false;

  unbz2.on("error", (err) => {
    errored = true;
    assert.ok(err);
    done();
  });

  unbz2.on("close", () => {
    setImmediate(() => {
      if (!errored) {
        assert.fail("Should not reach end of stream without failing.");
      }
    });
  });

  unbz2.end(truncated);
});

test("detects incomplete streams", (t, done) => {
  const incomplete = fs.readFileSync("tests/fixtures/nostreamcrc.bz2");
  const unbz2 = unbzip2Stream();

  unbz2.on("error", (err) => {
    assert.ok(err);
    done();
  });

  unbz2.end(incomplete);
});
