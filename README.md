scriptcraft-lsystems
====================

Fun with ScriptCraft &amp; L-systems

### To install:

1. Replace the drone.js file here with the one that comes with ScriptCraft (this drone.js has a moveTo method and exposes its x & y coords, which are all needed for push/popping turtle state).
2. Place the lsystem.js file and the two example files in your ScriptCraft file dir (you create this when following the ScriptCraft installation instructions).

### Usage:

1. Load either the fun or tree js file.
2. Call the fun or tree class.

Typing

`/js new tree()`

or 

`/js new fun()`

will create default structures.

### Experimentation

The real fun begins when you start experimenting with different blocks, sizes, and generations.  Both the tree and fun class accept three arguments:

`/js new tree(block,size,generations)`

For example,

`/js new tree(17,200,15)`

will create a tree made of oak blocks that is 200 blocks in size using 15 generations.

`/js new fun(10,50,4)`

will create a lava fractal 50 blocks in size using 4 generations.  You can find a complete list of Minecraft block IDs at [MinecraftInfo](http://www.minecraftinfo.com/idlist.htm).

### Warnings

Be careful with the size and generations parameters--the bigger those values are the more computationally intensive the structures become to generate.

### Thanks

Have fun and send any cool L-system scripts my way!

-c
