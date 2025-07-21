export function getOrbitPosition(
  radius: number,
  inclination: number,
  phase: number,
  elapsed: number,
  angularSpeed: number
) {
  const theta = phase + angularSpeed * elapsed;
  const xPrime = radius * Math.cos(theta);
  const yPrime = radius * Math.sin(theta);
  // rotate around X-axis by inclination
  const y = yPrime * Math.cos(inclination);
  const z = yPrime * Math.sin(inclination);
  const x = xPrime;
  return [x, y, z] as const;
} 