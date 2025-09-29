const biomeIconMapD2 = {
  'root:engineered': 'engineered_b',
};
const biomeIconMapD3 = {
  'root:engineered:wastewater': 'wastewater_b',
  'root:environmental:air': 'air_b',
  'root:host-associated:amphibia': 'amphibian_b',
  'root:host-associated:arthropoda': 'arthropoda_b',
  'root:host-associated:fish': 'fish_b',
  'root:host-associated:human': 'human_host_b',
  'root:host-associated:insecta': 'insect_b',
  'root:host-associated:mammals': 'mammals_b',
  'root:host-associated:mollusca': 'mollusca_b',
  'root:host-associated:plants': 'plant_host_b',
  'root:host-associated:porifera': 'porifera_b',
};
const biomeIconMapD4 = {
  'root:environmental:aquatic:freshwater': 'freshwater_b',
  'root:environmental:aquatic:marine': 'marine_b',
  'root:environmental:aquatic:thermal springs': 'hotspring_b',
  'root:environmental:terrestrial:soil': 'soil_b',
  'root:environmental:terrestrial:volcanic': 'vulcano_b',
  'root:host-associated:human:digestive system': 'human_gut_b',
  'root:host-associated:human:skin': 'skin_b',
};

const biomeIconMapD5 = {
  'root:environmental:aquatic:freshwater:drinking water': 'drinking_water_b',
  'root:environmental:aquatic:freshwater:groundwater': 'groundwater_b',
  'root:environmental:aquatic:freshwater:ice': 'ice_b',
  'root:environmental:aquatic:freshwater:lake': 'lake_b',
  'root:environmental:aquatic:freshwater:lotic': 'river_b',
  'root:environmental:aquatic:marine:hydrothermal vents':
    'hydrothermal_vents_b',
  'root:environmental:terrestrial:soil:wetlands': 'wetlands_b',
  'root:host-associated:human:digestive system:oral': 'mouth_b',
  'root:host-associated:human:respiratory system:pulmonary system': 'lung_b',
  'root:host-associated:mammals:nervous system:brain': 'brain_b',
};

const biomeIconMapD6 = {
  'root:environmental:aquatic:freshwater:groundwater:cave water': 'cave_b',
  'root:environmental:aquatic:freshwater:ice:glacier': 'glacier_b',
  'root:environmental:terrestrial:soil:grasslands': 'grassland_b',
  'root:environmental:terrestrial:soil:loam:forest soil': 'forest_b',
  'root:environmental:terrestrial:soil:sand:desert': 'desert_b',
};

/**
 * Retrieve biome icon for a lineage
 */
export function getBiomeIcon(lineage: string): string {
  const lineageList = (lineage || '').split(':').map((x) => x.toLowerCase());

  const lineageD2 = lineageList.slice(0, 2).join(':');
  const lineageD3 = lineageList.slice(0, 3).join(':');
  const lineageD4 = lineageList.slice(0, 4).join(':');
  const lineageD5 = lineageList.slice(0, 5).join(':');
  const lineageD6 = lineageList.slice(0, 6).join(':');

  const biome =
    biomeIconMapD6[lineageD6] ||
    biomeIconMapD5[lineageD5] ||
    biomeIconMapD4[lineageD4] ||
    biomeIconMapD3[lineageD3] ||
    biomeIconMapD2[lineageD2] ||
    'default_b';
  return biome;
}
type Biome = { icon: string; name: string };
export function simplifyBiomeIcons(biomes: Biome[]): Biome[] {
  const groupedBiomes = {};
  biomes.forEach((b: Biome) => {
    if (groupedBiomes[b.icon]) {
      groupedBiomes[b.icon].push(b.name);
    } else {
      groupedBiomes[b.icon] = [b.name];
    }
  });
  const icons: Biome[] = [];
  Object.keys(groupedBiomes).forEach((biomeIcon) => {
    const biomesInGroup: string = groupedBiomes[biomeIcon].sort().join(', ');
    icons.push({ name: biomesInGroup, icon: biomeIcon });
  });
  return icons;
}
