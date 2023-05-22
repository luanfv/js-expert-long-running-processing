import { createServer } from 'http'
import { parse, fileURLToPath } from 'url'
import { Worker } from 'worker_threads'

// https://sharp.pixelplumbing.com/install#worker-threads
import sharp from 'sharp'


import { dirname } from 'path'
const currentFolder = dirname(fileURLToPath(import.meta.url))
const workerFileName = 'worker.js'
async function joinImages(images) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`${currentFolder}/${workerFileName}`)
        worker.postMessage(images)
        worker.once('message', resolve)
        worker.once('error', reject)
        worker.once('exit', code => {
            if(code !== 0) {
                return reject(new Error(`Thread ${worker.threadId} stopped with exit code ${code}`))
            }

            console.log(`the thread ${worker.threadId} exited!`)
        })
    })

}

async function handler(request, response) {
    if (request.url.includes('joinImages')) {
        const { query: { background, img } } = parse(request.url, true)
        const imageBase64 = await joinImages({ 
            image: img,

            background
        })

        response.writeHead(200, {
            'Content-Type': 'text/html'
        })

        response.end(`<img style="width:100%;height:100%" src="data:image/jpeg;base64,${imageBase64}" />`)
        return;
    }


    return response.end('ok')
}

createServer(handler)
    .listen(3000, () => console.log('running at 3000'))



// localhost:3000/joinImages?img=https://static.wikia.nocookie.net/mkwikia/images/e/ee/Predator_render.png&background=https://wallpaperaccess.com/full/3057585.jpg

// https://static.wikia.nocookie.net/mkwikia/images/e/ee/Predator_render.png
// https://static3.tcdn.com.br/img/img_prod/460977/boneco_tracker_predator_predador_predadores_predators_escala_1_6_mms147_hot_toys_cg_43510_1_20190427140400.png

// backgrounds
// https://wallpaperaccess.com/full/3057585.jpg
// https://awwsomeh.files.wordpress.com/2017/12/yfbqz1vppi601.jpg
// https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABRPLprn1P2wY8q1TQyq3EMxtpu9QLNIigmtLeMKUudkxe8DBkXBj3fEhmwv8mWS8IP8Lrvi4vsPCncmgi8ewQTqdFEMw.jpg?r=1e8