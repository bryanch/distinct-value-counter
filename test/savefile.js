var fs = require('fs');
var Q = require('q');
var ihll = require('../index');
var counter =ihll(0.01);
var rowcount = 0;

var csv = require('fast-csv');
if(process.argv.length<4){
    throw Error("usage: <output file> <input file1.csv> <input file2.csv> ...");
}

var inputfiles=process.argv.slice(3);
var outputfile = process.argv[2];

function run(){
    var promises=inputfiles.map(function(inputfile){
        var defered = Q.defer();
        csv.fromPath(inputfile, {headers: true})
        .on('data', function(data){
            var userId=data['User Id'];
            counter.add(userId);
            rowcount++;
            console.log('UserId:'+userId+', total:'+rowcount+', users:'+counter.count());
        })
        .on('end', function(){
            console.log(inputfile + ' is done.');
            defered.resolve('done');
        });

        return defered.promise;
    });

    Q.all(promises).then(function(){
        console.log('writing to file '+outputfile);
        var data = counter.toString();
        fs.writeFile(outputfile, data, function(err){
            if(err){
                return console.log(err);
            }

            console.log('done');
        });

        counter.fromString(data);

        console.log('verfication result:'+ (counter.toString()==data));
    });
}
run();
