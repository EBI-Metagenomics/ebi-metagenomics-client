import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import useApiData from '@/hooks/data/useApiData';
import { ViralFragment } from '@/interfaces';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import ExtLink from 'components/UI/ExtLink';
import UserContext from 'pages/Login/UserContext';
import {
  RepresentativeOccurrences,
  MemberOccurrences,
} from 'components/Viruses/Occurrences';

const ViralFragmentPage: React.FC = () => {
  const { catalogueId = '', accession = '' } = useParams();
  const { config } = useContext(UserContext);
  const { data, loading, error } = useApiData<ViralFragment>({
    url: `${config.api_v2}viruses/catalogues/${catalogueId}/fragments/${accession}`,
  });
  if (error) return <FetchError error={error} />;
  if (loading || !data) return <Loading />;
  const details = {
    'Original sequence': data.original_id,
    'Length (bp)': data.length.toLocaleString(),
    'Prediction tool': data.prediction_tool,
    'CheckV quality': data.checkv_quality,
    'MIUViG quality': data.miuvig_quality,
    Completeness:
      data.completeness == null ? 'Unknown' : `${data.completeness}%`,
    Contamination:
      data.contamination == null ? 'Unknown' : `${data.contamination}%`,
    Type: data.sequence_type === 'prophage' ? 'Prophage' : 'Virus',
    'CheckV provirus': data.is_provirus ? 'Yes' : 'No',
    Source: data.source_type === 'genome' ? 'Genome' : 'Assembly analysis',
    'Source lineage': data.source_lineage,
    'Nucleotide sequence SHA256':
      data.nt_sequence_sha256 ?? data.sequence_sha256,
    'Cluster size': data.cluster_size?.toLocaleString() ?? 'Unknown',
  };
  return (
    <section className="vf-content">
      <Breadcrumbs
        links={[
          { label: 'Home', url: '/' },
          { label: 'MGnify Viruses', url: '/browse/viruses' },
          { label: catalogueId, url: `/viral-catalogues/${catalogueId}` },
          { label: accession },
        ]}
      />
      <h2>Viral cluster representative {data.accession}</h2>
      <dl>
        {Object.entries(details).map(([label, value]) => (
          <React.Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value || 'Unknown'}</dd>
          </React.Fragment>
        ))}
        <dt>Source accession</dt>
        <dd>
          {data.source_accession.startsWith('MGYA') ? (
            <Link to={`/analyses/${data.source_accession}`}>
              {data.source_accession}
            </Link>
          ) : (
            <ExtLink
              href={`https://www.ebi.ac.uk/ena/browser/view/${encodeURIComponent(
                data.source_accession
              )}`}
            >
              {data.source_accession}
            </ExtLink>
          )}
        </dd>
        {data.source_genome_accession && (
          <>
            <dt>MGnify genome</dt>
            <dd>
              <Link to={`/genomes/${data.source_genome_accession}`}>
                {data.source_genome_accession}
              </Link>
            </dd>
          </>
        )}
        {data.source_analysis_accession && (
          <>
            <dt>MGnify analysis</dt>
            <dd>
              <Link to={`/analyses/${data.source_analysis_accession}`}>
                {data.source_analysis_accession}
              </Link>
            </dd>
          </>
        )}
        {data.source_sample && (
          <>
            <dt>Source sample</dt>
            <dd>
              <ExtLink
                href={`https://www.ebi.ac.uk/ena/browser/view/${encodeURIComponent(
                  data.source_sample
                )}`}
              >
                {data.source_sample}
              </ExtLink>
            </dd>
          </>
        )}
        {data.source_study && (
          <>
            <dt>Source study</dt>
            <dd>
              <ExtLink
                href={`https://www.ebi.ac.uk/ena/browser/view/${encodeURIComponent(
                  data.source_study
                )}`}
              >
                {data.source_study}
              </ExtLink>
            </dd>
          </>
        )}
        <dt>Cluster representative</dt>
        <dd>
          <Link
            to={`/viral-catalogues/${catalogueId}/fragments/${data.cluster_representative}`}
          >
            {data.cluster_representative}
          </Link>
        </dd>
      </dl>
      <h3>Representative occurrences</h3>
      <RepresentativeOccurrences occurrences={data.occurrences ?? []} />
      <h3>Cluster member occurrences</h3>
      <p>
        These detections belong to the other sequences in this
        representative&apos;s cluster.
      </p>
      <MemberOccurrences occurrences={data.cluster_member_occurrences ?? []} />
      <h3>Taxonomy</h3>
      <dl>
        {Object.entries(data.taxonomy).map(([tool, lineage]) => (
          <React.Fragment key={tool}>
            <dt>{tool}</dt>
            <dd>
              {!lineage || lineage === 'missing' ? 'Unclassified' : lineage}
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </section>
  );
};

export default ViralFragmentPage;
