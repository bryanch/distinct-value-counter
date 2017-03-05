# distinct-value-counter
Count distinct values/cardinalities using HyperLogLog algorithm.

For a quick read of the HyperLogLog algorithm please refer to https://research.neustar.biz/2012/10/25/sketch-of-the-day-hyperloglog-cornerstone-of-a-big-data-infrastructure/.

I am currently using this for continously counting distinct values, for example, in realtime events, every event contains a user or session id, and we want to count how many distinct users or sessions while processing the events. Keeping a huge list of id can be a solution, but it would run out of memory eventually. Using HLL is O(1) in both space and time complexity, but when one of the HLL registers bumps, the total count might jump, so to smooth that in displaying real time counting, I add an incremental counter on top of the HLL counter. The error range could be slightly better, but it depends on the precision (seems the smaller the closer).

Following is one of my test result (using 1M random numbers)
```
Base: 951700, HLL:951688, IHLL:951688. HLL Error: -0.001%. IHLL Error: -0.001%
HLL Error Range:[-0.019%,0.134%]
IHLL Error Range:[-0.022%,0.133%]
```

### Usage ###
```
var counter = require('distinct-value-counter');
var idCounter = counter(0.001); // Specify expected precision, default is 0.01
idCounter.add('a');
idCounter.add('b');
expect(idCounter.count()).equal.to(2);
```

