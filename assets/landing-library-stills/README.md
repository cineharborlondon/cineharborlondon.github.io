# Landing-page stills

The landing page uses 120 selected landscape stills, held for 500 ms each for a nominal 60-second cycle. Each new visit starts a fresh randomized sequence, with frames from the same source spaced apart.

To update the selection, add compressed WebP images here and update `landing-frames.js`. Each entry contains only a relative `src`, an opaque `sourceGroup` used to separate related images, and an optional CSS background `position`. Keep one consistent group value for images from the same source. Preserve existing images until they are no longer referenced by the manifest.

Check that all image paths load, sources are horizontal, the title remains readable on mobile, and clicking the landing page opens Work. Source recordings and internal selection notes are not part of the public website.
