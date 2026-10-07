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
