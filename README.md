unzip2-stream
===
Wraps [jvrousseau/bzip2.js](https://github.com/jvrousseau/bzip2.js) into a through stream. I refactored the pre-existing streaming code (formerly in node-test.js) and turned it into the module's interface.

Buffers
---
The stream emits instances of [feross/buffer](https://github.com/feross/buffer) instead of raw Uint8Arrays to have a consistant API across browsers and Node.

Usage
---
``` js
var bz2 = require('unbzip2-stream');
var fs = require('fs');

// decompress test.bz2 and output the result
fs.createReadStream('./test.bz2').pipe(bz2()).pipe(process.stdout);
```

Also see [test/browser/download.js](https://github.com/regular/unbzip2-stream/blob/master/test/browser/download.js) for an example of decompressing a file while downloading.

Tests
---
To run tests in Node:

    npm run test

To run tests in PhantomJS

    npm run browser-test

