if (mode === 'compress') {
  opts.innerHTML = `
    <label>Output format
      <select id="out">
        <option value="image/jpeg" selected>JPG (Recommended)</option>
        <option value="image/webp">WebP</option>
      </select>
    </label>
    <label>Quality: <span id="qv">80</span>%
      <input id="q" type="range" min="1" max="100" value="80">
    </label>
  `;
}
