export const HELLO = (ref) => {

    let animations = []

    
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI/2.5, "-"]); 
    animations.push(["mixamorigRightArm", "rotation", "z", 0.5, "-"]); 
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI/1.33, "+"]); 

    ref.animations.push(animations);

    animations = []
    
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI/2.5, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI/2, "-"]);

    ref.animations.push(animations);

    animations = []

    animations.push(["mixamorigRightArm", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigRightArm", "rotation", "z", Math.PI/3, "+"]); 
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI/1.5, "+"]);

    ref.animations.push(animations);

    if(ref.pending === false){
        ref.pending = true;
        ref.animate();
    }

}