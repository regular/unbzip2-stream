# unbzip2-stream

streaming bzip2 decompressor in pure JS for Node and browserify.

## Usage

```js
import bz2 from "unbzip2-stream";
import fs from "node:fs";

// decompress test.bz2 and output the result
fs.createReadStream("./test.bz2").pipe(bz2()).pipe(process.stdout);
```

Also see [tests/browser/download.js](./tests/browser/download.test.js) for an example of decompressing a file while downloading.

## Or, using a `<script>` tag

```html
<script type="module">
  import unbzip2Stream from "https://esm.sh/unbzip2-stream@2.0.0";
  const myStream = unbzip2Stream();
  // now pipe stuff through it (see above)
</script>
```

## Tests

To run tests in Node:

```bash
npm run test
```

To run browser tests

```bash
npm run browser-test
```

## Additional Tests

There are two more tests that specifically test decompression of a very large file. Because I don't want to include large binary files in this repository, the files are created by running an npm script.

```bash
npm run prepare-long-test
```

You can now

```bash
npm run long-test
```
