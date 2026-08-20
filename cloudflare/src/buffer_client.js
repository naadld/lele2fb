/**
 * Buffer GraphQL Client for Account 2 (Posts & Groups)
 */

const BUFFER_GRAPHQL_ENDPOINT = "https://api.buffer.com/graphql";

/**
 * Publish / Queue a Post to Buffer Channel
 */
export async function publishPostToBuffer(accessToken, channelId, text, mediaUrls = [], serviceType = "facebook") {
  if (!accessToken || !channelId) {
    throw new Error("Missing Buffer access token or channel ID for Account 2.");
  }

  const mutation = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            status
          }
        }
        ... on InvalidInputError {
          message
        }
        ... on UnauthorizedError {
          message
        }
        ... on LimitReachedError {
          message
        }
      }
    }
  `;

  const input = {
    channelId: channelId,
    text: text,
    mode: "addToQueue",
    needsApproval: false,
    schedulingType: "automatic",
    saveToDraft: false
  };

  if (serviceType === "facebook") {
    input.metadata = {
      facebook: { type: "post" }
    };
  }

  if (mediaUrls && mediaUrls.length > 0) {
    input.assets = {
      images: mediaUrls.map(url => ({ url: url }))
    };
  }

  const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input: input }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Buffer API HTTP Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data.errors && data.errors.length > 0) {
    throw new Error(`Buffer GraphQL Error: ${data.errors[0].message}`);
  }

  const result = data.data?.createPost;
  if (result?.message) {
    throw new Error(`Buffer Action Error: ${result.message}`);
  }

  return result?.post;
}
