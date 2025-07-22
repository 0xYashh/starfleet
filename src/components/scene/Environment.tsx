'use client';

import { Planet } from './Planet';
import { Starfield } from './Starfield';
import { ShipsInstancedMesh } from './ShipsInstancedMesh';

export function Environment() {
  return (
    <>
      <Starfield />
      <Planet />
      <ShipsInstancedMesh />
    </>
  );
} 