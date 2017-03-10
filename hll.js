// Implemented according to https://research.neustar.biz/2012/10/25/sketch-of-the-day-hyperloglog-cornerstone-of-a-big-data-infrastructure/

var hasher=require('./guidparser');
var MinimumBits = 4;
var MaximumBits = 24; // So the limit size of memory is around 16MB

function getAlpha(bits){
    switch(bits){
        case 4: return 0.673;
        case 5: return 0.697;
        case 6: return 0.709;
        default: return 0.7213/(1+1.079/(1<<bits));
    }
}

const CharsDict = {};
const Chars = [];
for(var i=0;i<16;i++){
    var c = i.toString(16);
    CharsDict[c]=i;
    Chars[i]=c;
}

function hll(precisionBits){
    precisionBits=precisionBits<MinimumBits?MinimumBits:precisionBits;
    precisionBits=precisionBits>MaximumBits?MaximumBits:precisionBits;
    var alpha=getAlpha(precisionBits);
    var bins = 1<<precisionBits;
    var inverseSum=bins;
    var registers = new Uint8Array(bins);
    for(var i=0;i<bins;i++){
        registers[i]=0;
    }
    var zeroBins = bins;
    var beta=alpha*bins*bins;
    var threshold=5/2*bins;
    var smallFactor = bins*Math.log(bins);

    var hll = {
        hasher: function(value){_hasher=value;return hll;},
        count: count,
        add: addValue,
        error: error(precisionBits),
        toBuffer: toBuffer,
        fromBuffer: fromBuffer,
        toString: toString,
        fromString: fromString
    }

    var indexMask = (1<<precisionBits)-1;
    var _hasher=hasher;

    function toBuffer(){
        var buff = Buffer.alloc(1+4+8+bins);
        buff.writeInt8(precisionBits, 0);
        buff.writeUInt32BE(zeroBins, 1);
        buff.writeDoubleBE(inverseSum, 1+4);
        Buffer.from(registers.buffer).copy(buff, 1+4+8);
        return buff;
    }

    function toString(){
        return toBuffer().toString('base64');
    }

    function fromBuffer(buff, offset){
        offset=offset||0;
        precisionBits = buff.readUInt8(offset);
        alpha=getAlpha(precisionBits);
        beta=alpha*bins*bins;
        threshold=5/2*bins;
        smallFactor = bins*Math.log(bins);
        bins=1<<precisionBits;
        indexMask = bins-1;
        zeroBins=buff.readUInt32BE(offset+1);
        inverseSum=buff.readDoubleBE(offset+1+4);
        registers=new Uint8Array(bins);
        buff.copy(registers, 0, offset+1+4+8);
        return hll;
    }

    function fromString(s){
        var buff = Buffer.from(s, 'base64');
        return fromBuffer(buff, 0);
    }

    function addValue(v){
        return addHashValue(_hasher(v));
    }

    function addHashValue(hash){
        if(hash==null||hash.length<1)
            return true;

        var i=0;
        var index = indexMask&hash[i];
        var zeros = 1; j=32-precisionBits;
        var h=hash[i]>>>precisionBits;
        var counting=true;
        while(j-->0&&counting){
            if(h&0x1!==0){
                counting=false;
                break;
            }
            zeros++;
            h=h>>>1;
        }

        while(++i<hash.length && counting){
            h = hash[i];
            j = 32;
            while(j-->0){
                if(h&0x1!==0){
                    counting=false;
                    break;
                }
                zeros++;
                h=h>>>1;
            }
        }

        var oldZeros=registers[index];
        if(zeros>oldZeros){
            registers[index]=zeros;
            if(oldZeros===0)zeroBins--;
            inverseSum+=(zeros>30)?
                            (Math.pow(2, -zeros)-Math.pow(2, -oldZeros)):
                            ((1/(1<<zeros))-(1/(1<<oldZeros)));
            return true;
        }
        else{
            return false;
        }
    }

    function count(){
        var estimate=beta/inverseSum;
        // small range correction
        if(estimate<threshold && zeroBins>0)
            estimate=smallFactor - bins*Math.log(zeroBins);

        return Math.floor(estimate+0.5);
    }

    return hll;
}

var oddFactor=1/Math.sqrt(2);
function error(precisionBits){
    return 1.04/(1<<(precisionBits>>>1))*(precisionBits%2===0?1:oddFactor);
}

function factory(precision){
    var bits=4;
    while(error(bits)>precision)
        bits++;
    return hll(bits);
}

module.exports=factory;