scriptcraft-lsystems
====================

Fun with ScriptCraft &amp; L-systems

### To Install:

1. Create a new folder in CraftBukkit/js-plugins called __lsystems_.
2. Download scriptcraft-lsystems and place all the JS files into the directory you just created.
3. Start up your Bukkit server or if it is already running use the _reload_ command to reload plugins and correspondingly your updated JS files.

### Usage:

1. The L-systems JS files are uploaded when the plugin is uploaded so to start creating L-system structures simply type:

`/js tree()`

or 

`/js fun()`

to create default structures.

### Experimentation

The real fun begins when you start experimenting with different blocks, sizes, and generations.  Both the tree and fun class accept three arguments:

`/js tree(blockID,size,generations)`

For example,

`/js tree(17,200,15)`

will create a tree made of oak blocks that is 200 blocks in size using 15 generations.

`/js fun(10,50,4)`

will create a lava fractal 50 blocks in size using 4 generations.  You can find a complete list of Minecraft block IDs at [MinecraftInfo](http://www.minecraftinfo.com/idlist.htm).

### Warnings

Be careful with the size and generations parameters--the bigger those values are the more computationally intensive the structures become to generate.

### Thanks

Have fun and send any cool L-system scripts my way!

-c
