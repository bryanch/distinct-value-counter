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

    var hll = {
        hasher: function(value){_hasher=value;return hll;},
        count: count,
        add: addValue,
        error: error(precisionBits)
    }

    var indexMask = (1<<precisionBits)-1;
    var _hasher=hasher;

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

    var beta=alpha*bins*bins;
    var threshold=5/2*bins;
    var smallFactor = bins*Math.log(bins);
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