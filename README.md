dilly.js is a silly lib for loops with delays in JavaScript.

## Motivation

We might be implementing a game or simulation and want to write our code
as one or several nested loops, with a delay on the inner loop like

    while (playing) {
        update_monsters();
        update_display();
        sleep 10;
    }
    exit_stuff();

...but JavaScript only provides the non-blocking 
`[setTimeout](https://developer.mozilla.org/en-US/docs/window.setTimeout)`
which necessitates an inversion of control and makes our simple algorithm
clumsy to write and very difficult to read.

I wanted this while implementing [this](http://jberryman.github.com/fly-mis/).

## Usage

We provide the single function `withDelay`, and things work functionally-
similar to jQuery or list comprehensions. Here are some examples:

### Examples

A simple "while" game loop that gets progressively faster. When done, the script
continues with `exit_stuff()`.

    // "while" is passed a predicate that returns a Bool, so
    var b = true,
        playing = function(){ return b };

    withDelay(100).endingWith(exit_stuff)
        .while(playing)
            .do(function(){
                update_monsters();
                update_display();
        
                var d = this.delay();
                this.delay(d-1);
            })
    

Nested "foreach" and "forRange" style loops, running with no delay and without
any explicit continuation (i.e. control is immediately passed to `other_stuff`
while the loop continues running in the background).

Range/step loop behavior esoterica should follow ruby's behavior.

    withDelay()
        .for("x",1,2)                // range: 1, 2
            .for("y",1,3 , 8)        // range(with step of 2): 1, 3, 5, 7
                .for("z",['a','b'])  // foreach: 'a', 'b'
                    .do(function(){ 
                        console.log(this.var("x"), 
                                    this.var("y"), 
                                    this.var("z"));
                     });
    other_stuff;


A list comprehension-style `guard` function:

    withDelay(1000).endingWith( function(){console.log("done")} )
        .for("x",1,5)               
            .for("y",[1,2,3,4,5])
                // filter parent loop iterations where `x+y == 5`
                .guard(function(){
                        return (this.var("x") + this.var("y")) === 5})
                    .do(function(){ 
                        console.log(this.var("x"), this.var("y")) 
                        // OUTPUTS: (1,4)... (2,3)... (3,2)... (4,1)... "done" 
                     })


## Limitations and caveats

- delays only happen *after* each iteration of the inner `do` block
- we can't interleave bits of code before or after a nested child loop (again
  what we're doing is closer in spirit to list comprehensions than proper
  loops)
- dictionary of "bound" names works in braindead fashion, "scoping" might be strange
- no implementation for `break/continue`; see if you can do what you need with
  `guard`

Please see the code for the true story and submit pull-requests to help improve 
documentation or add/adjust functionality if you find this useful.
