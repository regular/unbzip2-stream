var unbzip2Stream = require('../..');
var test = require('tape');
var fs = require('fs');
var streamEqual = require('stream-equal');

test('a very large binary file piped into unbzip2-stream results in original file content', function(t) {
    t.plan(1);
    var source = fs.createReadStream('test/fixtures/vmlinux.bin.bz2');
    var expected = fs.createReadStream('test/fixtures/vmlinux.bin');
    var unbz2 = unbzip2Stream();
    source.pipe(unbz2);
    streamEqual(expected, unbz2, function(err, equal) {
        if (err)
            t.ok(false, err);
        t.ok(equal, "same file contents");
    });
});
