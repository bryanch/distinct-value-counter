var fs=require('fs');
var main=require('../index');
// if(process.argv.length<3){
//     throw Error("usage: <input file>");
// }
//var inputfile =  process.argv[2];
var inputfile = 'dump.txt';
fs.readFile(inputfile, function(err, data){
    if(err)throw err;

    var counter = main(1,1);
    counter.fromString(data.toString());
    console.log('load counter with count:'+counter.count());
});