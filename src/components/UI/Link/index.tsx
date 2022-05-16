/* eslint-disable react/jsx-props-no-spreading */

import {
  useLinkClickHandler,
  Link as DefaultLink,
  LinkProps as DefaultLinkProps,
} from 'react-router-dom';
import React, { ForwardedRef } from 'react';
import { createParamFromURL } from 'hooks/queryParamState/QueryParamStore/queryParamReducer';
import useQueryParamsStore from 'hooks/queryParamState/QueryParamStore/useQueryParamsStore';
import { forEach } from 'lodash-es';

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

    const { dispatch } = useQueryParamsStore();
    const setQueryParam = (value: string, name: string) => {
      dispatch(
        createParamFromURL({
          name,
          value,
        })
      );
    };

    return (
      <DefaultLink
        {...rest}
        to={to}
        onClick={(event) => {
          onClick?.(event);
          if (state) {
            forEach(state, setQueryParam);
          }
          let stringOfParams = '';
          if (typeof to === 'string' && to.indexOf('?') > -1) {
            [, stringOfParams] = to.split('?');
          } else if (
            to.search &&
            typeof to.search === 'string' &&
            to.search.indexOf('?') > -1
          ) {
            [, stringOfParams] = to.search.split('?');
          }
          new URLSearchParams(stringOfParams).forEach(setQueryParam);

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

export default Link;
