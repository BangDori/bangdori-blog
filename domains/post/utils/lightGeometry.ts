export interface LightRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface LightGeometry {
  range: number;
  slantRange: number;
  targetLeft: number;
  targetWidth: number;
  sourceX: number;
  spreadAngle: number;
  edgeIntensity: number;
  falloff: [number, number, number, number, number];
}

const RAD_TO_DEG = 180 / Math.PI;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function subtract(to: Vector3, from: Vector3): Vector3 {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
    z: to.z - from.z,
  };
}

function magnitude(vector: Vector3) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function dot(left: Vector3, right: Vector3) {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

function angleBetween(left: Vector3, right: Vector3) {
  const denominator = magnitude(left) * magnitude(right);
  if (denominator === 0) return 0;

  return Math.acos(clamp(dot(left, right) / denominator, -1, 1));
}

function calculateFalloff(range: number, sourceRadius: number): LightGeometry['falloff'] {
  const nearFieldOffset = Math.max(sourceRadius, 1);
  const stops = [0, 0.25, 0.5, 0.75, 1] as const;

  return stops.map((ratio) => {
    const distance = nearFieldOffset + range * ratio;
    const inverseSquareRatio = (nearFieldOffset / distance) ** 2;
    const perceivedIntensity = Math.sqrt(inverseSquareRatio);

    return Number((0.04 + 0.26 * perceivedIntensity).toFixed(3));
  }) as LightGeometry['falloff'];
}

export function calculateLightGeometry(
  source: LightRect,
  target: LightRect,
  container: LightRect
): LightGeometry {
  const range = Math.max(target.top - source.bottom, 1);
  const targetLeft = target.left - container.left;
  const targetRight = target.right - container.left;
  const targetWidth = Math.max(target.width, 1);
  const sourceXInContainer = (source.left + source.right) / 2 - container.left;

  const light: Vector3 = { x: sourceXInContainer, y: 0, z: range };
  const shelfLeft: Vector3 = { x: targetLeft, y: 0, z: 0 };
  const shelfRight: Vector3 = { x: targetRight, y: 0, z: 0 };
  const shelfCenter: Vector3 = { x: (targetLeft + targetRight) / 2, y: 0, z: 0 };

  const opticalAxis = subtract(shelfCenter, light);
  const leftRay = subtract(shelfLeft, light);
  const rightRay = subtract(shelfRight, light);
  const leftAngle = angleBetween(opticalAxis, leftRay);
  const rightAngle = angleBetween(opticalAxis, rightRay);
  const centerRange = magnitude(opticalAxis);
  const slantRange = Math.max(magnitude(leftRay), magnitude(rightRay));
  const incidenceCosine = clamp(range / slantRange, 0, 1);
  const inverseSquareAtEdge = (centerRange / slantRange) ** 2;

  return {
    range,
    slantRange,
    targetLeft,
    targetWidth,
    sourceX: clamp(sourceXInContainer - targetLeft, 0, targetWidth),
    spreadAngle: Number(((leftAngle + rightAngle) * RAD_TO_DEG).toFixed(2)),
    edgeIntensity: Number(clamp(incidenceCosine * inverseSquareAtEdge, 0.16, 1).toFixed(3)),
    falloff: calculateFalloff(centerRange, source.width / 2),
  };
}
