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
    }
});

function factory(precision, baseThreshold){
    return new IHLL(precision, baseThreshold);
}

module.exports = factory;