import React, { useContext, useState } from 'react';
import InnerCard from 'components/UI/InnerCard';
import OutterCard from 'components/UI/OutterCard';
import EMGModal from 'components/UI/EMGModal';
import UserContext from 'src/pages/Login/UserContext';
import LatestStudies from './LatestStudies';
import RequestPublic from './Public';

const INITIAL_MODAL = {
  show: false,
  isPublic: true,
};
const SearchBy: React.FC = () => {
  const [modal, setModal] = useState(INITIAL_MODAL);
  const { isAuthenticated } = useContext(UserContext);
  return (
    <>
      <EMGModal
        isOpen={modal.show}
        onRequestClose={() => setModal(INITIAL_MODAL)}
        contentLabel="Request Analysis"
      >
        {modal.isPublic ? <RequestPublic /> : <div>YEBO!</div>}
      </EMGModal>
      <OutterCard className="request-by-section">
        <h3 className="vf-card__heading">Request analysis of</h3>
        <div className="vf-grid">
          <InnerCard
            title="Submit and/or Request"
            label="Your data"
            to={
              isAuthenticated
                ? () => setModal({ show: true, isPublic: false })
                : '/login?from=private-request'
            }
          />
          <InnerCard
            title="Request"
            label="A public dataset"
            to={
              isAuthenticated
                ? () => setModal({ show: true, isPublic: true })
                : '/login?from=public-request'
            }
          />
        </div>
        <h3 className="vf-card__heading">Latest studies</h3>
        <LatestStudies />
      </OutterCard>
    </>
  );
};

export default SearchBy;
