// Captain avatar palettes for the character-creation overlay (openspec
// make-bridge-scene-first task 6.1). Distinct from the crew's department
// colors on purpose (characters/player.md: "you wear your own colors") -
// none of these overlap the crew's red/blue/yellow canon (BridgeStage.tsx
// CHARACTER_COLORS).
export interface PlayerPalette {
  id: string;
  label: string;
  coat: number;
  trim: number;
}

export const PLAYER_PALETTES: PlayerPalette[] = [
  { id: 'gold', label: 'Gold', coat: 0x2c3e50, trim: 0xf6c945 },
  { id: 'teal', label: 'Teal', coat: 0x123a3a, trim: 0x2dd4bf },
  { id: 'violet', label: 'Violet', coat: 0x2e1a47, trim: 0xa78bfa },
  { id: 'rose', label: 'Rose', coat: 0x3a1a2e, trim: 0xfb7185 },
];

export const DEFAULT_PALETTE_ID = PLAYER_PALETTES[0].id;

export function paletteById(id: string): PlayerPalette {
  return PLAYER_PALETTES.find((p) => p.id === id) ?? PLAYER_PALETTES[0];
}

export function hexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, '0')}`;
}
