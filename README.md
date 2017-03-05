# distinct-value-counter
Count distinct values/cardinalities using HyperLogLog algorithm.

For a quick read of the HyperLogLog algorithm please refer to https://research.neustar.biz/2012/10/25/sketch-of-the-day-hyperloglog-cornerstone-of-a-big-data-infrastructure/.

I am currently using this for continously counting distinct values, for example, in realtime events, every event contains a user or session id, and we want to count how many distinct users or sessions while processing the events. Keeping a huge list of id can be a solution, but it would run out of memory eventually. Using HLL is O(1) in both space and time complexity, I also added an incremental counter on top of the HLL one, but it turns out to be not much different.

Following is one of my test result (using 1M random numbers)
```
Base: 951667, HLL:951690, IHLL:951683. HLL Error: 0.002%. IHLL Error: 0.001%
HLL Error Range:[-0.181%,0.069%]
IHLL Error Range:[-0.125%,0.051%]
```

### Usage ###
```
var counter = require('distinct-value-counter');
var idCounter = counter(0.001); // Specify expected precision, default is 0.01
idCounter.add('a');
idCounter.add('b');
expect(idCounter.count()).equal.to(2);
```

