load(__folder + "lsystem.js");

Drone.extend('fun', function(blockID,size,generations)
{
	var dr = new Drone();
	
    size    = size    == null ? 50 : size;
	blockID = blockID == null ? 1  : blockID;
	generations = generations == null ? 3 : generations;
	
    var d;
    var ls = new Lsystem({
             F: function()   {
				 dr.fwd(d).box(blockID);
			 },
		     "+": function() { 
				 dr.turn(3).box(blockID);
			 },
             "-": function() { 
				 dr.turn(1).box(blockID);
			 },
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
	
	ls.generateN(generations);
	ls.render();

	return this;
});

