function factory(){
    var dict={};
    var distinctCounter=0;

    var service={
        add:addValue,
        count: count
    }

    function addValue(value){
        if(value in dict){
            return false;
        }
        else{
            dict[value]=1;
            distinctCounter++;
            return true;
        }
    }

    function count(){
        return distinctCounter;
    }

    return service;
}

module.exports=factory;