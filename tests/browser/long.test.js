import http from "node:http";
import fs from "node:fs";
import test from "node:test";
import assert from "node:assert";
import { buffer } from "node:stream/consumers";

import unbzip2Stream from "../../src/index.js";

test("http stream piped into unbzip2-stream results in original file content", async (t) => {
  // Wrap the old callback-based http.get in a Promise so we can use async/await
  const data = await new Promise((resolve, reject) => {
    http
      .get({ path: "/tests/fixtures/vmlinux.bin.bz2" }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status ${res.statusCode}`));
          return;
        }

        // Pipe response into unbzip2-stream and consume it into a single Buffer
        const decompressedStream = res.pipe(unbzip2Stream());
        resolve(buffer(decompressedStream));
      })
      .on("error", reject);
  });

  const expected = fs.readFileSync("tests/fixtures/vmlinux.bin");

  assert.strictEqual(data.length, expected.length);
});
