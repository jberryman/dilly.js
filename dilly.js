// dilly.js 
// version: 0.1
// license: LICENSE (BSD3)
//
// ------------------------------
// This gave me a lot of grief, and I'm convinced the approach is much more
// clunky than it needs to be, but hopefully things should work as expected.
// ------------------------------
//
// CHANGES:
//     (initial release)
//
function withDelay(d){
    var bindings = {"test": 1},
        endCont = function(){},
        delay = typeof(d) === "number" ? d : 0;
    
    // capabilities offered in 'do' block:
    var doEnv = {
        // get or set delay:
        delay: function(d){
            if(d === undefined){
                return delay;
            } else {
                delay = d;
                return d;
            }
        },
        // retrieve the value of a bound loop "variable":
        var: function(nm){
            return bindings[nm];
        }
    }

    // superLoopStep is a function that performs a nested loop iteration and
    // returns a Bool indicating if we should run the body:
    function DLoop(superLoopStep){
        // the fact that loops like while(false) and forrange(1:0) might never
        // run, makes the initial case a bit messy. We define a helper
        function superStepGuard(f){
            return superLoopStep() ? f : function(){ return false }
        }
        return {
            do: function(f){
                function doL(){
                    // step loop first to support 'while'. This means first loop
                    // step in 'for' must initialize things and return true:
                    if( superLoopStep() ){
                        // call user-supplied function in 'doEnv' environment
                        f.call(doEnv);
                        // TODO: benchmark, and possibly call `doL` directly when delay === 0
                        setTimeout(doL , delay);
                    } else {
                        endCont();
                    }
                }
                doL();
            },

            // pass a function returning a boolean val
            while: function(pf){
                // initialize parent loop, returning a new superLoopStep with
                // while functionality rolled in
                var slsN = superStepGuard(function(){
                    // if while predicate returns True, signal go-ahead to loop body:
                    if ( pf.call(doEnv) ){
                        return true;
                    // otherwise run the next iteration of the outer-loop:
                    } else {
                        return superLoopStep();
                    }
                });
                return DLoop(slsN);
            },

            // from list comprehensions; skip loop iterations where predicate
            // returns false
            guard: function(pf){
                var slsN = function(){
                    if( superLoopStep() ){
                        if( pf.call(doEnv) ){
                            return true;
                        } else {
                            // TODO: this could exceed stack space
                            return slsN();
                        }
                    } else {
                        return false;
                    }
                }
                return DLoop(slsN);
            },

            // pass a string to be used as bound name, and just an array for a 
            // foreach-style loop, or two or three numbers for range-style loop.
            //
            // We'll take after ruby in that for 1..0 does nothing.
            for: function(nm , x , y , z){
                var slsN;
                // range-style:
                if(typeof(x) === "number" && typeof(y) === "number"){
                    var step, n0 = x, nN;
                    if(typeof(z) === "number"){
                        step = y - x;
                        nN = z;
                    } else {
                        step = 1;
                        nN = y;
                    }
                    var i = n0; // incremented and reset below
                                // will be out of range on last loop check
                    slsN = superStepGuard(function(){
                        if(i <= nN){
                            bindings[nm] = i;
                            i += step;
                            return true;
                        } else {
                            i = n0;
                            return superStepGuard(slsN)();
                        }
                    });
                // foreach style:
                } else {
                    var arr = x,
                        i = 0,
                        nN = arr.length - 1;
                    slsN = superStepGuard(function(){
                        if(i <= nN){
                            bindings[nm] = arr[i];
                            i++;
                            return true;
                        } else {
                            i = 0;
                            return superStepGuard(slsN)();
                        }
                    });
                }
                return DLoop(slsN);
            }
        }
    }
    // define a function that runs child loops, for initialization:
    var go = true,
        singletonLoop = function(){
            var b = go;
            go = false;
            return b;
        }
    o = DLoop(singletonLoop);
    // add a method to set final continuation, returning another DLoop object
    // but without `endingWith`
    o.endingWith = function(f){ 
        endCont = f;
        return DLoop(singletonLoop);
    }
    return o;
}
