module.exports = [
 { slug: "how-to-compress-an-image", title: "How to compress an image without ruining it", desc: "Practical settings for shrinking photos and screenshots.", tools: ["compress-image", "jpg-to-webp"],
  body: `<p>Image size is driven by three things: pixel dimensions, format and quality. Change them in that order.</p>
<h2>1. Shrink the dimensions first</h2><p>A 4000-pixel-wide photo shown 800 pixels wide on a page wastes most of its bytes. Use the <a href="/resize-image/">image resizer</a> first; halving width and height cuts pixels to a quarter.</p>
<h2>2. Pick the right format</h2><p>Photos belong in JPG or WebP. Screenshots, logos and text belong in PNG or lossless WebP. Putting a photo in PNG is the most common reason files are huge.</p>
<h2>3. Lower quality gently</h2><p>For JPG and WebP, a quality of 70 to 80 usually looks the same on screen while saving much of the size. Below about 50, blocky artifacts appear around edges. Use the <a href="/compress-image/">image compressor</a> and compare the preview at full size.</p>
<h2>Why PNG won't shrink with a quality slider</h2><p>PNG is lossless, so there is nothing to discard. To make a PNG smaller you reduce its dimensions or switch to a lossy format.</p>`},
 { slug: "how-to-resize-an-image", title: "How to resize an image and keep it sharp", desc: "Pixels, percentages and aspect ratio explained.", tools: ["resize-image", "compress-image"],
  body: `<p>Resizing changes the number of pixels. Shrinking discards pixels; enlarging has to invent them, which looks soft.</p>
<h2>Keep the aspect ratio</h2><p>Aspect ratio is width divided by height. Change only one dimension and let the other follow, or the image will look stretched. The <a href="/resize-image/">resizer</a> locks it by default.</p>
<h2>Pixels or percent?</h2><p>Use pixels when a site or form demands exact dimensions. Use percent to scale a batch of different-sized photos by the same amount.</p>
<h2>Common targets</h2><p>Full-width web images rarely need more than 1600 to 2000 pixels of width. Email and chat attachments are fine at 1200.</p>`},
 { slug: "jpg-vs-png-vs-webp", title: "JPG vs PNG vs WebP: which format to use", desc: "A plain comparison of the three web image formats.", tools: ["convert-image", "png-to-webp"],
  body: `<p><strong>JPG</strong> is lossy, has no transparency and suits photographs. It is accepted everywhere.</p>
<p><strong>PNG</strong> is lossless and supports transparency. It suits screenshots, logos, line art and anything with sharp text, but photos make very large PNGs.</p>
<p><strong>WebP</strong> can be lossy or lossless and supports transparency. It is typically smaller than JPG or PNG at similar quality and works in all current major browsers, but some older software cannot open it.</p>
<h2>Rule of thumb</h2><p>Photo for the web: WebP, with JPG as the safe choice. Graphic with transparency: WebP or PNG. Editing source: PNG. Convert between them with the <a href="/convert-image/">image converter</a>.</p>`},
 { slug: "how-to-convert-images-to-pdf", title: "How to convert images to a PDF", desc: "Merge photos or scans into one document.", tools: ["image-to-pdf", "compress-image"],
  body: `<p>Add your images to the <a href="/image-to-pdf/">image to PDF tool</a> and drag them into reading order. Each image becomes one page.</p>
<h2>Page size</h2><p>"Fit to image" keeps each page exactly the image's size. A4 or Letter places the image centered on a standard page, in portrait or landscape depending on the image.</p>
<h2>Keep the file small</h2><p>PDF size follows image size. If the result is too big to email, run the photos through the <a href="/compress-image/">compressor</a> first.</p>`}
];
