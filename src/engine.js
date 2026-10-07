(() => {
  const root = document.getElementById('tool');
  if (!root) return;
  const { mode, out: fixedOut, action } = root.dataset,
    accept = root.dataset.in.split(',');
  const MAXB = 50 * 1024 * 1024,
    MAXPX = 40e6,
    MAXN = 100;
  const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' },
    EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const $ = (s) => root.querySelector(s);
  const el = (t, p = {}, kids = []) => {
    const e = document.createElement(t);
    Object.assign(e, p);
    kids.forEach((k) => e.append(k));
    return e;
  };
  const fmt = (n) =>
    n < 1024
      ? n + ' B'
      : n < 1048576
      ? (n / 1024).toFixed(1) + ' KB'
      : (n / 1048576).toFixed(2) + ' MB';
  const clean = (n) =>
    n
      .replace(/\.[^.]+$/, '')
      .replace(/[^\w\-]+/g, '_')
      .slice(0, 60) || 'image';
  let items = [],
    uid = 0,
    busy = false;

  const outOpts = `<option value="jpg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option>`;
  const qual = `<label>Quality: <output id="qv">80</output><input id="q" type="range" min="1" max="100" value="80"></label>`;
  const lossy = fixedOut ? fixedOut !== 'png' : true;
  const OPTS = {
    compress: `<label>Output format<select id="fmt"><option value="same">Same as original</option><option value="jpg">JPG</option><option value="webp">WebP</option></select></label>${qual}`,
    resize: `<label>Resize by<select id="rm"><option value="px">Pixels</option><option value="pct">Percentage</option></select></label>
      <span id="pxg" class="row"><label>Width (px)<input id="w" type="number" min="1" max="20000"></label><label>Height (px)<input id="h" type="number" min="1" max="20000"></label><label class="chk"><input id="lock" type="checkbox" checked> Lock aspect ratio</label></span>
      <label id="pcg" hidden>Percent<input id="pct" type="number" min="1" max="500" value="50"></label>
      <label>Output format<select id="fmt"><option value="same">Same as original</option>${outOpts}</select></label>${qual}`,
    convert:
      (fixedOut
        ? ''
        : `<label>Convert to<select id="fmt">${outOpts}</select></label>`) +
      (lossy ? qual : ''),
    pdf: `<label>Page size<select id="ps"><option value="fit">Fit to image</option><option value="a4">A4</option><option value="letter">Letter</option></select></label><label>Margin<select id="mg"><option value="0">None</option><option value="36">Small</option><option value="72">Large</option></select></label>`,
  };
  $('#opts').innerHTML = OPTS[mode];
  const g = (id) => $('#' + id);
  const status = (m, err) => {
    const s = $('#status');
    s.textContent = m;
    s.className = err ? 'err' : '';
    s.setAttribute('role', err ? 'alert' : 'status');
  };
  if (g('q')) g('q').oninput = () => (g('qv').textContent = g('q').value);
  if (g('rm'))
    g('rm').onchange = () => {
      const p = g('rm').value === 'pct';
      g('pxg').hidden = p;
      g('pcg').hidden = !p;
    };
  const syncH = () => {
    if (!g('lock')) return;
    g('h').disabled = g('lock').checked;
    const f = items[0];
    if (g('lock').checked && f && g('w').value)
      g('h').value = Math.round((g('w').value * f.h) / f.w);
  };
  if (g('w')) {
    g('w').oninput = syncH;
    g('lock').onchange = syncH;
  }

  async function decode(file) {
    if (!file.size) throw new Error('This file is empty.');
    if (!accept.includes(file.type))
      throw new Error('Unsupported file type. Use JPG, PNG or WebP.');
    if (file.size > MAXB) throw new Error('File is larger than 50 MB.');
    let b;
    try {
      b = await createImageBitmap(file);
    } catch {
      throw new Error(
        'This image is corrupted or cannot be read by your browser.'
      );
    }
    if (b.width * b.height > MAXPX) {
      b.close();
      throw new Error('Image is larger than 40 megapixels.');
    }
    return b;
  }
  const draw = (b, w, h, mime) => {
    const c = el('canvas', { width: w, height: h }),
      x = c.getContext('2d');
    if (mime === 'image/jpeg') {
      x.fillStyle = '#fff';
      x.fillRect(0, 0, w, h);
    }
    x.imageSmoothingQuality = 'high';
    x.drawImage(b, 0, 0, w, h);
    return c;
  };
  const toBlob = (c, m, q) =>
    new Promise((ok, no) =>
      c.toBlob(
        (b) =>
          b && b.type === m
            ? ok(b)
            : no(
                new Error(
                  'Your browser cannot create this format. Try Chrome, Edge or Firefox.'
                )
              ),
        m,
        q
      )
    );
  const pickMime = (it) => {
    const f = g('fmt') ? g('fmt').value : fixedOut;
    return !f || f === 'same' ? it.file.type : MIME[f];
  };

  async function processOne(it) {
    const b = await decode(it.file),
      q = g('q') ? g('q').value / 100 : 0.9;
    let w = b.width,
      h = b.height;
    if (mode === 'resize') {
      if (g('rm').value === 'pct') {
        const p = +g('pct').value / 100;
        w = Math.round(w * p);
        h = Math.round(h * p);
      } else {
        const W = +g('w').value,
          H = +g('h').value;
        if (!W || (!g('lock').checked && !H))
          throw new Error(
            'Enter a width' + (g('lock').checked ? '.' : ' and height.')
          );
        h = g('lock').checked ? Math.round((W * b.height) / b.width) : H;
        w = W;
      }
      if (w < 1 || h < 1 || w > 20000 || h > 20000 || w * h > MAXPX)
        throw new Error(
          'Target size is out of range (max 20000 px per side, 40 megapixels).'
        );
    }
    const mime = pickMime(it);
    const canvas = draw(b, w, h, mime);
    b.close(); // Close bitmap safely after drawing

    let blob = await toBlob(canvas, mime, q);
    it.note = '';

    // If the new file is larger than the original, keep the original!
    if (blob.size >= it.file.size) {
      blob = it.file;
      it.note = 'Already well optimized; original kept.';
    } else {
      it.note = `Saved ${Math.round((1 - blob.size / it.file.size) * 100)}%`;
    }

    it.out = {
      blob,
      name: `${clean(it.file.name)}${
        mode === 'resize'
          ? `-${w}x${h}`
          : mode === 'compress'
          ? '-compressed'
          : ''
      }.${EXT[mime]}`,
    };
  }
  async function makePdf() {
    const ps = g('ps').value,
      mg = +g('mg').value,
      pages = [];
    for (const it of items) {
      status(`Adding ${it.file.name}…`);
      const b = await decode(it.file),
        s = Math.min(1, 4096 / Math.max(b.width, b.height)),
        w = Math.round(b.width * s),
        h = Math.round(b.height * s);
      const jpeg = new Uint8Array(
        await (
          await toBlob(draw(b, w, h, 'image/jpeg'), 'image/jpeg', 0.92)
        ).arrayBuffer()
      );
      b.close();
      let pw, ph;
      if (ps === 'fit') {
        pw = w * 0.75;
        ph = h * 0.75;
      } else {
        [pw, ph] = ps === 'a4' ? [595.28, 841.89] : [612, 792];
        if (w > h) [pw, ph] = [ph, pw];
      }
      const r = Math.min(
          (pw - 2 * mg) / w,
          (ph - 2 * mg) / h,
          ps === 'fit' ? 1e9 : 1e9
        ),
        m = ps === 'fit' ? 0 : mg,
        k = ps === 'fit' ? 0.75 : r,
        dw = w * k,
        dh = h * k;
      pages.push({
        jpeg,
        w,
        h,
        pw: pw + (ps === 'fit' ? 2 * mg : 0),
        ph: ph + (ps === 'fit' ? 2 * mg : 0),
        dw,
        dh,
        x: (pw + (ps === 'fit' ? 2 * mg : 0) - dw) / 2,
        y: (ph + (ps === 'fit' ? 2 * mg : 0) - dh) / 2,
      });
    }
    return new Blob([PT.pdf(pages)], { type: 'application/pdf' });
  }
  const dl = (blob, name) => {
    const u = URL.createObjectURL(blob),
      a = el('a', { href: u, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  };

  async function add(files) {
    for (const f of files) {
      if (items.length >= MAXN) {
        status(`Limit of ${MAXN} files reached.`, 1);
        break;
      }
      const it = {
        id: ++uid,
        file: f,
        url: null,
        w: 0,
        h: 0,
        state: 'ready',
        msg: '',
      };
      try {
        const b = await decode(f);
        it.w = b.width;
        it.h = b.height;
        b.close();
        it.url = URL.createObjectURL(f);
      } catch (e) {
        it.state = 'error';
        it.msg = e.message;
      }
      items.push(it);
    }
    syncH();
    render();
  }
  function render() {
    const ul = $('#list');
    ul.replaceChildren();
    items.forEach((it, i) => {
      const meta = el('div', { className: 'meta' }, [
        el('strong', { textContent: it.file.name }),
        el('span', {
          textContent: `${fmt(it.file.size)}${
            it.w ? ` · ${it.w}×${it.h}` : ''
          }`,
        }),
      ]);
      if (it.out) {
        const s = Math.round((1 - it.out.blob.size / it.file.size) * 100);
        meta.append(
          el('span', {
            className: 'ok',
            textContent: `→ ${fmt(it.out.blob.size)}${
              mode === 'compress' || mode === 'convert'
                ? s > 0
                  ? ` (${s}% smaller)`
                  : s < 0
                  ? ` (${-s}% larger)`
                  : ''
                : ''
            } ${it.note}`,
          })
        );
      }
      if (it.state === 'error')
        meta.append(
          el('span', { className: 'err', role: 'alert', textContent: it.msg })
        );
      const act = el('div', { className: 'acts' });
      if (mode === 'pdf') {
        act.append(
          el('button', {
            className: 'ico',
            textContent: '↑',
            title: 'Move up',
            disabled: i === 0,
            onclick: () => {
              [items[i - 1], items[i]] = [items[i], items[i - 1]];
              render();
            },
          }),
          el('button', {
            className: 'ico',
            textContent: '↓',
            title: 'Move down',
            disabled: i === items.length - 1,
            onclick: () => {
              [items[i + 1], items[i]] = [items[i], items[i + 1]];
              render();
            },
          })
        );
        act.lastChild.setAttribute('aria-label', 'Move down');
        act.firstChild.setAttribute('aria-label', 'Move up');
      }
      if (it.out)
        act.append(
          el('button', {
            className: 'btn sm',
            textContent: 'Download',
            onclick: () => dl(it.out.blob, it.out.name),
          })
        );
      act.append(
        el('button', {
          className: 'btn sm ghost',
          textContent: 'Remove',
          onclick: () => {
            if (it.url) URL.revokeObjectURL(it.url);
            items = items.filter((x) => x !== it);
            syncH();
            render();
          },
        })
      );
      const thumb = it.url
        ? el('img', {
            src: it.url,
            alt: `Preview of ${it.file.name}`,
            className: 'thumb',
          })
        : el('div', { className: 'thumb' });
      ul.append(el('li', {}, [thumb, meta, act]));
    });
    const ok = items.filter((i) => i.state !== 'error'),
      done = items.filter((i) => i.out);
    $('#go').disabled = busy || !ok.length;
    $('#go').textContent = busy ? 'Working…' : action;
    $('#zip').hidden = mode === 'pdf' || done.length < 2;
    $('#reset').hidden = !items.length;
    $('#panel').hidden = !items.length;
  }
  $('#go').onclick = async () => {
    busy = true;
    render();
    status('Processing…');
    try {
      if (mode === 'pdf') {
        const b = await makePdf();
        dl(b, 'images.pdf');
        status(`PDF created (${fmt(b.size)}) and download started.`);
      } else {
        let n = 0;
        for (const it of items) {
          if (it.state === 'error') continue;
          status(`Processing ${it.file.name}…`);
          it.out = null;
          try {
            await processOne(it);
            it.state = 'done';
            n++;
          } catch (e) {
            it.state = 'error';
            it.msg = e.message;
          }
          render();
        }
        status(
          `Done: ${n} file${
            n === 1 ? '' : 's'
          } processed. Use the Download buttons.`
        );
      }
    } catch (e) {
      status(
        e.message || 'Something went wrong. Try fewer or smaller images.',
        1
      );
    }
    busy = false;
    render();
  };
  $('#zip').onclick = async () => {
    const used = {},
      files = [];
    for (const it of items.filter((i) => i.out)) {
      let n = it.out.name;
      if (used[n]) n = n.replace(/(\.\w+)$/, `-${used[n]++}$1`);
      else used[n] = 1;
      files.push({
        name: n,
        data: new Uint8Array(await it.out.blob.arrayBuffer()),
      });
    }
    dl(PT.zip(files), 'images.zip');
  };
  $('#reset').onclick = () => {
    items.forEach((i) => i.url && URL.revokeObjectURL(i.url));
    items = [];
    status('');
    render();
  };
  const dz = $('#drop'),
    inp = $('#file');
  inp.onchange = () => {
    add([...inp.files]);
    inp.value = '';
  };
  ['dragenter', 'dragover'].forEach((e) =>
    dz.addEventListener(e, (ev) => {
      ev.preventDefault();
      dz.classList.add('over');
    })
  );
  ['dragleave', 'drop'].forEach((e) =>
    dz.addEventListener(e, (ev) => {
      ev.preventDefault();
      dz.classList.remove('over');
    })
  );
  dz.addEventListener('drop', (ev) => add([...ev.dataTransfer.files]));
  render();
})();
