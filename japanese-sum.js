var JapaneseSum;
(function () {
    'use strict';

    JapaneseSum = function () {
        function JapaneseSum() {
            var allowed_numbers = [1, 2, 3, 4, 5, 6, 7];
            this.cross_sum_groups = this.calc_sum_variants(allowed_numbers);
            this.gaps_permutations = this.gen_gaps_permutations();
            return true;
        }

        JapaneseSum.prototype.solve = function (across_sums, down_sums) {
            var across_solutions, down_solutions;
            if (across_sums.length !== 7) {
                throw new Error("got " + across_sums.length + " across_sums, exptected 7");
            }
            if (across_sums.length !== 7) {
                throw new Error("got " + down_sums.length + " down_sums, exptected 7");
            }
            across_solutions = this.solutions(across_sums);
            down_solutions = this.solutions(down_sums);
            return this.backtrack(across_solutions, down_solutions);
        };

        JapaneseSum.prototype.calc_sum_variants = function (numbers) {
            var sums = [];

            function group_by_cross_sum(elem) {
                var cross_sum = elem.sum();
                if (sums[cross_sum] === undefined) {
                    sums[cross_sum] = [];
                }
                sums[cross_sum].push(elem);
            }

            ary_each_permute_up_to(numbers, group_by_cross_sum);

            return sums;
        };

        // Create an array with 4 fields, representing the permutations of maximal 4 sum with gaps.
        // Each field of the array contains an array, where index stands for the number of used gaps.
        // This subarray contains my ArraySet containing the corresponding permutation.
        // ex of a permutations [0, 1, 0, 1, 0, 0] or [1, 0, 0]
        // the one stands for a sum, and zero stands for a gap
        JapaneseSum.prototype.gen_gaps_permutations = function () {
            var res = [].fill_copy_of({}, 4);
            var i, j;
            var hash, store;

            function store_valid_sums(combi) {
                var last_val = 0, sums = 0;
                // check, if each sum is seperated by a gap
                var valid = combi.every(function (field) {
                    if (field === 1) {
                        sums++;
                        if (last_val === 1) {
                            return false;
                        }
                    }
                    last_val = field;
                    return true;
                });

                // solution should have the right number of sums
                if (valid && sums < i) {
                    // Filter duplicate permutations
                    var hashval = combi.join('');
                    if (!hash[hashval]) {
                        hash[hashval] = true;
                        store.push(combi);
                    }
                }
            }

            for (i = 2; i <= 6; i++) {
                for (j = i - 2; j <= (9 - i); j++) {
                    var ary = [].fill_value_of(1, i)
                        .concat([].fill_value_of(0, j));
                    // reset values, which are manipulated by store_valid_sum
                    hash = {};
                    store = [];
                    ary_each_permute(ary, store_valid_sums);
                    res[i - 2][j] = store;
                }
            }
            return res;
        };

        JapaneseSum.prototype.solutions = function (row) {
            // Our closures shadow the real object, so capture a reference
            var obj = this;
            return row.map(function (line) {
                var groups = line.map(function (sum) {
                    return obj.cross_sum_groups[sum];
                });
                var line_perm = [].cartprod(groups);
                var line_perm_with_gaps = [];
                line_perm.forEach(function (perm) {
                    var flat_perm = ary_flatten(perm);
                    var flat_len = flat_perm.length;
                    var elem_len = perm.length;

                    if (flat_len > (8 - elem_len) ||
                        ary_uniq(flat_perm).length < flat_len) {
                        return;
                    }
                    obj.gaps_permutations[elem_len - 1][7 - flat_len].forEach(function (gap_perm) {
                        var i = 0;
                        var res = [];
                        gap_perm.forEach(function (field) {
                            if (field === 1) {
                                res = res.concat(perm[i]);
                                i++;
                            } else {
                                res.push(0);
                            }
                        });
                        line_perm_with_gaps.push(res);
                    });
                });
                return line_perm_with_gaps;
            });
        };

        JapaneseSum.prototype.backtrack = function (col_solution, row_solution) {
            var col_size = col_solution.length;
            var row_size = row_solution.length;

            // Setup state
            var col = 0;
            // Unsolved fields have the value '-1'
            var solution_vec = [].fill_value_of([].fill_value_of(-1, row_size), col_size);
            // save, which solution per column was taken
            var backtrack_vec = [].fill_value_of(0, col_size);
            // Bring first solution in place
            solution_vec[0] = col_solution[0][0];

            // validator functions
            var row_validator = function (row_solut, i) {
                return row_solut.some(function (row) {
                    // compare possible solutions for the current row
                    // with all column solutions
                    return row.every(function (field, j) {
                        var current = solution_vec[j][i];
                        return (current === -1 || current === field);
                    });
                });
            };

            var row_elements_are_uniq = function (val, i) {
                // 0 can be skiped, because it does not have to be uniq.
                if (val !== 0) {
                    return solution_vec.every(function (column) {
                        return column.indexOf(val) !== i;
                    });
                } else {
                    return true;
                }
            };

            while (true) {
                var rows_solved = row_solution.every(row_validator);
                if (rows_solved) {
                    if ((col + 1) >= col_size) {
                        return solution_vec;
                    } else {
                        console.log("row solved");
                        col++;
                        solution_vec[col] = col_solution[col][0];
                    }
                } else {
                    var is_conform = false;
                    while (!is_conform) {
                        if (backtrack_vec[col] + 1 >= col_solution[col].length) {
                            // Dead end, we have to backtrack
                            if (col <= 0) {
                                console.log("No solution found");
                                return;
                            } else {
                                console.log("backtrack");
                                solution_vec[col] = [].fill_value_of(-1, 7);
                                backtrack_vec[col] = 0;
                                col--;
                            }
                        } else {
                            // try next solution
                            solution_vec[col] = [].fill_value_of(-1, 7);
                            backtrack_vec[col]++;
                            // check, if each element per row and column is uniq
                            var new_col = col_solution[col][backtrack_vec[col]];
                            is_conform = new_col.every(row_elements_are_uniq);
                            if (is_conform)
                                solution_vec[col] = new_col;
                        }
                    }
                }
            }
        };

        return JapaneseSum;
    }();

     /**
      * Flattens a multidimensional array into a single array.
      *
      * @returns {Array} the flattened array
      */
     var ary_flatten = function (ary) {
	 var flat = [], i, l;
	 for (i = 0, l = ary.length; i < l; i++){
	     var type = Object.prototype.toString.call(ary[i]).split(' ').pop().split(']').shift().toLowerCase();
	     if (type) {
		 flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? ary_flatten(ary[i]) : ary[i]);
	     }
	 }
	 return flat;
     };

    /**
     * Assigns each field of the array inplace with the given value
     * Take care about objects as they aren't copy. Use fill_copy_of instead
     *
     * @param val A value
     * @returns {Array} the array itself
     */
     Array.prototype.fill_value_of = function (val, len) {
	var i, ary = new Array(len);
	for (i = 0; i < len; i++) {
	    ary[i] = val;
	}
	return ary;
    };

    /**
     * Assigns each field of the array inplace with the copy given value
     * These is useful, to build array of arrays.
     *
     * @param obj {Object} a object
     * @returns {Array} the array itself
     */
    Array.prototype.fill_copy_of = function (obj, len) {
	var i, ary = new Array(len);
	for (i = 0; i < len; i++) {
        ary[i] = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                ary[i][attr] = obj[attr];
            }
        }
	}
	return ary;
    };

    /**
     * Map all permutation of one field up to fields on function fn
     *
     * @param {Function} fn The function where each permutation is passed as first parameter
     * @param {Number} num [optional] The maximum number of fields. If leave out, the length of the array is taken
     * @returns {undefined} No return value
     */
    var ary_each_permute_up_to = function (ary, fn, num) {
        var llen = ary.length;
        if (num === undefined) {
            num = llen;
        }
        if (!(llen < num && num < 0 && num === 0)) { // General case
            var used = ([]).fill_value_of(false, llen);
            var perm = new Array(num);
            var permute; // res = [];
            // Do as much inplace as possible
            permute = function (index) {
                var i;
                for (i = 0; i < llen; i++) {
                    if (used[i] === false) {
                        perm[index] = ary[i];
                        if (index < num) {
                            used[i] = true;
                            permute(index + 1);
                            used[i] = false;
                        }
                    }
                }
                if (index > 0) {
                    fn(perm.slice(0, index));
                }
            };
            permute(0);
        }
        return undefined; // handle out of range
    };

    /**
     * Map all permutation of num fields on function fn
     *
     * @param {Function} fn The function where each permutation is passed as first parameter
     * @param {Number} num [optional] The maximum number of fields. If leave out, the length of the array is taken
     * @returns {undefined} No return value
     */
    var ary_each_permute = function (ary, fn, num) {
        var llen = ary.length;
        if (typeof num === 'undefined') {
            num = llen;
        }
        if (!(llen < num && num < 0 && num === 0)) { // prevent out of range
            var used = [].fill_value_of(false, llen);
            var perm = new Array(num);
            var permute; // res = [];
            // Do as much inplace as possible
            permute = function (index) {
                var i;
                for (i = 0; i < llen; i++) {
                    if (used[i] === false) {
                        perm[index] = ary[i];
                        if (index < num - 1) {
                            used[i] = true;
                            permute(index + 1);
                            used[i] = false;
                        } else {
                            fn(perm.slice(0, index));
                        }
                    }
                }
            };
            permute(0);
        }
        return undefined;
    };

    /**
     * Returns a new array by removing duplicate values in this.
     *
     * @returns {Array} the new array
     */
    var ary_uniq = function(ary) {
	var o = {}, i, l = ary.length, r = [];
	for(i=0; i<l; i+=1) {
	    o[ary[i]] = ary[i];
	}
	for(i in o) {
	    if (o.hasOwnProperty(i)) {
		r.push(o[i]);
	    }
	}
	return r;
    };

    /**
     * Sum of all elements of this.
     *
     * @returns {Number} the sum
     */
    Array.prototype.sum = function() {
	var i, sum = 0;
	for (i = this.length - 1; i >= 0; i--) {
	    sum += this[i];
	}
	return sum;
    };

    /**
     * Returns an array of all combinations of elements from all arrays
     *
     * @param {Array} arrays of arrays whose elements should be product with each other.
     * @returns {Number} the array with the products
     */
    Array.prototype.cartprod = function(arrays) {
	return Array.prototype.reduce.call(arrays, function(a, b) {
	    var ret = [];
	    a.forEach(function(a) {
		b.forEach(function(b) {
		    ret.push(a.concat([b]));
		});
	    });
	    return ret;
	}, [[]]);
    };

  //var across_sums = [[6, 15], [8,  5], [18],  [6, 1, 5], [2, 18], [7, 7, 1], [1, 12, 3]];
  //var down_sums   = [[5, 2, 5],[1, 14], [7, 2],[9, 12],   [6, 15], [11, 5],   [6, 15]];

  //var solver = new JapaneseSum();
  //console.log(solver.solve(across_sums, down_sums));
}());
// vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4
