// A glyph atlas: every handwritten character pre-drawn once per colour, then stamped with drawImage.
// Brightness is carried by alpha (the background is black), so colours only need to carry hue.
export class GlyphAtlas {
  constructor({ chars, colors, size, dpr, font = 'Caveat', weight = 500 }) {
    this.chars = chars; this.colors = colors; this.size = size; this.dpr = dpr;
    this.cell = Math.ceil(size * 1.6 * dpr);
    const c = document.createElement('canvas');
    c.width = this.cell * chars.length; c.height = this.cell * colors.length;
    const x = c.getContext('2d');
    x.font = `${weight} ${size * dpr}px ${font}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let ci = 0; ci < colors.length; ci++) {
      const [r, g, b] = colors[ci]; x.fillStyle = `rgb(${r},${g},${b})`;
      for (let gi = 0; gi < chars.length; gi++) x.fillText(chars[gi], gi * this.cell + this.cell / 2, ci * this.cell + this.cell / 2 + size * dpr * 0.04);
    }
    this.canvas = c;
    this.draw = this.cell / dpr;   // CSS px footprint of one cell
  }
  stamp(ctx, gi, ci, x, y, alpha, scale = 1) {
    const d = this.draw * scale, h = d / 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(this.canvas, gi * this.cell, ci * this.cell, this.cell, this.cell, x - h, y - h, d, d);
  }
}
