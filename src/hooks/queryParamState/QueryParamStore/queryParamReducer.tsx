type ActionMap<M extends { [key: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: string;
      }
    : {
        type: string;
        payload: M[Key];
      };
};

export enum ActionTypes {
  Subscribe = 'subscribe_param',
  Update = 'update_param',
  Unsubscribe = 'unsubscribe_param',
  Clear = 'clear_params',
  CreateFromURL = 'create_param_from_url',
}

export type ParamPayload = {
  [ActionTypes.Subscribe]: {
    name: string;
    defaultValue: unknown;
    serializer: (str: string) => unknown;
    subscriber: SubscriberType;
  };
  [ActionTypes.Update]: {
    name: string;
    value: unknown;
  };
  [ActionTypes.CreateFromURL]: {
    name: string;
    value: unknown;
  };
  [ActionTypes.Unsubscribe]: {
    name: string;
    subscriber: SubscriberType;
  };
  [ActionTypes.Clear]: Record<string, never>;
};

export type Param = {
  name: string;
  defaultValue: unknown;
  serializer: (str: string) => unknown;
  value: string;
  subscribers: SubscriberType[];
};

export type Params = {
  [key: string]: Param;
};

export type GlobalState = {
  params: Params;
};

type SubscriberType = string;

export type ParamActions =
  ActionMap<ParamPayload>[keyof ActionMap<ParamPayload>];

export const subscribeToParam = (
  payload: ParamPayload[ActionTypes.Subscribe]
) => ({
  type: ActionTypes.Subscribe,
  payload,
});

export const updateParam = (payload: ParamPayload[ActionTypes.Update]) => ({
  type: ActionTypes.Update,
  payload,
});

export const unsubscribeFromParam = (
  payload: ParamPayload[ActionTypes.Unsubscribe]
) => ({
  type: ActionTypes.Unsubscribe,
  payload,
});

export const clearParams = (payload: ParamPayload[ActionTypes.Clear]) => ({
  type: ActionTypes.Clear,
  payload,
});

export const createParamFromURL = (
  payload: ParamPayload[ActionTypes.CreateFromURL]
) => ({
  type: ActionTypes.CreateFromURL,
  payload,
});

export const queryParamsReducer = (
  // eslint-disable-next-line default-param-last
  state: GlobalState,
  action: ParamActions
): GlobalState => {
  if (action.type === ActionTypes.Subscribe) {
    // A component has mounted that needs access to a global-state parameter.
    // Either add the component do the param's subscribers, or create it
    // in global store.
    const payload = action.payload as ParamPayload[ActionTypes.Subscribe];
    const nextParam =
      state.params[payload.name] ||
      ({
        name: payload.name,
        value: payload.defaultValue,
        defaultValue: payload.defaultValue,
        serializer: payload.serializer || String,
        subscribers: [],
      } as Param);
    nextParam.subscribers.push(payload.subscriber);
    return {
      ...state,
      params: { ...state.params, [action.payload.name]: nextParam },
    };
  }

  if (action.type === ActionTypes.CreateFromURL) {
    // A page has been loaded with URL search parameters.
    // Register the parameter's value in the global store, so that components
    // can subscribe to it.
    // Subscribers will initially be empty, but they will almost always be used
    // by components on the page (if a URL was copy-pasted), and cleared up
    // later anyway.
    const payload = action.payload as ParamPayload[ActionTypes.CreateFromURL];
    return {
      ...state,
      params: {
        ...state.params,
        [action.payload.name]: {
          name: payload.name,
          value: payload.value,
          defaultValue: '',
          serializer: String,
          subscribers: [],
        } as Param,
      },
    };
  }

  if (action.type === ActionTypes.Update) {
    // Usually when a subscribing component wants to update a param in the
    // global store.
    const payload = action.payload as ParamPayload[ActionTypes.Update];
    return {
      ...state,
      params: {
        ...state.params,
        [action.payload.name]: {
          ...state.params[payload.name],
          value: payload.value,
        } as Param,
      },
    };
  }

  if (action.type === ActionTypes.Unsubscribe) {
    // A component is unmounted, and stops listening to the param.
    const payload = action.payload as ParamPayload[ActionTypes.Unsubscribe];
    const nextSubscribers = state.params[
      action.payload.name
    ].subscribers.filter((sub) => sub !== payload.subscriber);
    if (nextSubscribers.length > 0) {
      return {
        ...state,
        params: {
          ...state.params,
          [payload.name]: {
            ...state.params[payload.name],
            subscribers: nextSubscribers,
          } as Param,
        },
      };
    }
    // Remove the param from global store if there are now no components
    // subscribing to it.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [payload.name]: _, ...remaining } = state.params;
    return {
      ...state,
      params: remaining,
    };
  }
  if (action.type === ActionTypes.Clear) {
    // Clear all params from the global store.
    // A bit nuclear, but useful for a "clear" action on pages with many
    // stateful components.
    return { ...state, params: {} };
  }
  return state;
};
