// // function withDelay(d){
// //     var delay = typeof(d) === "number" ? d : 0;

// //     // ...
// //     function DDo(){
// //         this.cont = function(f){
// //         }
// //         this.
// //     }
// //     // the loop object
// //     function DLoop(d){
// //         this._contStack = [];
// //         //...

// //         this.guard = function(p){
// //         }
// //         this.for = function(x,y){
// //             if (typeof(x) === "function" && typeof(y) == "function"){
// //                 // c-style for loop:
// //             } else {
// //                 // else assume x is an initialized variable, and y is an array
// //             }
// //         }
// //         this.while = function(x){
// //             // turn a Bool variable or predicate into a predicate:
// //             var p;
// //             if (typeof(x) === "function"){
// //                 p = x;
// //             } else {
// //                 p = function(){ return x }
// //             }
// //         }
// //         // this returns only the continuation method:
// //         this.do = function(f){
// //         }
// //     } // end DLoop obj

// // }

// // first let's play with list basic comprehensions:
// // function bind(x,arr){
// // } 

// // TODO: test, then try adding: delay, cont, this.get/setDelay
// // non-general mockup:
// function withDelayX(d){
//     return {
//         for: function(v,xs){
//             return {
//                 for: function(v0,xs0){
//                     return {
//                         do: function(f){
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

// function tfor(pv,updv , f , c){
//     if( pv() ){
//         f();
//         updv();
//         setTimeout(function(){ tfor(pv,updv,f,c) } , 1000);
//     } else {
//         c();
//     }
// }
// // now use 'do' and 'cont'
// function tfor0(pv,updv){
//     return {
//         do: function(f, c){
//             var self = this;
//             if( pv() ){
//                 f();
//                 updv();
//                 setTimeout(function(){ self.do(f,c) } , 1000);
//             } else {
//                 if(typeof(c) === "function") c();
//             }
//         }
//     }
// }
// // cool, now make it recursive to any depth:
// function withDelayT(d){
//     function DLoop(cont){
//         return {
//             // TODO: this calls 'cont' in 'else', which will either be
//             // an earlier 'for' continuation, OR return an object:
//             // { cont: function(f){ f() }
//             //
//             // NO: won't work. Instead, we might have to pass continuation
//             // into `withDelay` directly.
//             //
//             // OR: for child of `withDelay` add optional `andContinuingWith`
//             do: function(f, c){
//                 var self = this;
//                 if( pv() ){
//                     f();
//                     updv();
//                     setTimeout(function(){ self.do(f,c) } , d);
//                 } else {
//                     if(typeof(c) === "function") c();
//                 }
//             },
//             for: function(pv,updv){
//             }
//         }
//     }
// }

// // BROKEN: we can't return from within setTimeout
// // function test(){
// //     var t = {
// //         cont: function(f){ f() }
// //     }
// //     console.log('start');
// //     setTimeout(function(){ return t }, 1000);
// // }


// // testing two-phase thing:
// function withDelay(d){
//     // DEPR: the final continuation, possibly modified in a child 'endingWith'
//     //var contLast = function(){};
//     function DLoop(cont){
//         return {
//             do: function(f){
//                 f();
//                 setTimeout(cont , d);
//                 // var self = this;
//                 // if( pv() ){
//                 //     f();
//                 //     updv();
//                 //     setTimeout(function(){ self.do(f,c) } , d);
//                 // } else {
//                 //     if(typeof(c) === "function") c();
//                 // }
//             },
//             for: function(pf,updf){
//                 var c = function(){
//                     if( pf() ){
//                     cont();
//                 }
//                 return DLoop(c);
//             }
//         }
//     }
//     // loop and 'do' blocks called as children will end with a noop continuation:
//     o = DLoop(function(){});
//     // add a method to set final continuation, returning another DLoop object
//     // but without `endingWith`
//     o.endingWith = function(f){ return DLoop(f) }
//     return o;
// }
// // THEN, make DLoop proper object, with updateable 'delay' as method of 'do'
// // THEN, add 'foreach' and 'while'
// // THEN play with passing a dictionary of "bound" names


// // -----  Different approach:
// // testing two-phase thing:
// function withDelay(d){
//     var bindings = {};
//     function DLoop(cont){
//         return {
//             do: function(f){
//                 f();
//                 setTimeout(cont , d);
//             },
//             for: function(pf,updf){
//                 // 'do' continuation
//                 var c = function(dcont){
//                     if( pf() ){
//                     cont();
//                 }
//                 return DLoop(c);
//             }
//         }
//     }
//     // loop and 'do' blocks called as children will end with a noop continuation:
//     o = DLoop(function(){});
//     // add a method to set final continuation, returning another DLoop object
//     // but without `endingWith`
//     o.endingWith = function(f){ 
//         return DLoop(function(g){ ...f }) 
//     }
//     return o;
// }

// BACK UP: define in terms of a single "outer" for:
// CONSIDER: we want a method 'this.setDelay', so it might make sense to have the outer function be 'endingWith'
//           ...actually I think we need to use 'call' or 'apply'
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
        return {
            do: function(f){
                function doL(){
                    if( superLoopStep() ){
                        // call user-supplied function in 'doEnv' environment
                        f.call(doEnv);
                        setTimeout(doL , delay);
                    } else {
                        endCont();
                    }
                }
                doL();
            },
            // pass a function returning a boolean val
            while: function(pf){
                // roll a new superLoopStep:
                var slsN = function(){
                    // if while predicate returns True, signal go-ahead to loop body:
                    if ( pf() ){
                        return true;
                    // otherwise run the next iteration of the outer-loop:
                    } else {
                        return superLoopStep();
                    }
                }
                return DLoop(slsN);
            },
            // pass a string to be used as bound name, and just an array for a 
            // foreach-style loop, or two or three numbers for range-style loop:
            for: function(nm , x , y , z){
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
                // foreach style:
                } else {

                }
            }
        }
    }
    o = DLoop(function(){ return false });
    // add a method to set final continuation, returning another DLoop object
    // but without `endingWith`
    o.endingWith = function(f){ 
        endCont = f;
        return DLoop(function(){ return false });
    }
    return o;
}


// THEN: while is stupid in this setting: instead do foreach and range-style for
// THEN, make DLoop proper object, with updateable 'delay' as method of 'do'
// THEN, add 'foreach' and 'while'
// THEN play with passing a dictionary of "bound" names

