import { startRegistration } from "@simplewebauthn/browser";

const apiUrl = "https://flat-mouse-55.deno.dev";
// const apiUrl = "http://localhost:4000";

export default async function registerAuthenticator(
  basicAuth: string,
  platform?: boolean
) {
  console.log("start registration");
  console.log("auth:", basicAuth);
  console.log("platform:", platform);
  let attResp;
  let isAuthenticated = false;
  const response = await fetch(
    `${apiUrl}/registration/options?${new URLSearchParams({
      platform: platform ? "true" : "false",
    })}`,
    {
      headers: {
        Authorization: basicAuth,
      },
    }
  );
  const registrationOptions = await response.json();
  console.log("registration options:", JSON.stringify(registrationOptions));

  if (registrationOptions) {
    attResp = await startRegistration(registrationOptions);
    console.log("device attestation:", attResp);
  }

  if (attResp) {
    const verificationResp = await fetch(
      `${apiUrl}/registration/authenticator`,
      {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attResp),
      }
    );

    const verificationJson = await verificationResp.json();
    console.log("verification json:", verificationJson);
    isAuthenticated = !!verificationJson?.credentialID;
  }
  return isAuthenticated;
}
