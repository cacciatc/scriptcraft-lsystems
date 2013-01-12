load($SCRIPT_DIR + "/lsystem.js");
Drone.extend('fun',function(block,size,generations){
	var dr = new Drone();
    var d0 = (size  || 50);
	var b  = (block || 1);
    var d;
    var ls = new Lsystem({
             F: function() { dr.fwd(d).box(b); },
             "+": function() { dr.turn(3).box(b);},
             "-": function() { dr.turn(1).box(b);}
           }, 
           [ {id: "F"},{id: "-"},{id: "F"},{id: "-"},{id: "F"},{id: "-"},{id: "F"} ], 
           [ 
             { p: [ {id: "F"} ], 
               s: function() { return [{id:"F"},{id:"F"},{id:"-"},{id:"F"},{id:"-"},
                                       {id:"-"},{id:"F"},{id:"-"},{id:"F"}];} }
           ]
           );
    ls.beforeRender = function () {
      d = d0 * (1 / Math.pow(3, ls.generation));
    };
	
	ls.generateN(generations || 3);
	ls.render();
	
    return this;
});
