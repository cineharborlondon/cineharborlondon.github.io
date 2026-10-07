# Cine Harbor maintenance rules

- Preserve every existing video project, Vimeo/YouTube ID, media asset and project HTML route unless the user explicitly authorizes removing that specific item.
- Requests to rename, recategorize, reorder or restyle a project do not authorize removing it. Retain existing URLs when changing visible titles or categories.
- Before editing, read the latest remote main branch; preserve concurrent changes.
- Before publishing, compare the video IDs and complete repository tree with the previous main commit. Stop if any existing video or file disappears without explicit authorization.
- Edit projects-data.json as the project source and regenerate projects.js and detail pages with node build-projects.mjs.
- Preserve pinLast rules: Dahua is last in Commercials; Event Highlights is immediately before Stride at the end of Content; Stride is last in Content; Threshold of Bloom, Starberry Fields Forever, Imaginary Friends and What If Your Style Was Illegal? are the last four in Films, in that order. New Films go before this closing group; preserve pinLast and pinLastOrder.

- Related videos are stored in relatedVideoGroups and rendered under the project introduction. Keep all existing related clips unless explicitly told to remove them.

- Shared page headers use work-header.css: brown (#8f6334) wordmark on the left and Work / About / Contact together on the right. The About video page retains its original light wordmark.
- Category display order is FILMS, COMMERCIALS, EDITORIAL, CONTENT, PHOTOGRAPHY; retain branded-content and social IDs for existing links.
- Content fashion, W/Vogue and celebrity interview projects go first regardless of orientation (fashionPriority). Otherwise show landscape/square projects before portrait projects within each category; closing pinned projects keep their specified order. Landscape Work cards stay 16:9. Portrait cards retain their native ratio at a compact height that fits within the viewport.

- All visible website project titles, video titles and labels must be in English, including nested related videos.

- Custom video posters must not disable automatic previews. All Vimeo Work cards should retain muted previews with bounded retry after temporary failures.
- Desktop Content begins with the five W/Vogue fashion projects in one compact row; the square Libby card uses its native ratio. Starry Mart starts the next row ahead of Knight Frank OWO and DALTON.

- Use well-exposed, readable scenes for posters and automatic previews; avoid dark introductions or fades.

- TCL × Qinwen — IFA Deep Dive belongs in Editorial immediately after Qin Wen × Leif Lindner — IFA Interview; preserve its existing social project route. Its cover headline is English; the original Chinese creator logo may remain.
- Genshin preview shows its title briefly, then jumps to the UK performance at 54:53.

- MOUSSAIEFF and GRAFF covers must be frames of the original brand title cards from their actual films; never recreate the typography or background. BVLGARI uses its original picture cover.
- The Capston vertical event film goes toward the end of Content, immediately before Knight Frank × Rockwell — Event (the portrait Knight Frank project). BVLGARI retains its original picture cover; MOUSSAIEFF and GRAFF retain title covers.

- The Dehua international tour is one listed Content project with Copenhagen and Brussels videos side by side; preserve both original routes.

- Dahua keeps the product cover and previews the complete 26-second film on loop.
