weight charts for nerds
=======================

Check out the demo by running a webserver in this directory:

    npx serve

It will display the UX available via the root directory.

The data displayed is obtained from `weight.csv`, which is `.gitignore`d
in this project.  The app will look for demo data in lieu of `weight.csv`,
in the `weight-demo.csv` file.

So, **your weight data is private**.
But also, **it's not backed up if you clone this repo**.
You know what to do ... (but don't ask me!)

The thinner chart below the taller chart is a selection picker.  Drag
the mouse across a range of dates and the taller chart will be 
re-rendered within that range.


https://pmuellr.github.io/weight/weight.html

You will need to run a web server to host these files, as they `fetch()`
the `.csv` file.  I use [`serve` from npm](https://www.npmjs.com/package/serve),
installed globally.  Run it from this directory.  

The default "build" script for this project in vsCode will launch `serve`,
so you can press `shift-command-B` to launch.
