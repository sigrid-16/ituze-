/** A small hand-drawn-style picture used as a sample image journal entry. */
const SAMPLE_DRAWING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
<rect width="400" height="260" fill="#F6DFD5"/>
<circle cx="300" cy="80" r="38" fill="#E9A23B"/>
<path d="M0 170 Q 90 110 180 160 T 400 140 V260 H0Z" fill="#7FB8A4"/>
<path d="M0 200 Q 120 150 230 195 T 400 185 V260 H0Z" fill="#2F5D50"/>
<g fill="none" stroke="#C8664A" stroke-width="6" stroke-linejoin="round">
<path d="M20 235 l20 -14 l20 14 l20 -14 l20 14 l20 -14 l20 14 l20 -14 l20 14 l20 -14 l20 14 l20 -14 l20 14 l20 -14 l20 14 l20 -14 l20 14 l20 -14 l20 14"/>
</g>
<g fill="#24302B"><rect x="90" y="150" width="6" height="40"/><circle cx="93" cy="140" r="18" fill="#4E7A6C"/></g>
</svg>`;

export const SAMPLE_DRAWING_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_DRAWING_SVG)}`;
