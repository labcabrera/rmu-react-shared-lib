import React, { ReactNode } from 'react';
import { AuthContext, AuthContextProps } from 'react-oidc-context';

// Story helpers (spec 067): a signed-in auth context and a fake fetch that answers by URL, so the components that
// call the APIs can be shown without them. Invented data only.

const auth = { isAuthenticated: true, user: { access_token: 'story' } } as unknown as AuthContextProps;

export type FakeRoute = { match: RegExp; body: (init?: RequestInit) => unknown };

/** Replaces `fetch` for the routes given (the rest go through) and returns the function that restores it. */
export const installFakeFetch = (routes: FakeRoute[]) => {
  const original = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const route = routes.find((each) => each.match.test(url));
    if (!route) return original(input, init);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return new Response(JSON.stringify(route.body(init)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  return () => {
    window.fetch = original;
  };
};

/** A signed-in auth context for the components that call `useAuth`. */
export const StoryAuth = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
);
