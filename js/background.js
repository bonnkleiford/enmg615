/* =========================================================================
   ENMG 615 — Animated hero background
   -------------------------------------------------------------------------
   Draws a quiet, animated "graphical method" optimization plot behind the
   hero title: a few constraint lines, a shaded feasible region, and a
   dashed objective-function line that sweeps across it - the same picture
   you'd draw on a whiteboard to solve a 2-variable LP by hand (see Week 6,
   "Graphical Method and Simplex Method," in the schedule below).

   This is plain <canvas> + JavaScript, not a video or GIF file, which
   keeps the page small and fast to load, and easy to re-color (see the
   CONFIG block right below) instead of shipping a large image asset.

   TO REMOVE THIS EFFECT ENTIRELY:
     1. Delete this file.
     2. Delete the <canvas id="hero-canvas"> line in index.html.
     3. Delete the <script src="js/background.js"> line in index.html.
   The page works fine without it - the hero just falls back to the plain
   green gradient defined in css/style.css.
   ========================================================================= */

(function () {

  /* -----------------------------------------------------------------------
     CONFIG
     Tweak these to change how the graph looks and moves. Coordinates for
     the grid/lines are given as fractions of the canvas (0 = left/bottom
     edge, 1 = right/top edge), so the drawing always fits the hero no
     matter the screen size.
     ----------------------------------------------------------------------- */
  var CONFIG = {
    gridColor: 'rgba(255, 255, 255, 0.07)',   // faint graph-paper grid
    gridStep: 0.06,                            // spacing between grid lines (fraction of width)

    axisColor: 'rgba(255, 255, 255, 0.25)',    // the two axis lines

    // Each constraint is a straight line from point A to point B
    // (fractions of canvas width/height, measured from bottom-left).
    // These three roughly recreate a typical "3-constraint" feasible
    // region like the ones drawn in class.
    constraints: [
      { from: [0.00, 0.62], to: [0.46, 0.00], color: 'rgba(231, 243, 236, 0.70)' },
      { from: [0.00, 0.95], to: [0.34, 0.00], color: 'rgba(255, 255, 255, 0.60)' },
      { from: [0.00, 0.42], to: [0.64, 0.00], color: 'rgba(231, 243, 236, 0.55)' }
    ],
    lineWidth: 1.6,

    feasibleRegionColor: 'rgba(231, 243, 236, 0.16)', // fill of the shaded feasible region

    // The dashed "objective function" line that sweeps across the region.
    // sweepSlope is in pixel-space (how many pixels down for each pixel
    // right) - positive values slope down-to-the-right, matching the
    // constraint lines above.
    sweepColor: 'rgba(255, 255, 255, 0.55)',
    sweepDash: [6, 6],
    sweepSlope: 1.15,
    sweepSpeed: 0.00028,     // how fast it travels back and forth, per millisecond
    sweepWidth: 1.4
  };

  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return; // canvas was removed from the page - nothing to do

  var ctx = canvas.getContext('2d');
  var hero = canvas.closest('.hero');
  var animationFrameId = null;
  var startTime = null;

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  // Converts a fractional [x, y] point (0-1, measured from the bottom-left)
  // into real pixel coordinates on the canvas.
  function toPixels(point) {
    return [
      point[0] * canvas.width,
      canvas.height - point[1] * canvas.height
    ];
  }

  function drawGrid() {
    ctx.strokeStyle = CONFIG.gridColor;
    ctx.lineWidth = 1;

    for (var x = 0; x <= 1; x += CONFIG.gridStep) {
      ctx.beginPath();
      ctx.moveTo(x * canvas.width, 0);
      ctx.lineTo(x * canvas.width, canvas.height);
      ctx.stroke();
    }
    for (var y = 0; y <= 1; y += CONFIG.gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y * canvas.height);
      ctx.lineTo(canvas.width, y * canvas.height);
      ctx.stroke();
    }
  }

  function drawAxes() {
    ctx.strokeStyle = CONFIG.axisColor;
    ctx.lineWidth = 1.5;

    // Y axis (left edge)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    // X axis (bottom edge)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
  }

  function drawConstraints() {
    CONFIG.constraints.forEach(function (line) {
      var a = toPixels(line.from);
      var b = toPixels(line.to);

      ctx.strokeStyle = line.color;
      ctx.lineWidth = CONFIG.lineWidth;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    });
  }

  // Shades the feasible region: the area under ALL constraint lines at once
  // (a simple stand-in for "satisfies every constraint"), which is the
  // region a graphical-method solve would shade in on paper.
  function drawFeasibleRegion() {
    ctx.fillStyle = CONFIG.feasibleRegionColor;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    // Walk left-to-right, taking the lowest (most restrictive) boundary
    // height among all constraints at each x position.
    var steps = 40;
    for (var i = 0; i <= steps; i++) {
      var xFrac = i / steps;
      var minYFrac = 1; // start at the top, then narrow down

      CONFIG.constraints.forEach(function (line) {
        var x1 = line.from[0], y1 = line.from[1];
        var x2 = line.to[0], y2 = line.to[1];
        if (x2 === x1) return;
        var slope = (y2 - y1) / (x2 - x1);
        var yAtX = y1 + slope * (xFrac - x1);
        if (yAtX < minYFrac) minYFrac = yAtX;
      });

      if (minYFrac < 0) minYFrac = 0;
      var px = toPixels([xFrac, minYFrac]);
      ctx.lineTo(px[0], px[1]);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  // Draws the dashed objective-function line, translated diagonally so it
  // sweeps across the feasible region and back, like a graphical-method
  // solve searching for the best vertex.
  function drawSweepLine(elapsed) {
    var travel = (Math.sin(elapsed * CONFIG.sweepSpeed) + 1) / 2; // oscillates 0..1..0

    // A reference point that slides left-to-right (and back) above the
    // canvas, slightly overshooting both edges so the line's ends are
    // never visible mid-sweep.
    var margin = canvas.width * 0.3;
    var cx = -margin + travel * (canvas.width + margin * 2);
    var cy = canvas.height * 0.12;

    // Extend a line of the configured slope far enough in both directions
    // to cross the entire canvas.
    var length = (canvas.width + canvas.height) * 1.5;
    var dx = length / Math.sqrt(1 + CONFIG.sweepSlope * CONFIG.sweepSlope);
    var dy = dx * CONFIG.sweepSlope;

    ctx.strokeStyle = CONFIG.sweepColor;
    ctx.lineWidth = CONFIG.sweepWidth;
    ctx.setLineDash(CONFIG.sweepDash);
    ctx.beginPath();
    ctx.moveTo(cx - dx, cy - dy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function render(timestamp) {
    if (startTime === null) startTime = timestamp;
    var elapsed = timestamp - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawFeasibleRegion();
    drawAxes();
    drawConstraints();
    drawSweepLine(elapsed);

    if (!prefersReducedMotion) {
      animationFrameId = window.requestAnimationFrame(render);
    }
  }

  function start() {
    resizeCanvas();
    startTime = null;
    render(performance.now());
  }

  window.addEventListener('resize', function () {
    if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    resizeCanvas();
    startTime = null;
    render(performance.now());
  });

  document.addEventListener('DOMContentLoaded', start);
})();
