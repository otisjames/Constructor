function get(id){ return document.getElementById(id);}
function timestamp()      {return new Date().getTime(); }
function random(min, max) {return (min + (Math.random() * (max - min))); }

function hide(id)       {get(id).style.display = 'none'; }
function show(id)       {get(id).style.display = 'block'; }

if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
								   window.mozRequestAnimationFrame ||
								   window.oRequestAnimationFrame ||
								   window.msRequestAnimationFrame ||
								   function(callback) {
									   window.setTimeout(callback, 1000 / 60);
								   };
}

var KEY = {ESC: 27, A: 65, F: 70, E: 69, P: 80, Z:90, X: 88, SPACE:32, LEFT:37, UP: 38, RIGHT:39, DOWN: 40},
    DIR  = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3, MIN: 0, MAX: 3 },
	plan,
	thud = new Audio("http://www.freesound.org/data/previews/215/215162_4027196-lq.mp3"),
	explosion = new Audio("explosionsfx.wav"),
	theme1 = new Audio("theme1.wav"),
	theme2 = new Audio("theme2.wav"),
	dx = 20,
    dy = 20,
	blocksize = 20,
	nx=15,
	ny=30,
	dropped = false,
	lefttoggle = true,
	righttoggle =true,
	uptoggle =true,
	downtoggle =true,
	slamtoggle = true,
	controlspeed = 100,
	pauseleft, pauseright, pauseup, pausedown;

var blocksprite = get('blocks');

	theme1.loop = true;

var blocks, 
	shapes,
	actions,
	playing,
	dt,
	current,
	next,
	step = 0.3;

var i = { id: 'i', size: 4, blocks: [0x4444, 0x0F00, 0x2222, 0x00F0], imgy: 0, imgx: [0,1,2,3], shape: [['n',1,0,'n',1,1,'n',1,2,'b',1,3],['b',0,1,'b',1,1,'b',2,1,'b',3,1],['n',2,0,'n',2,1,'n',2,2,'b',2,3],['b',0,2,'b',1,2,'b',2,2,'b',3,2]]};
var j = { id: 'j', size: 3, blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], imgy: 1, imgx: [0,1,2,3], shape: [['n',1,0,'n',1,1,'b',0,2,'b',1,2],['n',0,0,'b',0,1,'b',1,1,'b',2,1],['n',0,0,'b',1,0,'n',0,1,'b',0,2],['b',0,1,'b',1,1,'n',2,1,'b',2,2]]};
var l = { id: 'l', size: 3, blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], imgy: 2, imgx: [0,1,2,3], shape: [['n',1,0,'n',1,1,'b',2,1,'b',2,2],['n',0,1,'b',1,1,'b',2,1,'b',0,2],['b',0,0,'n',1,0,'n',1,1,'b',1,2],['n',0,2,'b',0,1,'b',1,1,'b',2,1]]};
var o = { id: 'o', size: 2, blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00], imgy: 3, imgx: [0,1,2,3], shape: [['n',0,0,'n',1,0,'b',0,1,'b',1,1],['n',0,0,'n',1,0,'b',0,1,'b',1,1],['n',0,0,'n',1,0,'b',0,1,'b',1,1],['n',0,0,'n',1,0,'b',0,1,'b',1,1]]};
var s = { id: 's', size: 3, blocks: [0x06C0, 0x8C40, 0x6C00, 0x4620], imgy: 4, imgx: [0,1,2,3], shape: [['n',1,1,'b',2,1,'b',0,2,'b',1,2],['n',0,0,'b',0,1,'n',1,1,'b',1,2],['n',1,0,'b',2,0,'b',0,1,'b',1,1],['n',1,0,'b',1,1,'n',2,1,'b',2,2]]};
var t = { id: 't', size: 3, blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], imgy: 5, imgx: [0,1,2,3], shape: [['b',0,1,'n',1,1,'b',2,1,'b',1,2],['n',1,0,'b',0,1,'n',1,1,'b',1,2],['n',1,0,'b',0,1,'b',1,1,'b',2,1],['n',1,0,'n',1,1,'b',2,1,'b',1,2]]};
var z = { id: 'z', size: 3, blocks: [0x0C60, 0x4C80, 0xC600, 0x2640], imgy: 6, imgx: [0,1,2,3], shape: [['b',0,1,'n',1,1,'b',1,2,'b',2,2],['n',1,0,'n',0,1,'b',1,1,'b',0,2],['b',0,0,'n',1,0,'b',1,1,'b',2,1],['n',2,0,'n',1,1,'b',2,1,'b',1,2]]};
var j3 = { id: 'j3', size: 2, blocks: [0x4C00, 0x8C00, 0xC800, 0xC400], imgy:7, imgx: [0,1,2,3], shape: [['n',1,0,'b',0,1,'b',1,1],['n',0,0,'b',0,1,'b',1,1],['n',0,0,'b',1,0,'b',0,1],['b',0,0,'n',1,0,'b',1,1]]};
var i3 = { id: 'i3', size: 2, blocks: [0x0E00, 0x4440, 0x0E00, 0x4440], imgy:8, imgx: [0,1,2,3], shape: [['b',0,1,'b',1,1,'b',2,1],['n',1,0,'n',1,1,'n',1,2],['b',0,1,'b',1,1,'b',2,1],['n',1,0,'n',1,1,'n',1,2]]};
var _2 = { id: '_2', size: 2, blocks: [0x8800, 0xC000, 0x4400, 0x0C00], imgy:9, imgx: [0,1,2,3], shape: [['n',0,0,'b',0,1],['b',0,0,'b',0,1],['n',1,0,'b',1,1],['b',0,1,'b',1,1]]};
var _1 = { id: '_1', size: 1, blocks: [0x8000, 0x8000, 0x8000, 0x8000], imgy:10, imgx: [0,1,2,3], shape: [['b',0,0],['b',0,0],['b',0,0],['b',0,0]]};
	
var pieces = [];
var parts = [];

window.addEventListener("load", function(){
	theme2.play();}, false);

function occupied(type, x, y, dir) {
  var result = false;
  eachblock(type, x, y, dir, function(x, y) {
	if ((x < 0) || (x >= nx) || (y < -2) || (y >= ny) || getBlock(x,y))
	  result = true;
  });
  return result;
}

function unoccupied(type, x, y, dir) {
  return !occupied(type, x, y, dir);
}

function eachblock(type, x, y, dir, fn) {
  var bit, result, row = 0, col = 0, blocks = type.blocks[dir];
  for(bit = 0x8000 ; bit > 0 ; bit = bit >> 1) {
	if (blocks & bit) {
	  fn(x + col, y + row);
	}
	if (++col === 4) {
	  col = 0;
	  ++row;
	}
  }
}

function blockset(){
	var type, color;
	if (parts[0]== null){
		//getPartsRoutine(plan);
		if (pieces[0]== null)
			pieces = [i,i,i,j,j,j,j,j,l,l,l,l,l,s,s,s,s,t,t,t,t,z,z,z,z,j3,j3,j3,j3,i3,i3,i3,i3,_2,_2,_1,_1];
 		type = pieces.splice(random(0, pieces.length-1), 1)[0];//;
 		color=Math.floor(Math.random()*4)
		try{return { type: type, dir: DIR.UP, x: Math.round(random(0, nx - type.size)), y: -2, color: color };
		}catch(e){return {type: type, dir: DIR.UP, x: Math.round(random(0, nx - 4)), y: -2, color: color }}
	}else{
		type = parts.shift(); 
		color = parts.shift();
		try{return { type: type, dir: DIR.UP, x: Math.round(random(0, nx - type.size)), y: -2, color: color };
		}catch(e){return {type: type, dir: DIR.UP, x: Math.round(random(0, nx - 4)), y: -2, color: color }}
	}
}



function run(){
	setup();
	drawshimmer();
	playing=true;
	document.addEventListener('keydown', keydown, false);
	document.addEventListener('keyup', keyRelease, false);
	
	var last = now = timestamp();
	function frame(){
		now= timestamp();
		update(Math.min(1, (now - last) / 1000.0));
		draw();
		last = now;
		requestAnimationFrame(frame, canvas);
	}
	
	reset();
	frame();
}

function update(idt){
	if (playing) {
		handle(actions.shift());
		dt = dt + idt;
		if (dt > step) {
	  		dt = dt - step;
	  		drop();
			if(detect()){thud.muted=false;thud.play();}
		} 
	}
}

function setup(){
	initShimmerGrid();
	cnvs = get('canvas');
	ctx = cnvs.getContext('2d');
	cnvs.width=nx*dx;
	cnvs.height=ny*dy;
	piecelayer = get('piecelayer');
	piecelayerctx = piecelayer.getContext('2d');
	piecelayer.width=nx*dx;
	piecelayer.height=ny*dy;
	shadowcnvs = get('shadow');
	shadowctx = shadowcnvs.getContext('2d');
	shadowcnvs.width=nx*dx;
	shadowcnvs.height=ny*dy;
	ucnvs = get('upcoming');
	uctx = ucnvs.getContext('2d');
	ucnvs.width=100;
	ucnvs.height=600;
}

function reset(){
	dt = 0;
	plan = plans.plan1;
 	clearActions();
 	clearBlocks();
 	setCurrentPiece(next);
 	//setNextPiece();
	ctx.clearRect(0, 0, cnvs.width, cnvs.height);
	piecelayerctx.clearRect(0,0,piecelayer.width,piecelayer.height);
	uctx.clearRect(0, 0, ucnvs.width, ucnvs.height);
	shadowctx.clearRect(0, 0, shadowcnvs.width, shadowcnvs.height);
	clearshimmer();
	clearArray(shimmerArray);
	//shimmer();
	drawPlans();
}

var plans = {
	
	plan1 :[

[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[1],[1],[1],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[1],[1],[1],[1],[1],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[1],[1],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],],
	
	plan2 :[

[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[1],[1],[1],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[1],[1],[1],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[1],[0],[1],[1],[1],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[1],[1],[1],[0],[1],[0],[0],[0],[0]],
[[0],[0],[0],[0],[1],[1],[1],[0],[1],[1],[1],[0],[0],[0],[0]],
[[0],[0],[0],[0],[1],[0],[1],[1],[1],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[1],[1],[1],[0],[1],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0]],],
	
	plan3 :[

[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[1],[1],[1],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[1],[0],[1],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[0],[0],[1],[1],[1],[0],[0],[0],[0],[0],[0],[0]],
[[0],[0],[0],[1],[1],[1],[0],[1],[1],[1],[0],[0],[0],[0],[0]],
[[0],[0],[0],[1],[0],[1],[1],[1],[0],[1],[0],[0],[0],[0],[0]],
[[0],[0],[0],[1],[1],[1],[0],[1],[1],[1],[0],[0],[0],[0],[0]],
[[0],[0],[0],[1],[0],[1],[1],[1],[0],[1],[0],[0],[0],[0],[0]],
[[0],[0],[0],[1],[1],[1],[0],[1],[1],[1],[0],[0],[0],[0],[0]],
[[0],[0],[0],[1],[0],[1],[1],[1],[0],[1],[0],[0],[0],[0],[0]],
[[0],[0],[0],[1],[0],[1],[0],[1],[0],[1],[0],[0],[0],[0],[0]],
[[0],[0],[0],[1],[1],[1],[0],[1],[1],[1],[0],[0],[0],[0],[0]],]
	
};

function drawPlans(){
	shadowctx.fillStyle = '#AA99AA';
	for(var i=0;i<plan.length;i++){
		var y = i;
		for(var e=0;e<plan[i].length;e++){
			var x = e;
			if(plan[i][e]==1){
				shadowctx.fillRect(x*dx,y*dy,dx,dy);
			}
		}
	}		
}

function checkPlans(){
	var check =false;
	for(var y = 0;y<plan.length;y++){
		for(var x=0;x<plan[y].length;x++){
			if((plan[y][x]==1&&getBlock(x,y))){
				check=true;
				console.log("found match y:"+y+" x:"+x);
			}else if(plan[y][x]==1&&getBlock(x,y)==null){
				check=false;
				console.log("incomplete at "+x+","+y);
				return;
			}else{
				console.log("checked y:"+y+" x:"+x);
				check=true;
			}
		}
	}
	if(check==true){
		console.log("win");
		win();	
	}
}

function win(){
	//removeBlocks();
	clearArray(shimmerArray);
	clearshimmer();
	console.log("removeblocks");
	for(var y =0;y<plan.length;y++){
		for(var x =0;x<plan[y].length;x++){
			if(plan[y][x]==1){
				console.log("clear "+x+","+y);
				blocks[x][y]=null;
				piecelayerctx.clearRect(x*dx,y*dy,dx,dy);
				shadowctx.clearRect(x*dx,y*dy,dx,dy);
			}
		}
	}
	explosion.play();
	switch(plan){
		case plans.plan1: plan = plans.plan2; break;
		case plans.plan2: plan = plans.plan3; break;
		default: plan=plans.plan1;
	}
	//plan=plans.plan2;
	drawPlans();
}
		

function initShimmerGrid(){
	for(var i=0;i<nx;i++){
		for(var e=0;e<ny;e++){
			var div = document.createElement('div');
			div.id="div"+i+"_"+e;
			div.style.position="absolute";
			div.style.top=e*dy;//+84;
			div.style.left=i*dx;//+24;
			div.style.width=dx;
			div.style.height=dy;
			div.style.backgroundColor="#FFFFFF";
			div.style.opacity=0.0;
			var element = get('shimmer');
			element.appendChild(div);
		}
	}	
}

function clearArray(a){
	for(var i=0;i<ny;i++){
		a[i]=new Array;
		for(var e=0;e<nx;e++){
			a[i][e]=0;
		}
	}
}

var shimmerArray = new Array;

function shimmer(){
	for(var i=0;i<plan.length;i++){
		for(var e=0;e<plan[i].length;e++){
			if(plan[i][e]==1&&getBlock(e,i)){
				shimmerArray[i][e]=1;
			}
			else{
				shimmerArray[i][e]=0;
				//console.log("i:"+i+" e:"+e);	
			}
		}
	}
}

var shimmerstep=0;
var eraseshimmerstep=0;
var eraseshimmer=false;

function drawshimmer(){
	for(var e=0;e<shimmerArray.length;e++){
		for(var n=0;n<shimmerArray[e].length;n++){
			if(n+e==shimmerstep&&shimmerArray[e][n]==1){//
				var div = get("div"+n+"_"+e);
				div.style.opacity=0.6;
			}
		}
	}
	shimmerstep++;//
//	if(shimmerstep<10){
//		setTimeout(drawshimmer,50);
//	}else if(eraseshimmer=false){
//		setTimeout(drawshimmer,50);
//		eraseshimmer=true;
//	}else 
	if(shimmerstep<45){
		if(eraseshimmer===false){
			setTimeout(eraseShimmer,200);
			eraseshimmer=true;
		}
		setTimeout(drawshimmer,50);
	}else{
		shimmerstep=0;
		eraseshimmer=false;
	}
//	if(x<14&&y<29){
//		if(y==0){
//			x++;
//			setTimeout(function(){drawshimmer(x,y);},1000/60);
//		}
//		y++
//		setTimeout(function(){drawshimmer(x,y);},500/30);
//	}
}

function eraseShimmer(){
	for(var e=0;e<shimmerArray.length;e++){
		for(var n=0;n<shimmerArray[e].length;n++){
			if(n+e==eraseshimmerstep&&shimmerArray[e][n]==1){//
				var div = get("div"+n+"_"+e);
				div.style.opacity=0.0;
			}
		}
	}
	eraseshimmerstep++;
	if(eraseshimmerstep<45){
		setTimeout(eraseShimmer,50);
	}else{
		eraseshimmerstep=0;	
		setTimeout(drawshimmer,50);
	}
}

function clearshimmer(){
	for(var e=0;e<shimmerArray.length;e++){
		for(var n=0;n<shimmerArray[e].length;n++){
				var div = get("div"+n+"_"+e);
				div.style.opacity=0.0;
		}
	}
}

function keydown(ev) {
	var handled = false;
	function left(){actions.push(DIR.LEFT)}
	function right(){actions.push(DIR.RIGHT)}
	function up(){actions.push(DIR.UP)}
	function down(){actions.push(DIR.DOWN)}
	
	function slam(){if(move(DIR.DOWN)){movements='down';actions.push(DIR.DOWN);setTimeout(slam(),90); thud.muted=false;thud.play();}}
	
	if (playing) {
		switch(ev.keyCode) {
			case KEY.LEFT: 
		    	if(lefttoggle){ 
			    	left();
			    	if(detect()){
						pauseleft = setInterval(left, controlspeed*2);
			    	}else{
						pauseleft = setInterval(left, controlspeed);
			    	}
					handled = true;  
					lefttoggle=false;
				}        
				break;
			case KEY.RIGHT:
		  		if(righttoggle){
					right(); 
					if(detect()){
						pauseright = setInterval(right, controlspeed*2);
					}else{
						pauseright = setInterval(right, controlspeed);
					} 
					handled = true; 
					righttoggle=false;
				}        
				break;
          	case KEY.UP:     if(uptoggle)   {up(); pauseup = setInterval(up, controlspeed*2);  handled = true;        uptoggle=false;}    break;
         	case KEY.DOWN:   if(downtoggle) {down(); pausedown = setInterval(down, controlspeed);  handled = true;   downtoggle=false;}       break;
         	case KEY.ESC:    reset();                      handled = true; break;
		 	case KEY.SPACE:  if(slamtoggle) {slam(); slamtoggle = false; handled = true;} break;
        	}
	}
	if (ev.keyCode == KEY.P) {
        	if(playing){ 
				theme2.pause();
				show("pause_screen"); 
				playing=false;
			}else{
				theme2.play();
				hide("pause_screen"); 
				playing = true;
			}
       		handled = true;
    	}
   	if (handled)
        ev.preventDefault();
}

function keyRelease(ev) {
	switch(ev.keyCode) {
		case KEY.LEFT:   clearInterval(pauseleft);  lefttoggle = true;  break;
        case KEY.RIGHT:  clearInterval(pauseright);righttoggle = true;  break;
        case KEY.UP:     clearInterval(pauseup);      uptoggle = true;  break;
        case KEY.DOWN:   clearInterval(pausedown);  downtoggle = true;  break;
		case KEY.SPACE:  slamtoggle = true; break;
	}
}

function getBlock(x,y)          { return (blocks && blocks[x] ? blocks[x][y] : null); }
function setBlock(x,y,type)     { blocks[x] = blocks[x] || []; blocks[x][y] = type; invalidate(); }
function clearBlocks()          { blocks=[]; invalidate(); }
function clearActions()         { actions = []; }
function setCurrentPiece(piece) { current = piece || blockset(); invalidate();     }
function setNextPiece()         { next  = blockset(); invalidateNext(); }

function handle(action) {
	switch(action) {
		case DIR.LEFT:  move(DIR.LEFT);  break;
		case DIR.RIGHT: move(DIR.RIGHT); break;
		case DIR.UP:    rotate();        break;
		case DIR.DOWN:  if(detect()){ thud.play() ;} drop();  break;
	}
}

var invalid = {};

function invalidate()         { invalid.court  = true; }
function invalidateNext()     { invalid.next   = true; }
function invalidatePlan()     { invalid.plan  = true; }

function move(dir) {
     var x = current.x, y = current.y, progress;	 
     switch(dir) {
        case DIR.RIGHT: x = x + 1; movements='right'; dropped = false; break;
        case DIR.LEFT:  x = x - 1; movements='left'; dropped = false; break;
        case DIR.DOWN:  y = y + 1; break;
     }
     if (unoccupied(current.type, x, y, current.dir)) {
        current.x = x;
        current.y = y;
        invalidate();
        return true;
     }
     else {
        return false;
     }
	 
}

function quad(progress){
	return Math.pow(progress, 3);
}

function rotate(dir) {
	movements='down';
	var newdir = (current.dir == DIR.MAX ? DIR.MIN : current.dir + 1);
	if (unoccupied(current.type, current.x, current.y, newdir)) {
        	current.dir = newdir;
        	invalidate();
     	}
	if (occupied(current.type, current.x -1, current.y, newdir)&&unoccupied(current.type, current.x+1, current.y, newdir)){
		move(DIR.RIGHT);
		current.dir = newdir;
		move(DIR.LEFT);
        	invalidate();
	 }
	 if (occupied(current.type, current.x +1, current.y, newdir)&&unoccupied(current.type, current.x-1, current.y, newdir)){
		move(DIR.LEFT);
		current.dir = newdir;
		move(DIR.RIGHT);
        	invalidate();
	 }
}

function detect(){
	if (occupied(current.type, current.x, current.y + 1, current.dir) && dropped == false) {
        return true;
		dropped = true;
     }
     else {
        return false;
		dropped = false;
     }
}

function removeBlock(x,y){
	setBlock(x,y,null);
	piecelayerctx.clearRect(x*dx,y*dy,dx,dy);
}

function drop() {
     if (!move(DIR.DOWN)) {
			nextblock();
     }else{movements='down';}
}

function nextblock(){
	clearActions();
	drawPiece(piecelayerctx, current.type, current.x, current.y, current.dir, current.color);
	dropPiece();
	shimmer();
	//searchGrid();
	setCurrentPiece(next);
	setNextPiece();
	checkPlans();
	//canceled=false;
	if (occupied(current.type, current.x, current.y, current.dir)) {
	  reset();
	}
}

function dropPiece() {
     eachblock(current.type, current.x, current.y, current.dir, function(x, y) {
        setBlock(x, y, current.type);
     });
};

function draw() {
	ctx.save();
	ctx.lineWidth = 1;
	drawCourt();
	//drawNext();
	ctx.restore();
}
	
function drawCourt() {
	if (invalid.court) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (playing)
			drawPiece(ctx, current.type, current.x, current.y, current.dir, current.color);
	}
}

function drawNext() {
	if (invalid.next) {
		try{var padding = (nu - next.type.size) / 2;}catch(e){var padding = (nu - 4) / 2;}
		uctx.save();
		uctx.translate(0.5, 0.5);
		uctx.clearRect(0, 0, nu*dx, nu*dy);
		drawPiece(uctx, next.type, padding, padding, next.dir, next.color);
		uctx.restore();
		invalid.next = false;
	}
}

//function drawPlans(plan){
//	pctx.clearRect(0, 0, plansize, plansize);
//	var plansprite = get('plans');
//	try{
//	pctx.drawImage(plansprite, 0, plan*plansize, plansize, plansize, 0, 0, plansize, plansize);
//	}catch(e){}
//}

function drawPiece(ctx, type, x, y, dir, color) {
	eachblock(type, x, y, dir, function(x, y) {
		try{
    		ctx.drawImage(blocksprite, blocksize*color, 0, blocksize, blocksize, x*dx, y*dy, blocksize, blocksize);
  		}catch(e){}
  	});
}

run();
