load($SCRIPT_DIR + "/lsystem.js");
Drone.extend('fun',function(width,length)
{
	var dr = new Drone();
    var d0 = Math.min(50, 200);
    var d;
    var ls = new Lsystem({
             F: function() { dr.fwd(d).box(8); },
             "+": function() { dr.turn(3).box(8);},
             "-": function() { dr.turn(1).box(8);}
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
	
	ls.generateN(3);
	ls.render();
	
    return this;
});