import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/types";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";

interface ValidationParams<T> {
  apiUrl: string;
  data: T;
  auth: string;
}

export function getBasicAuth(email: string, password: string) {
  return `Basic ${btoa(`${email}:${password}`)}`;
}

export async function getRegistrationToken(apiUrl: string, basicAuth: string) {
  const response = await fetch(`${apiUrl}/registration/token`, {
    headers: {
      Authorization: basicAuth,
    },
  });
  return response.json();
}

export async function getAuthenticationToken(
  apiUrl: string,
  basicAuth: string,
) {
  const response = await fetch(`${apiUrl}/authentication/token`, {
    headers: {
      Authorization: basicAuth,
    },
  });
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

export async function getAuthenticationInfo(
  { apiUrl, auth, data }: ValidationParams<AuthenticationResponseJSON>,
) {
  const response = await fetch(
    `${apiUrl}/authentication/info`,
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  return response.json();
}

export async function getRegistrationInfo(
  { apiUrl, data, auth }: ValidationParams<RegistrationResponseJSON>,
) {
  const response = await fetch(
    `${apiUrl}/registration/info`,
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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
}): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const url = `${apiUrl}/registration/options?${new URLSearchParams({
    platform: String(platform),
  })}`;
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
  token,
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
      platform,
    });
    const data: RegistrationResponseJSON = await startRegistration(
      options,
    );
    let registrationInfo;

    if (data) {
      registrationInfo = await getRegistrationInfo({
        apiUrl,
        auth,
        data,
      });
    }

    return !!registrationInfo?.userVerified;
  } catch (e) {
    throw new Error("Failed to register new authenticator.", e);
  }
}

export async function authenticate(
  apiUrl: string,
  token: string,
): Promise<string | undefined> {
  if ("function" !== typeof navigator.credentials?.create) {
    throw new Error("Webauthn not supported.");
  }

  const auth = `Bearer ${token}`;
  const options = await getAuthenticationOptions(apiUrl, auth);
  const data: AuthenticationResponseJSON = await startAuthentication(
    options,
  );
  let authenticationInfo;

  if (data) {
    authenticationInfo = await getAuthenticationInfo({
      apiUrl,
      auth,
      data,
    });
  }

  return authenticationInfo?.token;
}
