window.addEventListener('DOMContentLoaded', init);

function init() {

    chooserBtn.onclick = async () => {
        const files = await selectFiles();
        handleFiles(files);
    }

}

function log(...str) {
    console.log(...str);

    const div = document.createElement('div');
    div.classList.add('log-line');
    div.innerText = str.join(' ');
    logContainer.appendChild(div);
}

async function handleFiles(files) {
    console.log(files);
    const images = [];

    log('Making images...');

    for(let file of files) {
        if(file.name.match('.png')) {
            images.push(await file.getFile());
        }
    }

    const imgs = await makeImages(images);
    log('Images made.');

    log('Combining to gif..');
    const gif = await makeGif(imgs, 
        inputWidth.valueAsNumber,
        inputHeight.valueAsNumber,
        inputFps.valueAsNumber
    );
    mainElement.appendChild(gif);
}

async function makeGif(
    images,
    width, 
    height,
    fps = 24
) {
    return new Promise((resolve) => {
        const gif = new GIF({
            width,
            height,
            workers: 2,
            quality: 20,
            repeat: 0,
            background: "transparent",
            transparent: 0x000000
        });
        
        const canvas = document.createElement('canvas');
        const ctxt = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;

        for(let img of images) {
            ctxt.clearRect(0, 0, width, height);
            ctxt.drawImage(img, 0, 0, width, height);

            gif.addFrame(canvas, {
                copy: true,
                delay: 1000 / fps
            });
        }
        
        gif.on('finished', function(blob) {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = () => {
                log('Done.');
                resolve(img);
            }
        });
        
        log('Rendering gif...');
        gif.render();
    })
}

async function makeImages(imageFiles) {
    const imgs = [];

    const makeImage = imageFile => new Promise(resolve => {
        const imageUrl = URL.createObjectURL(imageFile);
        const img = new Image();
        img.onload = () => {
            resolve(img);
        }
        img.src = imageUrl;
    })

    for(let imageFile of imageFiles) {
        imgs.push(await makeImage(imageFile));
    }

    return imgs;
}

async function selectFiles() {
    return window.showOpenFilePicker({
        multiple: true
    });
}
