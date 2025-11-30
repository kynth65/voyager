/**
 * Vessel Image Mapping Utility
 * Maps vessel names to their corresponding image files in /assets/images
 */

// Import vessel images for proper bundling
import islandHopperImg from '../assets/images/island-hopper.jpeg';
import oceanStarImg from '../assets/images/ocean-star.png';
import seaBreezeImg from '../assets/images/sea-breeze.jpeg';
import waveRiderImg from '../assets/images/wave-rider.jpeg';

const vesselImageMap: Record<string, string> = {
  'Island Hopper': islandHopperImg,
  'Ocean Star': oceanStarImg,
  'Sea Breeze': seaBreezeImg,
  'Wave Rider': waveRiderImg,
};

/**
 * Get the image path for a vessel based on its name
 * Falls back to a default pattern if exact match not found
 */
export function getVesselImage(vesselName: string | undefined): string | null {
  if (!vesselName) return null;

  // Try exact match first
  if (vesselImageMap[vesselName]) {
    return vesselImageMap[vesselName];
  }

  // Try case-insensitive partial match
  const normalizedName = vesselName.toLowerCase();
  for (const [key, value] of Object.entries(vesselImageMap)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return value;
    }
  }

  // No match found, return null to use placeholder
  return null;
}

/**
 * Get all available vessel images
 */
export function getAllVesselImages(): string[] {
  return Object.values(vesselImageMap);
}

/**
 * Check if a vessel has an image available
 */
export function hasVesselImage(vesselName: string | undefined): boolean {
  return getVesselImage(vesselName) !== null;
}
