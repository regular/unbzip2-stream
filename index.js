var Buffer = require('buffer').Buffer;
var through = require('through');
var bz2 = require('bzip2');

module.exports = unbzip2Stream;

function unbzip2Stream() {
    var bit = 0, readBytes = 0, readOffset = 0;
    var BITMASK = [0, 0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F, 0xFF ];
    var bufferQueue = [];
    var buffer = [];
    var blockSize = 0;
    var hasBytes = 0;
    var broken = false;

    function bitReader(n){
        var result = 0;
        while(n > 0){
            var left = 8 - bit;
            if(buffer.length == readBytes - readOffset){
                readOffset = readBytes;
                buffer = bufferQueue.shift();
            }
            
            var currentByte = buffer[readBytes - readOffset];
            if(n >= left){
                result <<= left;
                result |= (BITMASK[left] & currentByte);
                readBytes++;
                bit = 0;
                n -= left;
            }else{
                result <<= n;
                result |= ((currentByte & (BITMASK[n] << (8 - n - bit))) >> (8 - n - bit));
                bit += n;
                n = 0;
            }
        }
        return result;
    }

    function decompressBlock(push){
        if(!blockSize){
            blockSize = bz2.header(bitReader);
            //console.log("got header of", blockSize);
        }else{
            var chunk = bz2.decompress(bitReader, blockSize);
            if(chunk == -1){
                push(null);
                //console.log('done');
            }else{
                //console.log('got', chunk.length,'bytes');
                // var s = '';
                // for(var i=0;i<chunk.length; ++i) {
                    // s+= String.fromCharCode(chunk[i]);
                // };
                // console.log(s);
                push(new Buffer(chunk));
            }
        }
    }

    function decompressAndQueue(stream) {
        if (broken) return;
        try {
            decompressBlock(function(d) {stream.queue(d);});
        } catch(e) {
            if (typeof e === 'string') {
                stream.emit('error', new Error(e));
                broken = true;
            } else {
                throw e;
            }
        }
    }

    return through(
        function write(data) {
            //console.log('received', data.length,'bytes');
            bufferQueue.push(data);
            hasBytes += data.length;
            if(hasBytes - readBytes >= (100000 * blockSize || 4)){
                //console.log('decompressing with', hasBytes, 'bytes in buffer');
                decompressAndQueue(this);
            }
        },
        function end() {
            //console.log('last compressing with', hasBytes, 'bytes in buffer');
            decompressAndQueue(this);
            this.queue(null);
        }
    );
}

