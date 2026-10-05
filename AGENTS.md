# Cine Harbor maintenance rules

- Preserve every existing video project, Vimeo/YouTube ID, media asset and project HTML route unless the user explicitly authorizes removing that specific item.
- Requests to rename, recategorize, reorder or restyle a project do not authorize removing it. Retain existing URLs when changing visible titles or categories.
- Before editing, read the latest remote main branch; preserve concurrent changes.
- Before publishing, compare the video IDs and complete repository tree with the previous main commit. Stop if any existing video or file disappears without explicit authorization.
- Edit projects-data.json as the project source and regenerate projects.js and detail pages with node build-projects.mjs.
- Preserve pinLast rules: Stride is last in Commercials; Imaginary Friends and What If Your Style Was Illegal? are last in Films.
