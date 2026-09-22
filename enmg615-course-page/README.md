# ENMG 615 — Course Landing Page

A simple, self-contained landing page for **ENMG 615: Deterministic Optimization Models**, built to be hosted for free on **GitHub Pages**.

## Files in this project

```
.
├── index.html          ← the page itself (all content lives here)
├── css/
│   └── style.css       ← all colors, fonts, spacing (edit here to restyle)
├── js/
│   ├── background.js   ← the animated optimization-graph background in the hero banner
│   └── main.js          ← two tiny optional behaviors (footer year, nav highlight)
├── assets/
│   └── instructor-photo.jpg   ← your photo
├── materials/           ← (create this yourself) put lecture notes / slides here, then link to them from the Schedule table
└── README.md            ← this file
```

Nothing is minified or bundled — every file is plain, commented, and safe to open in any text editor (VS Code, Notepad++, even TextEdit).

## How to host it on GitHub Pages (free)

1. Create a new GitHub repository (e.g. `enmg615-course-page`). It can be public or private (Pages needs it public, or a paid plan for private Pages).
2. Upload **all the files in this folder**, keeping the same folder structure (`css/`, `js/`, `assets/` must stay as subfolders — don't flatten them).
3. In the repository, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to `Deploy from a branch`, pick the `main` branch and `/ (root)` folder, then **Save**.
5. GitHub will give you a URL that looks like:
   `https://<your-username>.github.io/<repository-name>/`
   It usually takes 1–2 minutes to go live the first time.

## How to edit the content (no coding experience needed)

Open `index.html` in any text editor. The file is broken into clearly labeled sections with comments like:

```html
<!-- =====================================================================
     COURSE SCHEDULE / OUTLINE
     ===================================================================== -->
```

Find the section you want to change (e.g. "SCHEDULE", "GRADING CRITERIA", "INSTRUCTOR") and edit the text between the tags. A few common edits:

- **Change a table row** (e.g. a week in the schedule): find the matching `<tr>...</tr>` block and edit the text inside the `<td>` tags.
- **Add a new week / row**: copy an existing `<tr>...</tr>` block, paste it below, and edit the text.
- **Upload lecture notes for a week**: create a `materials` folder next to `index.html` (if it doesn't exist yet), put the PDF/PPTX there, then in that week's row replace the `—` in the last `<td>` with a link, e.g. `<a href="materials/week01-notes.pdf">Lecture Notes</a>`.
- **Change the instructor photo**: replace `assets/instructor-photo.jpg` with a new image file of the same name (or edit the `src="assets/instructor-photo.jpg"` line in the "INSTRUCTOR" section to point to a new filename).
- **Add or remove a navigation link**: edit the `<nav class="site-nav">` block near the top of the file. Each link's `href="#something"` must match a section's `id="something"` further down the page.

You do **not** need to touch `css/style.css` or the `js/` files to change the words on the page — those only control appearance and small interactive touches.

## The animated hero background

The banner behind the title shows a quiet, animated "graphical method" plot — a few constraint lines, a shaded feasible region, and a dashed objective-function line sweeping across it, echoing the graphical LP solve technique in Week 6 of the schedule. It's drawn live in the browser by `js/background.js` (not a GIF or video file), which keeps the page small and fast to load.

- **To change how it looks** (line positions/slopes, colors, sweep speed), open `js/background.js` and edit the `CONFIG` block at the top — every value is commented.
- **To remove it entirely**, delete `js/background.js`, then in `index.html` delete the `<canvas id="hero-canvas">` line and the `<script src="js/background.js">` line near the bottom of the file. The hero will fall back to the plain green gradient.
- It automatically pauses for visitors whose device/browser is set to "reduce motion."

## How to change the color theme

Open `css/style.css` and look at the very top for a block called `:root { ... }` under the heading `1. THEME COLORS`. Every color on the page is defined once there:

```css
:root {
  --color-green-dark:   #103a24;   /* deep green - header, footer, headings */
  --color-green:        #1f7a4d;   /* primary green - buttons, links, accents */
  --color-green-light:  #e7f3ec;   /* pale green - section backgrounds */
  --color-black:        #16181b;   /* near-black - body text */
  --color-white:        #ffffff;   /* white - page background, cards */
  ...
}
```

Change any hex code there and the whole site updates — you never need to hunt through the rest of the file.

## Previewing changes before you publish

Just double-click `index.html` to open it in your browser. Since it links to the `css/` and `js/` files with relative paths, it will render correctly as long as you keep the folder structure intact (don't move `index.html` out of this folder on its own).
