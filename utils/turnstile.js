
export const validateToken = async (token, secret) => {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        response: token,
        secret: secret,
      })
    },
  );

  const data = await response.json();

  return {
    // Return the status
    success: data.success,

    // Return the first error if it exists
    error: data['error-codes']?.length ? data['error-codes'][0] : null,
  };
}