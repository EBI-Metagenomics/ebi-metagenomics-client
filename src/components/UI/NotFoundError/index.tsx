import MGnifyError from 'images/mgnify_error.svg';

const NotFoundError = () => {
  return (
    <article className="vf-card vf-card--brand vf-card--bordered">
      <img
        src={MGnifyError}
        alt="MGnify error logo"
        style={{ width: '100%', maxWidth: '480px', padding: '20px' }}
        loading="lazy"
      />
      <div className="vf-card__content | vf-stack vf-stack--400">
        <h3 className="vf-card__heading">Oh no!</h3>
        <p className="vf-card__subheading">Page not found</p>
        <p className="vf-card__text">
          Contact us if you believe this is an error.
        </p>
      </div>
    </article>
  );
};

export default NotFoundError;
