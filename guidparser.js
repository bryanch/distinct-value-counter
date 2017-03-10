const CharSize=8;
const CharsDict = {};
for(var i=0;i<16;i++){
    CharsDict[i.toString(16)]=i;
}
function parse(guid){
    if(!guid)guid='';

    var chars = guid.toLowerCase().match(/[0-9a-f]/g);
    var numberCharsCount = 0;
    var numbers=[];
    var number=0;
    if(chars!=null){
        for(var i=chars.length;i-->0;){
            number<<=4;
            number|=CharsDict[chars[i]];
            numberCharsCount++;

            if(numberCharsCount===8){
                numbers.push(number);
                if(numbers.length===4){
                    break;
                }

                number=0;
                numberCharsCount=0;
            }
        }
    }

    while(numbers.length<4){
        numbers.push(-1);
    }

    return numbers;
}

module.exports = parse;