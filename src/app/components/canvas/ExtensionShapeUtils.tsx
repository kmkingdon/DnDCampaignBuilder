import go from "gojs";

const _CachedArrays: Array<any> = [];

export function tempArray(): Array<any> {
    const temp = _CachedArrays.pop();
    if (temp === undefined) return [];
    return temp;
  }
  
  /**
   * @ignore
   * @param {Array} a
   */
export function freeArray(a: Array<any>) {
    a.length = 0;  // clear any references to objects
    _CachedArrays.push(a);
}
  
  
  /**
   * @ignore
   * This allocates a temporary Array that should be freeArray()'ed by the caller.
   * @param {number} sides
   * @return {Array}
   */
  export  function createPolygon(sides: number): Array<any> {
    // Point[] points = new Point[sides + 1];
    const points = tempArray();
    const radius = .5;
    const center = .5;
    const offsetAngle = Math.PI * 1.5;
    let angle = 0;
  
    // Loop through each side of the polygon
    for (let i = 0; i < sides; i++) {
      angle = 2 * Math.PI / sides * i + offsetAngle;
      points[i] = new go.Point((center + radius * Math.cos(angle)), (center + radius * Math.sin(angle)));
    }
  
    // Add the last line
    // points[points.length - 1] = points[0];
    points.push(points[0]);
    return points;
  }
  
  /**
   * @ignore
   * This allocates a temporary Array that should be freeArray()'ed by the caller.
   * @param {number} points
   * @return {Array}
   */
  export function createBurst(points: number): Array<any> {
    const star = createStar(points);
    const pts = tempArray(); // new Point[points * 3 + 1];
  
    pts[0] = star[0];
    for (let i = 1, count = 1; i < star.length; i += 2, count += 3) {
      pts[count] = star[i];
      pts[count + 1] = star[i];
      pts[count + 2] = star[i + 1];
    }
  
    freeArray(star);
    return pts;
  }

  function getIntersection(p1x: number, p1y: number, p2x: number, p2y: number, q1x: number, q1y: number, q2x: number, q2y: number, result?: go.Point): go.Point {
    if (!result) result = new go.Point();
    const dx1 = p1x - p2x;
    const dx2 = q1x - q2x;
    let x = NaN;
    let y = NaN;
    if (dx1 === 0) {
      if (dx2 === 0) {
        if (p1x === p2x) {
          x = p1x;
          y = p1y;
        }
      } else {
        const m2 = (q1y - q2y) / dx2;
        const b2 = q1y - m2 * q1x;
        x = p1x;
        y = m2 * x + b2;
      }
    } else {
      if (dx2 === 0) {
        const m1 = (p1y - p2y) / dx1;
        const b1 = p1y - m1 * p1x;
        x = q1x;
        y = m1 * x + b1;
      } else {
        const m1 = (p1y - p2y) / dx1;
        const m2 = (q1y - q2y) / dx2;
        const b1 = p1y - m1 * p1x;
        const b2 = q1y - m2 * q1x;
        x = (b2 - b1) / (m1 - m2);
        y = m1 * x + b1;
      }
    }
    result.x = x;
    result.y = y;
    return result;
  }
  
  
  /**
   * @ignore
   * This allocates a temporary Array that should be freeArray()'ed by the caller.
   * @param {number} points
   * @return {Array}
   */
  export function createStar(points: number): Array<any> {
    // First, create a regular polygon
    const polygon = createPolygon(points);
    // Calculate the points inbetween
    const pts = tempArray(); // new Point[points * 2 + 1];
  
    const half = Math.floor(polygon.length / 2);
    const count = polygon.length - 1;
    const offset = (points % 2 === 0) ? 2 : 1;
  
    for (let i = 0; i < count; i++) {
      // Get the intersection of two lines
      const p0 = polygon[i];
      const p1 = polygon[i + 1];
      const q21 = polygon[(half + i - 1) % count];
      const q2off = polygon[(half + i + offset) % count];
      pts[i * 2] = p0;
      pts[i * 2 + 1] = getIntersection(p0.x, p0.y,
        q21.x, q21.y,
        p1.x, p1.y,
        q2off.x, q2off.y, new go.Point());  // ?? not currently managed
    }
  
    pts[pts.length] = pts[0];
  
    freeArray(polygon);
    return pts;
  }
  