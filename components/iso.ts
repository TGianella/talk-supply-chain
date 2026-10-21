// 3D projections shared by the shaded illustrations.
// World axes: x and y horizontal, z up. Faces seen by the viewer:
// top (+z, --hud-bg), +y (left or front, 10% ink), +x (right, 20% ink).
export type Projector = (x: number, y: number, z: number) => number[]

// 2:1 isometric, the one CardboardBoxes uses: x toward the bottom right, y toward the bottom left
export const iso = (x: number, y: number, z: number, o = [0, 0]) => [o[0] + x - y, o[1] + (x + y) / 2 - z]

// Orthographic view turned by `yaw` degrees around the vertical (0 = +y face straight on)
// and looking down by `tilt` degrees (0 = eye level).
// `ellipse(r)` gives the radii of a horizontal circle; `view` points toward the viewer.
export function axo(yaw: number, tilt: number, scale = 1) {
  const [cf, sf] = [Math.cos(yaw * Math.PI / 180), Math.sin(yaw * Math.PI / 180)]
  const [ce, se] = [Math.cos(tilt * Math.PI / 180), Math.sin(tilt * Math.PI / 180)]
  const p: Projector = (x, y, z) => [scale * (x * cf - y * sf), scale * ((x * sf + y * cf) * se - z * ce)]
  return {
    p,
    ellipse: (r: number) => [r * scale, r * scale * se],
    view: [sf * ce, cf * ce, se],
  }
}

export const pts = (...ps: number[][]) => ps.map(p => p.join(',')).join(' ')

// the three visible faces of a box, as SVG polygon points
export function prism(p: Projector, [x0, x1]: number[], [y0, y1]: number[], [z0, z1]: number[]) {
  return {
    top: pts(p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)),
    left: pts(p(x0, y1, z1), p(x1, y1, z1), p(x1, y1, z0), p(x0, y1, z0)),
    right: pts(p(x1, y0, z1), p(x1, y1, z1), p(x1, y1, z0), p(x1, y0, z0)),
  }
}

// viewBox fitting a set of projected points, with a margin for the strokes
export function fit(points: number[][], margin = 8) {
  const xs = points.map(q => q[0])
  const ys = points.map(q => q[1])
  const [x0, y0] = [Math.min(...xs) - margin, Math.min(...ys) - margin]
  return `${x0} ${y0} ${Math.max(...xs) + margin - x0} ${Math.max(...ys) + margin - y0}`
}
