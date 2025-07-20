'use client';

import { Planet } from './Planet';
import { Starfield } from './Starfield';

export function Environment() {
  return (
    <>
      <Starfield />
      <Planet />
      {/* Ships layers will be added later */}
    </>
  );
} 