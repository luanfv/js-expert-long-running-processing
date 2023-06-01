import sharp from 'sharp';
import axios from 'axios';

async function downloadFile(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });

    return response.data;
}

async function createImage({ image, background }) {
    const firstLayer = await sharp(await downloadFile(image))
        .toBuffer();
    
    const secondLayer =  await sharp(await downloadFile(background))
        .composite(
            [
                { input: firstLayer, gravity: sharp.gravity.south },
                {input: firstLayer, gravity: sharp.gravity.east},
                {input: firstLayer, gravity: sharp.gravity.west},
                {input: firstLayer, gravity: sharp.gravity.north, left: 670, top: 0},
            ],
        )
        .toBuffer();

    return secondLayer.toString('base64');
}

export { downloadFile, createImage }