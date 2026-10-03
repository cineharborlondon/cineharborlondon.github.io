# Cine Harbor

Static portfolio for `cineharbor.space`, published by GitHub Pages from `main` / root.

## Project pages

- Homepage cards link to individual project pages; homepage muted video previews are retained.
- Photography: `/photography-2026-london-fashion-week.html`, containing all 20 supplied photographs.
- Videos: player at the top, project title and information below, followed by optional stills.
- The gallery preserves image proportions, uses three columns on desktop, two on tablets and one on mobile. Click a photograph to enlarge it; use the arrow keys or Previous/Next buttons to browse and Escape to close.
- Back links return to the corresponding homepage category.

## Update a project

Edit `projects-data.json`, then run:

```sh
node build-projects.mjs
```

Commit the data, generated `projects.js`, generated project HTML and any new assets together. GitHub Pages serves these files directly; no hosting change or build service is required.

Each project supports:

| Field | Purpose |
| --- | --- |
| `collection` | `films`, `commercials`, `photography`, or `social` |
| `slug` / `url` | Stable project page address |
| `kind` | `video` or `photo` |
| `youtube` / `vimeo` | Original platform video ID |
| `cover` | Homepage thumbnail |
| `aspectRatio` | Optional video width divided by height, including portrait videos |
| `description` | Introduction; separate paragraphs with two newlines |
| `credit` | Existing free-text credit, retained if supplied |
| `credits` | Optional list of `{ "role": "Director", "name": "..." }` |
| `location` / `year` | Optional project metadata |
| `images` | Ordered list of `{ "src", "small", "width", "height", "alt" }` |

For photography, the first image is the large opening image and the rest form the gallery. For videos, all images appear below the information. Empty descriptions, credits and image lists are omitted from the rendered page until real content is provided.

The Fashion Week assets are sRGB WebP exports in 1920px and 960px widths. Original full-resolution JPEGs and embedded camera/location metadata are not published. The homepage uses the landscape close-up `_B031614` as the initial cover; this can be changed independently of gallery order.

## Local preview

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. Use a server rather than opening HTML files directly, because shared assets and navigation use paths relative to the website root.
