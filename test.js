var expect = require('chai').expect;
var hll = require('./hll');
var simpledict = require('./simpledict');
var main = require('./index');

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

    it('iterate random numbers', function(){
        this.timeout(10000);
        var max=1000;
        var precision=0.001;
        var hllcounter = hll(precision);
        var simlecounter = simpledict();
        var maincounter = main(precision);
        var errorRange1=new Array(2), errorRange2 = new Array(2);
        for(var j=0;j<10;j++){
            var r = String(random(10000000));
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
            //console.log('Base: ' + base + ', HLL:'+c1 + ', IHLL:' + c2 + 
            //            '. HLL Error: '+ formatPercentage(error1) + '. IHLL: ' + formatPercentage(error2));

            
        }


        for(var i=0;i<max;i++){
            for(var j=0;j<1000;j++){
                var r = String(random(10000000));
                simlecounter.add(r);
                hllcounter.add(r);
                maincounter.add(r);
            }

            var base = simlecounter.count();
            var c1 = hllcounter.count();
            var c2 = maincounter.count();
            var error1 = (c1-base)/base;
            var error2 = (c2-base)/base;
            aggregateErrorRange(errorRange1, error1);
            aggregateErrorRange(errorRange2, error2);
            console.log('Base: ' + base + ', HLL:'+c1 + ', IHLL:' + c2 + 
                        '. HLL Error: '+ formatPercentage(error1) + '. IHLL Error: ' + formatPercentage(error2));
        }
        
        console.log('HLL Error Range:['+formatPercentage(errorRange1[0])+','+formatPercentage(errorRange1[1])+']');
        console.log('IHLL Error Range:['+formatPercentage(errorRange2[0])+','+formatPercentage(errorRange2[1])+']');

        var base = simlecounter.count();
        var c2 = maincounter.count();
        var error = Math.abs((c2-base)/base);
        expect(error).lessThan(precision);
    });

});