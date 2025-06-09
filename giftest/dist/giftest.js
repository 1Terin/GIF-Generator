import fetch from 'node-fetch';
export const handler = async (event) => {
    const apiKeyGg = process.env.api_key_gg;

    try {
        let prompt = event.queryStringParameters?.prompt;
        if (!prompt) {
            const path = event.rawPath || "";
            prompt = path.split('/gif-gen/')[1];
        }

        const GifURL = `https://api.giphy.com/v1/gifs/translate?api_key=${apiKeyGg}&s=${prompt}&weirdness=4`;
        const response = await fetch(GifURL);

        if (!response.ok) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "GIF not found" })
            };
        }

        const imageData = await response.json();
        const gifDirectURL = imageData?.data?.images?.original?.url;

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

        const gifBuffer = await gifResponse.arrayBuffer();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/gif'
            },
            body: Buffer.from(gifBuffer).toString('base64'),
            isBase64Encoded: true
        };
    }

    catch (err) {
        console.error("Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
