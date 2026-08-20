/**
 * Buffer GraphQL Client for Account 2 (Posts & Groups)
 */

const BUFFER_GRAPHQL_ENDPOINT = "https://api.buffer.com/graphql";

/**
 * Publish Image & Text Post to Buffer Channel
 */
export async function publishPostToBuffer(accessToken, channelId, text, mediaUrls = []) {
  if (!accessToken || !channelId) {
    throw new Error("Missing Buffer access token or channel ID for Account 2.");
  }

  const assetsInput = mediaUrls.map(url => `media: { url: "${url}" }`).join(", ");
  const assetsField = assetsInput ? `assets: [ { ${assetsInput} } ]` : "";

  const mutation = `
    mutation CreateDraftPost {
      createDraftPost(
        channelId: "${channelId}"
        content: {
          text: ${JSON.stringify(text)}
          ${assetsField}
        }
      ) {
        post {
          id
          createdAt
          status
        }
        userError {
          message
        }
      }
    }
  `;

  const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: mutation })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Buffer API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data.errors && data.errors.length > 0) {
    throw new Error(`Buffer GraphQL Error: ${data.errors[0].message}`);
  }

  return data.data?.createDraftPost;
}
