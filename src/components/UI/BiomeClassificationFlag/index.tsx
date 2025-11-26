import { getBiomeIcon } from 'utils/biomes';

export function BiomeClassificationFlag(props: { lineage: string }) {
  return (
    <div className="vf-flag vf-flag--middle vf-flag--100">
      <div className="vf-flag__media">
        <div
          className={`biome_icon icon_sm ${getBiomeIcon(props.lineage)}`}
          style={{ float: 'initial' }}
        />
      </div>
      <div className="vf-flag__body">{props.lineage}</div>
    </div>
  );
}
