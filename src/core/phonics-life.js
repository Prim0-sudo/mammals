export function phonicsLife(game){
 const life={animations:new Set(),cleanups:[],ended:false,paused:game.paused,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
 life.listen=(target,event,fn)=>{target.addEventListener(event,fn);life.cleanups.push(()=>target.removeEventListener(event,fn));};
 life.own=animation=>{if(life.paused)animation.pause();life.animations.add(animation);return animation;};
 life.setPaused=paused=>{life.paused=paused;life.animations.forEach(a=>a.paused(paused));};
 life.destroy=()=>{life.ended=true;life.cleanups.splice(0).forEach(fn=>fn());life.animations.forEach(a=>a.kill());life.animations.clear();};
 return life;
}
