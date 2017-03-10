var hllfactory=require('./hll');
var simpledict=require('./simpledict');

function defineClass(prototype) {
    var constructor = prototype.constructor;
    constructor.prototype = prototype;
    return constructor;
}

var IHLL = defineClass({
    constructor: function(precision, baseThreshold){
        this.counter = 0;
        this.precision = precision || 0.01;
        this.baseThreshold = baseThreshold || 100000;
        this.hll = hllfactory(this.precision);
        this.baseCounter = simpledict();
    },

    add: function(value){
        var result;
        if(this.hll.add(value)){
            this.counter++;
            result = true;
        }
        else
            result = false;

        if(this.baseCounter!==null){
            var baseResult = this.baseCounter.add(value);
            if(result && !baseResult){
                result=baseResult;
                this.counter--;
            }
            else if(!result && baseResult){
                result=baseResult;
                this.counter++;
            }

            if(this.counter>this.baseThreshold){
                this.baseCounter=null;
            }
        }
        else if(!result && this.counter<this.hll.count()){
            result=true;
            this.counter++;
        }

        return result;
    },

    count: function(){
        return this.counter;
    },

    hasher: function(value){
        this.hll.hasher(value);
        return this;
    },

    toBuffer: function(){
        var hllbuff = this.hll.toBuffer();
        var buff=Buffer.alloc(6);
        buff.writeUIntBE(this.counter, 0, 6);
        return Buffer.concat([buff, hllbuff]);
    },
    
    fromBuffer: function(buff, offset){
        offset=offset||0;
        this.counter=buff.readUIntBE(offset, 6);
        this.hll.fromBuffer(buff, offset+6);
        this.baseCounter=null;
        this.baseThreshold=0;
        return this;
    },

    toString: function(){
        return this.toBuffer().toString('base64');
    },

    fromString: function(s){
        var buff=Buffer.from(s, 'base64');
        return this.fromBuffer(buff, 0);
    }
});

function factory(precision, baseThreshold){
    return new IHLL(precision, baseThreshold);
}

module.exports = factory;