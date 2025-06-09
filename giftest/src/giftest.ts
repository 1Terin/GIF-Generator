import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import fetch from 'node-fetch';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const apiKeyGg: string | undefined = process.env.api_key_gg;

  try {
    let prompt: string | undefined = event.queryStringParameters?.prompt;
    if (!prompt) {
      const path: string = event.rawPath || "";
      prompt = path.split('/gif-gen/')[1];
    }

    const GifURL: string = `https://api.giphy.com/v1/gifs/translate?api_key=${apiKeyGg}&s=${prompt}&weirdness=4`;
    const response = await fetch(GifURL);

    if (!response.ok) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "GIF not found" })
      };
    }

    const imageData: any = await response.json();
    const gifDirectURL: string | undefined = imageData?.data?.images?.original?.url;

    if (!gifDirectURL) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No GIF found for the prompt." })
      };
    }

    const gifResponse = await fetch(gifDirectURL);
    if (!gifResponse.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Failed to retrieve gif content" })
      };
    }

    const gifBuffer: ArrayBuffer = await gifResponse.arrayBuffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/gif'
      },
      body: Buffer.from(gifBuffer).toString('base64'),
      isBase64Encoded: true
    };

  } catch (err: any) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
