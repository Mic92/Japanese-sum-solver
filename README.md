Japanese Sum Solver
===================

Japanese Sum or Japsum is a logic-based combinatorial number-placement puzzle.
This javascript library implements a backtracking-based solver for this game.

Usage:

```Javascript
var across_sums = [[6, 15],  [8,  5], [18],  [6, 1, 5], [2, 18], [7, 7, 1], [1, 12, 3]];
var down_sums   = [[5, 2, 5],[1, 14], [7, 2],[9, 12],   [6, 15], [11, 5],   [6, 15]];
var solver = new JapaneseSum();
console.log(solver.solve(across_sums, down_sums));
```

Currently limited to 7x7 fields.

Check out the [demo](http://wwwpub.zih.tu-dresden.de/~s5245332/index.html)!
