var unbzip2Stream = require('../');
var concat = require('concat-stream');
var test = require('tape');
var fs = require('fs');

test('accepts data in both write and end', function(t) {
    t.plan(1);
    var compressed = fs.readFileSync('test/fixtures/text.bz2');
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function(err) { t.fail(err.message); });
    unbz2.pipe( concat(function(data) {
        var expected = "Hello World!\nHow little you are. now.\n\n";
        t.equal(data.toString('utf-8'), expected);
    }));
    unbz2.write(compressed.subarray(0, 4));
    unbz2.end(compressed.subarray(4));
});

test('accepts concatenated bz2 streams', function(t) {
    t.plan(1);
    var compressed = fs.readFileSync('test/fixtures/concatenated.bz2');
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function(err) { t.fail(err.message); });
    unbz2.pipe( concat(function(data) {
        var expected = "ab\n";
        t.equal(data.toString('utf-8'), expected);
    }));
    unbz2.end(compressed);
});

test('should emit error when stream is broken', function(t) {
    t.plan(1);
    var compressed = fs.readFileSync('test/fixtures/broken');
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function(err) {
        t.ok(true, err.message);
    });
    unbz2.pipe( concat(function(data) {
        var expected = "Hello World!\nHow little you are. now.\n\n";
        t.ok(false, 'we should not get here');
    }));
    unbz2.end(compressed);
});

test('should emit error when crc is broken', function(t) {
    t.plan(1);
    var compressed = fs.readFileSync('test/fixtures/brokencrc.bz2');
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function(err) {
        t.ok(true, err.message);
    });
    unbz2.pipe( concat(function(data) {
        var expected = "Hello World!\nHow little you are. now.\n\n";
        t.ok(false, 'we should not get here');
    }));
    unbz2.end(compressed);
});

test('decompresses empty stream', function(t) {
    t.plan(1);
    var compressed = fs.readFileSync('test/fixtures/empty.bz2');
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function(err) { t.fail(err.message); });
    unbz2.pipe( concat(function(data) {
        var expected = "";
        t.equal(data.toString('utf-8'), expected);
    }));
    unbz2.end(compressed);
});

test('decompresses empty input', function(t) {
    t.plan(1);
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function(err) { t.fail(err.message); });
    unbz2.pipe( concat(function(data) {
        var expected = "";
        t.equal(data.toString('utf-8'), expected);
    }));
    unbz2.end();
});

test('should emit error when block crc is wrong', function(t) {
    t.plan(1);
    var compressed = fs.readFileSync('test/fixtures/brokenblockcrc.bz2');
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function(err) { t.pass(err.message); });
    unbz2.pipe(concat());
    unbz2.end(compressed);
});

test('should emit error when stream is broken in a different way?', function(t) {
    t.plan(1);
    // this is the smallest truncated file I found that reproduced the bug, but
    // longer files will also work.
    var truncated = fs.readFileSync('test/fixtures/truncated.bz2');
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function (err) {
        t.ok(true, err);
    });
    unbz2.on('close', function (err) {
        t.ok(false, "Should not reach end of stream without failing.");
    });
    unbz2.end(truncated);
});

test('detects incomplete streams', function(t) {
    t.plan(1);
    var incomplete = fs.readFileSync('test/fixtures/nostreamcrc.bz2');
    var unbz2 = unbzip2Stream();
    unbz2.on('error', function (err) {
        t.ok(true, err);
    });
    unbz2.end(incomplete);
});