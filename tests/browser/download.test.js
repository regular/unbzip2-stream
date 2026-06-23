import http from "node:http";
import test from "node:test";
import assert from "node:assert";
import { text } from "node:stream/consumers";

import unbzip2Stream from "../../src/index.js";

test("http stream piped into unbzip2-stream results in original file content", async (t) => {
  const data = await new Promise((resolve, reject) => {
    http
      .get({ path: "/tests/fixtures/text.bz2" }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status ${res.statusCode}`));
          return;
        }

        // Pipe into unbzip2-stream and consume directly into a string
        const decompressedStream = res.pipe(unbzip2Stream());
        resolve(text(decompressedStream));
      })
      .on("error", reject);
  });

  const expected = "Hello World!\nHow little you are. now.\n\n";

  assert.strictEqual(data, expected);
});
