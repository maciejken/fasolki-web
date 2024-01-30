import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

export function getBasicAuth(email: string, password: string) {
  return `Basic ${btoa(`${email}:${password}`)}`;
}

export async function getRegistrationToken(apiUrl: string, basicAuth: string) {
  const response = await fetch(`${apiUrl}/registration/token`, {
    headers: {
      Authorization: basicAuth,
    }
  })
  return response.json();
}

export async function getAuthenticationToken(apiUrl: string, basicAuth: string) {
  const response = await fetch(`${apiUrl}/authentication/token`, {
    headers: {
      Authorization: basicAuth,
    }
  })
  return response.json();
}

export async function getAuthenticationOptions(apiUrl: string, auth: string) {
  const response = await fetch(`${apiUrl}/authentication/options`, {
    headers: {
      Authorization: auth,
    },
  });
  return response.json();
}

export async function getAuthenticationInfo({ apiUrl, auth, attestation }) {
  const response = await fetch(
    `${apiUrl}/authentication/info`,
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attestation),
    },
  );
  return response.json();
}

export async function getRegistrationInfo({ apiUrl, attestation, auth }) {
  const response = await fetch(
    `${apiUrl}/registration/info`,
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attestation),
    },
  );
  return response.json();
}

export async function getRegistrationOptions({
  apiUrl,
  auth,
  platform,
}: {
  apiUrl: string;
  auth: string;
  platform: boolean;
}): PublicKeyCredentialCreationOptionsJSON {
  const url = `${apiUrl}/registration/options?${new URLSearchParams({ platform })}`;
  const response = await fetch(url, {
    headers: {
      Authorization: auth,
    },
  });
  return response.json();
}

export async function registerAuthenticator({
  apiUrl,
  platform,
  token  
}: {
  apiUrl: string;
  platform: boolean;
  token: string;
}) {
  const auth = `Bearer ${token}`;

    try {
      const options = await getRegistrationOptions({
        apiUrl,
        auth,
        platform
      });
      const attestation = await startRegistration(options);
      let registrationInfo;

    if (attestation) {
      registrationInfo = await getRegistrationInfo({
        apiUrl,
        auth,
        attestation
      });
    }

    if (registrationInfo) {
      console.log("registration info:", registrationInfo);
    }

    return !!registrationInfo?.userVerified;
  } catch (e) {
    throw new Error("Failed to register new authenticator.", e);
  }
}

export async function authenticate(apiUrl: string, token: string): Promise<boolean> {
  const auth = `Bearer ${token}`;
  try {
    const options = await getAuthenticationOptions(apiUrl, auth);
    const attestation = await startAuthentication(options);
    let authenticationInfo;

    if (attestation) {
      authenticationInfo = await getAuthenticationInfo({
        apiUrl,
        auth,
        attestation
      });
    }

    if (authenticationInfo) {
      console.log("authentication info:", authenticationInfo);
    }

    return !!authenticationInfo?.userVerified;
  } catch (e) {
    throw new Error("Failed to authenticate.", e);
  }
}
