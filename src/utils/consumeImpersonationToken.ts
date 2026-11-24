import { jwtDecode } from 'jwt-decode';

// Run before analytics and React, so private requests use the new account immediately.
export default function consumeImpersonationToken(): void {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get('impersonation_token');
  if (token === null) return;

  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + window.location.search
  );
  try {
    const { username, exp, token_type } = jwtDecode<{
      username: string;
      exp: number;
      token_type: string;
    }>(token);
    if (!username || token_type !== 'sliding' || !(exp > Date.now() / 1000)) {
      return;
    }
    // The API verifies the signature on subsequent requests.
    localStorage.setItem('mgnify.v2.token', token);
    localStorage.setItem('mgnify.v2.username', username);
    localStorage.removeItem('mgnify.sessionExpired');
  } catch {
    // Leave the current login unchanged for malformed tokens.
  }
}
