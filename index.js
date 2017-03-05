var hllfactory=require('./hll');

function factory(precision){
    var hll = hllfactory(precision);
    var counter = 0;

    function addValue(value){
        if(hll.add(value)|| counter<hll.count()){
            counter++;
            return true;
        }
        else
            return false;
    }

    function count(){
        return counter;
    }

    var service = {
        add: addValue,
        count: count
    }

    return service;
}

module.exports = factory;