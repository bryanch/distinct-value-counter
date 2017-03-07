var expect = require('chai').expect;
var hll = require('./hll');
var simpledict = require('./simpledict');
var main = require('./index');
var uuid = require('uuid/v4');
var murmurhash3 = require('murmurhash3');

function random(n){
    return Math.floor(Math.random()*n);
}

function formatPercentage(n){
    return ((n*100000)>>0)/1000+'%';
}

function aggregateErrorRange(range, error){
    if(range[0]===undefined||range[0]>error)range[0]=error;
    if(range[1]===undefined||range[1]<error)range[1]=error;
}

describe('Distinct Value Counter', function(){
    it('validate basic methods', function(){
        var idCounter = main(0.01); // Specify expected precision, default is 0.01
        idCounter.add('a');
        idCounter.add('b');
        expect(idCounter.count()).equals(2);
    });

    it('random number', function(){
        this.timeout(100000);
        var max=1000;
        var precision=0.01;
        var hllcounter = hll(precision).hasher(murmurhash3.murmur128Sync);
        var simlecounter = simpledict();
        var maincounter = main(precision).hasher(murmurhash3.murmur128Sync);
        var errorRange1=new Array(2), errorRange2 = new Array(2);
        var displayCounter = 0;

        for(var i=0;i<3000000;i++){
            var r = String(random(400000));
            simlecounter.add(r);
            hllcounter.add(r);
            maincounter.add(r);

            var base = simlecounter.count();
            var c1 = hllcounter.count();
            var c2 = maincounter.count();
            var error1 = (c1-base)/base;
            var error2 = (c2-base)/base;
            aggregateErrorRange(errorRange1, error1);
            aggregateErrorRange(errorRange2, error2);

            displayCounter++;
            if(displayCounter===10000){
                console.log('Base: ' + base + ', HLL:'+c1 + ', IHLL:' + c2 + 
                            '. HLL Error: '+ formatPercentage(error1) + '. IHLL Error: ' + formatPercentage(error2));
                displayCounter=0;
            }
        }
        
        console.log('HLL Error Range:['+formatPercentage(errorRange1[0])+','+formatPercentage(errorRange1[1])+']');
        console.log('IHLL Error Range:['+formatPercentage(errorRange2[0])+','+formatPercentage(errorRange2[1])+']');

        var base = simlecounter.count();
        var c2 = maincounter.count();
        var error = Math.abs((c2-base)/base);
        expect(error).lessThan(precision);
    });

    it('random uuid', function(){
        this.timeout(100000);
        var max=1000;
        var precision=0.01;
        var hllcounter = hll(precision);
        var simlecounter = simpledict();
        var maincounter = main(precision,10);
        var errorRange1=new Array(2), errorRange2 = new Array(2);
        var displayCounter = 0;

        for(var i=0;i<4000000;i++){
            var r = uuid();
            simlecounter.add(r);
            hllcounter.add(r);
            maincounter.add(r);

            var base = simlecounter.count();
            var c1 = hllcounter.count();
            var c2 = maincounter.count();
            var error1 = (c1-base)/base;
            var error2 = (c2-base)/base;
            aggregateErrorRange(errorRange1, error1);
            aggregateErrorRange(errorRange2, error2);

            displayCounter++;
            if(displayCounter===10000){
                console.log('Base: ' + base + ', HLL:'+c1 + ', IHLL:' + c2 + 
                            '. HLL Error: '+ formatPercentage(error1) + '. IHLL Error: ' + formatPercentage(error2));
                displayCounter=0;
            }
        }
        
        console.log('HLL Error Range:['+formatPercentage(errorRange1[0])+','+formatPercentage(errorRange1[1])+']');
        console.log('IHLL Error Range:['+formatPercentage(errorRange2[0])+','+formatPercentage(errorRange2[1])+']');

        var base = simlecounter.count();
        var c2 = maincounter.count();
        var error = Math.abs((c2-base)/base);
        expect(error).lessThan(precision);
    });

});