import React, { useContext, useState } from 'react';
import InnerCard from 'components/UI/InnerCard';
import OutterCard from 'components/UI/OutterCard';
import EMGModal from 'components/UI/EMGModal';
import UserContext from 'pages/Login/UserContext';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { Link } from 'react-router-dom';
import LatestStudies from './LatestStudies';
import MailForm from './MailForm';
import PrivateRequest from './Private';

const SearchBy: React.FC = () => {
  const [{ show }] = useQueryParametersState({
    show: '',
  });
  const { isAuthenticated } = useContext(UserContext);
  const [modal, setModal] = useState({
    show:
      isAuthenticated &&
      ['public-request', 'private-request'].includes(show as string),
    isPublic: show === 'public-request',
  });
  return (
    <>
      <EMGModal
        isOpen={modal.show}
        onRequestClose={() =>
          setModal({
            show: false,
            isPublic: true,
          })
        }
        contentLabel="Request Analysis"
      >
        {modal.isPublic ? <MailForm isPublic /> : <PrivateRequest />}
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
        <div className="mg-right">
          <Link to="/browse/studies/" className="vf-button vf-button--primary">
            View all studies
          </Link>
        </div>
      </OutterCard>
    </>
  );
};

export default SearchBy;
