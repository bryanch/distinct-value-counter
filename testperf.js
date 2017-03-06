var simpledict = require('./simpledict');
var ihll = require('./index');
var counter = ihll(0.01);

function random(n){
    return Math.floor(Math.random()*n);
}

const zeros = '000000000000000000000000000000000';
function padZeroleft(s, n){
    return (zeros+s).slice(-n);
}

function randomString(){
    return padZeroleft(String(random(10000000, 7)))+padZeroleft(String(random(10000000, 7)));
}

var uuid=require('uuid/v4');

var outputCounter=0;
for(var i=0;i++<4000000;){
    var id = randomString();
    var hrstart = process.hrtime();
    counter.add(uuid());
    var hrend = process.hrtime(hrstart);

    outputCounter++;
    if(outputCounter==1000){
        outputCounter=0;
        var mem = process.memoryUsage();
        var averageMem = mem.heapTotal/i;
        console.info("At iteration %d: execution time (hr): %ds %dms, Heap Total: %d, Average: %d", 
                i, hrend[0], hrend[1]/1000000, mem.heapTotal, averageMem);
    }
}