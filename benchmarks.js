var t_start, t_done;
var answer = 0;

// ---------------------
// answer:  1020000 in seconds:  0.029999971389770508
function benchDilly(){
    console.log("Starting!");
    t_start = new Date().getTime() / 1000;
    withDelay().endingWith(report)
        .for("x",1,100)                
            .for("y",1,3 , 100)       
                .for("z",[1,2])
                    .do(function(){ 
                        answer+= (this.var("x") + this.var("y") + this.var("z"));
                     });
}
function report(){
    t_done = new Date().getTime() / 1000;
    console.log("answer: ", answer, "in seconds: ", t_done - t_start);
}

// ---------------------
// answer:  1020000 in seconds:  0.003999948501586914
function benchVanilla(){
    console.log("Starting!");
    t_start = new Date().getTime() / 1000;

    for(x=1; x<=100; x++){
        for(y=1; y<=100; y+=2){
            for(z=1; z<=2; z++){
                    answer+= (x + y + z)
            }
        }
    }

    report();
}
