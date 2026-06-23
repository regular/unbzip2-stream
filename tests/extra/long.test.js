import fs from "node:fs";
import test from "node:test";
import assert from "node:assert";

import streamEqual from "stream-equal";

import unbzip2Stream from "../../src/index.js";

test("a very large binary file piped into unbzip2-stream results in original file content", (t, done) => {
  const source = fs.createReadStream("tests/fixtures/vmlinux.bin.bz2");
  const expected = fs.createReadStream("tests/fixtures/vmlinux.bin");
  const unbz2 = unbzip2Stream();

  source.pipe(unbz2);

  streamEqual(expected, unbz2, function (err, equal) {
    if (err) {
      assert.fail(err);
      return done();
    }
    assert.ok(equal, "same file contents");
    done();
  });
});
