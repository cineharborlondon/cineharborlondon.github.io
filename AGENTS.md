# Cine Harbor maintenance rules

- Preserve every existing video project, Vimeo/YouTube ID, media asset and project HTML route unless the user explicitly authorizes removing that specific item.
- Requests to rename, recategorize, reorder or restyle a project do not authorize removing it. Retain existing URLs when changing visible titles or categories.
- Before editing, read the latest remote main branch; preserve concurrent changes.
- Before publishing, compare the video IDs and complete repository tree with the previous main commit. Stop if any existing video or file disappears without explicit authorization.
- Edit projects-data.json as the project source and regenerate projects.js and detail pages with node build-projects.mjs.
- Preserve pinLast rules: Dahua is followed by Yingjia Design (China, 2018) at the end of Commercials; Event Highlights is immediately before Stride at the end of Content; Stride is last in Content; Threshold of Bloom, Starberry Fields Forever, Imaginary Friends and What If Your Style Was Illegal? are the last four in Films, in that order. New Films go before this closing group; preserve pinLast and pinLastOrder.

- Related videos are stored in relatedVideoGroups and rendered under the project introduction. Keep all existing related clips unless explicitly told to remove them.

- Shared page headers use work-header.css: brown (#8f6334) wordmark on the left and Work / About / Contact together on the right. The About video page retains its original light wordmark.
- Category display order is FILMS, COMMERCIALS, EDITORIAL, CONTENT, PHOTOGRAPHY; retain branded-content and social IDs for existing links.
- Content fashion, W/Vogue and celebrity interview projects go first regardless of orientation (fashionPriority). Otherwise show landscape/square projects before portrait projects within each category; closing pinned projects keep their specified order. Landscape Work cards stay 16:9. Portrait cards retain their native ratio at a compact height that fits within the viewport.

- All visible website project titles, video titles and labels must be in English, including nested related videos.

- Custom video posters must not disable automatic previews. All Vimeo Work cards should retain muted previews with bounded retry after temporary failures.
- Desktop Content begins with the five W/Vogue fashion projects in one compact row; the square Libby card uses its native ratio. Starry Mart starts the next row ahead of Dehua Porcelain International Tour and DALTON; Knight Frank OWO follows in the next row.

- Use well-exposed, readable scenes for posters and automatic previews; avoid dark introductions or fades.

- TCL × Qinwen — IFA Deep Dive belongs in Editorial immediately after Qin Wen × Leif Lindner — IFA Interview; preserve its existing social project route. Its cover headline is English; the original Chinese creator logo may remain.
- Genshin preview shows its title briefly, then jumps to the UK performance at 54:53.

- MOUSSAIEFF and GRAFF covers must be frames of the original brand title cards from their actual films; never recreate the typography or background. BVLGARI uses its original picture cover.
- The Capston vertical event film goes toward the end of Content, immediately before Knight Frank × Rockwell — Event (the portrait Knight Frank project). BVLGARI retains its original picture cover; MOUSSAIEFF and GRAFF retain title covers.

- The Dehua international tour is one listed Content project with Copenhagen and Brussels videos side by side; preserve both original routes.

- Dahua keeps the product cover and previews the complete 26-second film on loop.

- OPPO launch is labelled Live Broadcast; retain its original opening preview at 8–25.5 seconds, replacing only the female speaker close-up with the product-stage wide shot at 1100–1106.5 seconds.

- Starry Mart is a Store Opening Films series with London Dock, Southside and Fulham in that order; retain the original London Dock Work cover and preview.
- Hanshow Retail Technology Show photography follows the 13-photo Instagram carousel order, then the five additional Drive photos, retaining native picture proportions.

Mobile portrait work cards must be horizontally centered, with their original compact size and native ratio preserved. Starry Mart groups London Dock, Southside and Fulham openings while preserving its existing preview. Photography selections: Hanshow 18, Heathrow Express 25, SUNCUN LFW 20 in Instagram order, Pei Feng Su 11. PAINKILLER — DUCATI follows VOGUE films; its Work preview starts at 1:11 and continues through the following sequence (24 seconds). New Savills, ZUKER and Oxford Content events appear near the end.

Yingjia Design — Brand Film is the last Commercials project, filmed in China in 2018.

Photography portrait covers retain their native complete ratio with a compact viewport-limited height and centered card. Hanshow is pinned last in Photography. ZUKER cover uses its original film storefront at 00:05.

Burberry × W China — Summer Playlist uses W China and a single-line Work title.

Yingjia Design previews from 00:11 and uses the original yellow thread-spool shot at 00:25.5 as its cover. SUXINDAI groups two vertical ads as one Content project, with both original Vimeo IDs preserved.

Photography begins with Segway Navimow — Campaign Photography (23 images, France · Germany · USA, 2025), then Realme × Adam Valdez — Campaign Photography, then Heathrow Express, London Fashion Week and Pei Feng Su. Hanshow remains last. The first three desktop Photography covers share a 3:2 display size; detail photos retain native proportions. Photography details open with the title followed by the full gallery. Navimow scenes are grouped into Gardens & Lawns, Coastal Life, and Family & Home, with both aerials near the beginning.

Adam Photography uses only the 11 retouched images from Drive folder 1Ao3aabSYyimphtSY2Aeni8mhgz9SOqYP. All previous unretouched Adam gallery images have been explicitly replaced by the user. The reference sequence begins with the face/phone portrait, foreground phone close-up, horizontal phone portrait, seated vertical-phone portrait, then the seated horizontal-phone portrait. A Graceful Descent is Photography only, with nine standalone photographs; collage/reference files are not gallery photographs. Moussaieff Photography contains 15 photographs. ALLSO belongs in Commercials immediately after Dyson, retaining all four films and its original route.

Latest user update: Adam gallery is deduplicated to seven retouched photographs; retain only one of each near-identical portrait, phone close-up, behind-the-scenes portrait and three-panel image. Navimow has no visible scene category headings: all 23 photos remain in one continuous grid in existing scene order. Hanchu ESS — Solar & Storage Live UK 2026 belongs in Content immediately before Knight Frank OWO; Rockwell event uses the clear original-film group portrait at 29.4 seconds as its poster.

LFW latest selection: remove repeated white male runway shot B031537 and crossed-out B031695. First row is B031924, B031543, B031302 (white female model moved up), with 18 photographs remaining. Keep a continuous unlabeled grid so this requested first row is stable.

Desktop Content closing portraits SUXINDAI, The Capston, Knight Frank Rockwell and Stride occupy a dedicated final row, retaining compact native proportions and existing order. Mobile cards remain centered.

User correction: Zhang Jingyi and Xin Zhilei films are for V Magazine (not VOGUE CHINA); keep this credit in titles and descriptions. Zhang Jingyi uses the original film brown-outfit portrait as its cover.

Latest category reorganization overrides earlier category ordering and Content tab rules: FASHION, FILMS, COMMERCIALS, EDITORIAL, PHOTOGRAPHY. Existing fashion films (UN CURRENT, The Ballroom, Zhang Jingyi, Xin Zhilei, W fashion film How to Stay Chic and Warm in London, Imaginary Friends, What If Your Style Was Illegal?) belong in Fashion, followed by the former Content fashion/W/Vogue series. Fashion landscape cards occupy a full desktop row. Former non-fashion Content projects belong to a named Content subsection at the bottom of Commercials, with existing content order and closing portrait row retained. Project URLs and all video IDs are preserved; #social is an alias for #fashion.

Latest user correction: Hide Starberry Fields Forever, Imaginary Friends and What If Your Style Was Illegal? from Work and project navigation. UN CURRENT belongs in Films. Fashion begins with V Magazine × Xin Zhilei, then V Magazine × Zhang Jingyi, then The Ballroom.
