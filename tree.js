load($SCRIPT_DIR + "/lsystem.js");
Drone.extend('tree',function(width,length)
{
	var s = [];
	var dr = new Drone();
    var d0 = Math.min(200, 200);
    var d = 4;
    var a = 1;
    var ls = new Lsystem({
                F: function() {
					for(var i =0;i<d;i++){
						dr.box(89).up(1);
					}
				},
                "+": function() { 
					for(var i =0;i<d;i++){
						dr.box(89).left(1);
					}
				},
                "-": function() { 
					for(var i =0;i<d;i++){
						dr.box(89).right(1);
					}
					
				},
                "[": function() { s.push({x:dr.x,y:dr.y,d:d,a:a}); },
                "]": function() { 
					var p = s.pop(); 
					dr.moveTo(p.x,p.y);
					d = p.d;
					a = p.a;
				}
               },
               [ {id:"F"},{id:"1"},{id:"F"},{id:"1"},{id:"F"},{id:"1"} ], 
               [ 
                 { p: [ {id:"0"},{dir:"^",id:"0"},{dir:".>",id:"0"} ], 
                   s: function() { return [{id:"0"}];}
                  },
                 { p: [ {id:"0"},{dir:"^",id:"0"},{dir:".>",id:"1"} ], 
                   s: function() { return [{id:"1"},[{id:"-"},{id:"F"},{id:"1"},{id:"F"},{id:"1"}]];}
                  },
                 { p: [ {id:"1"},{dir:"^",id:"0"},{dir:".>",id:"0"} ], 
                   s: function() { return [{id:"1"}];}
                  },
                 { p: [ {id:"1"},{dir:"^",id:"0"},{dir:".>",id:"1"} ], 
                   s: function() { return [{id:"1"}];}
                  },
                 { p: [ {id:"0"},{dir:"^",id:"1"},{dir:".>",id:"0"} ], 
                   s: function() { return [{id:"0"}];}
                  },
                 { p: [ {id:"0"},{dir:"^",id:"1"},{dir:".>",id:"1"} ], 
                   s: function() { return [{id:"1"},{id:"F"},{id:"1"}];}
                  },
                 { p: [ {id:"1"},{dir:"^",id:"1"},{dir:".>",id:"0"} ],
                   s: function() { return [{id:"1"}];}
                  },
                 { p: [ {id:"1"},{dir:"^",id:"1"},{dir:".>",id:"1"} ],
                   s: function() { return [{id:"0"}];}
                  },
                 { p: [ {id:"+"} ],
                   s: function() { return [{id:"-"}];}
                  },
                 { p: [ {id:"-"} ],
                   s: function() { return [{id:"+"}];}
                  }
               ],
              { F: "", "+": "", "-": "" }
              );
   
	ls.generateN(30);
	ls.render();
	
    return this;
});