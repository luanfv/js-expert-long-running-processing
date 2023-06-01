import { createServer } from 'http';
import { fileURLToPath, parse } from 'url';
import path from 'path';
import Piscina from 'piscina';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const piscina = new Piscina({
  filename: path.resolve(__dirname, 'workers.js'),
});

async function joinImage(image, background) {
    try {
        const response = await piscina.run({
            image,
            background,
        }, {
            name: 'createImage',
        });

        return response;
    } catch (err) {
        console.log(err);
    }
}

createServer(async (request, response) => {
    const { query: { img, background } } = parse(request.url, true);
    const imageBase64 = await joinImage(img, background);

    response.writeHead(200, {
        'Content-Type': 'text/html'
    });

    return response.end(`<img style="max-width:100%; height:100%;" src="data:image/jpeg;base64,${imageBase64}" />`);
}).listen(3000, '0.0.0.0', () => console.log('Run at port 3000 and pid', process.pid));
