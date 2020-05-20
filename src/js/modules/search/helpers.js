const util = require('../../util');
const _ = require('underscore');

/**
 * Format biomes to name/icon for use in
 * @param {object} entry
 * @return {Array}
 */
export const convertBiomes = (entry) => {
    let biomes = [];
    _.each(entry.fields.biome, function(biome) {
        biome = 'root:' + biome.replace(/\/([^/]*)$/, '').replace(/\//g, ':');
        biomes.push({
            name: util.formatLineage(biome, true),
            icon: util.getBiomeIcon(biome)
        });
    });
    return biomes;
};
