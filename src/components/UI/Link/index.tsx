import { Link as DefaultLink, LinkProps as DefaultLinkProps, useLinkClickHandler } from 'react-router-dom';
import React, { ForwardedRef } from 'react';

const Link: React.FC<DefaultLinkProps> = React.forwardRef(
  (
    { onClick, replace = false, state, target, to, ...rest },
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    // Drop-in replacement for react-router-dom Link that is compatible
    // with the EMG implementation of QueryParam State.
    // On transition, it sets query params for any of:
    // - params after a ? in to: String.
    // - key:value pairs in state: {}
    // - key:value pairs in to: {query}

    const handleClick = useLinkClickHandler(to, {
      replace,
      state,
      target,
    });

    return (
      <DefaultLink
        {...rest}
        to={to}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            handleClick(event);
          }
        }}
        ref={ref}
        target={target}
      />
    );
  }
);
Link.displayName = 'Link';
export default Link;
