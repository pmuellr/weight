weight charts for nerds
=======================

Simple web page that displays info on your weight collected in a
`weight.csv` file.  That file should have two "columns" - `date` and
`weight`.

You will need to run a web server to host these files, as they `fetch()`
the `.csv` file.  I use [`serve` from npm](https://www.npmjs.com/package/serve),
installed globally.  Run it from this directory.  

The default "build" script for this project in vsCode will launch `serve`,
so you can press `shift-command-B` to launch.

The file `weight.csv` is actually listed in the `.gitignore` file, so 
that you won't accidentally upload your weight data somewhere.  The web
page will load `weight-demo.csv` (generated via a random walk) if it 
can't load `weight.csv`.  And that's what you'll see at the demo page:

https://pmuellr.github.io/weight/weight.html

The thinner chart below the taller chart is a selection picker.  Drag
the mouse across a range of dates and the taller chart will be 
re-rendered within that range.  You can then drag that range around.
Would be nice if you could expand/contract the range - but this is all
built-in Vega-Lite stuff, so ... we'll get it when we get it, for free.
Be patient.
