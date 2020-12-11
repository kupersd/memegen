'use strict'
var gCanvas;
var gCtx;
var gFocus = true;

function onInit() {
    gCanvas = document.querySelector('canvas')
    gCtx = gCanvas.getContext('2d')
    createMemes();
    // window.addEventListener('resize', function(){
        if (window.innerWidth/2 > 500) {
            gCanvas.width = 500;    
            gCanvas.height = 500; 
            console.log('aaaaaa')   
            return
        } 
        gCanvas.width = window.innerWidth*0.7
        gCanvas.height = window.innerWidth*0.7
    // })
}

function renderCanvas() {
    const imgSrc = getImg();
    const lines = getLines();
    drawImg(imgSrc, lines);
}

function renderLines(lines) {
    lines.forEach(line => drawText(line));
}

function onInputText() {
    const text = document.querySelector('input[name=inputText]').value;
    setLineText(text);
    renderCanvas() // TODO: handle overflow text and line break? no need because of drag... 
}

function onImgChosen(imgId) {
    const elEditor = document.querySelector('.editor')
    elEditor.style.display = 'flex'
    setImgChosen(+imgId)
    console.log(+imgId, imgId)
    renderCanvas();
    document.querySelector('input[name=inputText]').value = ''
    document.querySelector('.img-gallery').style.display = 'none'
}

function onLineMove(diff) {
    moveLine(diff);
    renderCanvas();
}

function onChangeFontSize(diff) {
    changeFontSize(diff);
    renderCanvas();
}

function onChangeAlignment(alignment) {
    changeAlignment(alignment)
    renderCanvas();
}

function onLineAdd() {
    addLine();
    document.querySelector('input[name=inputText]').value = ''
    renderCanvas()
}

function onLineDel() {
    delLine();
    document.querySelector('input[name=inputText]').value = ''
    renderCanvas();
}

function onLineSwitch() {
    switchSelectedLine();
    document.querySelector('input[name=inputText]').value = getLine().txt;
    renderCanvas();
}

function onChangedStroke() {
    const color = document.querySelector('input[name=stroke]').value;
    changeStroke(color)
    renderCanvas()
}

function onChangedFill() {
    const color = document.querySelector('input[name=fill]').value;
    changeFill(color)
    renderCanvas();
}

function onChangedFont() {
    var font = document.querySelector('input[name=font]').value;
    font = font.toLowerCase()
    changeFont(font);
    renderCanvas();
}

function handleTouchStart(ev) {
    ev.preventDefault()
    const offset = {
        offsetX: ev.targetTouches[0].pageX - ev.target.getBoundingClientRect().left,
        offsetY: ev.targetTouches[0].pageY - ev.target.getBoundingClientRect().top
    }
    onCanvasMouseDown(offset)
}

function handleTouchEnd(ev) {
    ev.preventDefault()
    onCanvasMouseUp()
    
}

function handleTouchMove(ev) {
    ev.preventDefault()
    const offset = {
        offsetX: ev.targetTouches[0].pageX - ev.target.getBoundingClientRect().left,
        offsetY: ev.targetTouches[0].pageY - ev.target.getBoundingClientRect().top
    }
    onCanvasMouseMove(offset)
}

function onCanvasMouseDown(ev) {
    let { offsetX, offsetY } = ev;
    setMoveActive(true, offsetX, offsetY);
    if (checkClickPosition (offsetX, offsetY) !== -1) {
        renderCanvas();
    }
}

function onCanvasMouseUp() {
    setMoveActive(false);
    document.querySelector('input[name=inputText]').value = getLine().txt;
}

function onCanvasMouseMove(ev) {
    // console.log('moveX',ev.movementX,'moveY',ev.movementY)
    if (!getIsMoveActive()) return;
    let { offsetX, offsetY } = ev;
    setLineLocation(offsetX, offsetY);
    renderCanvas();
}

function onCanvasClick(ev) {
    ev.stopPropagation();
    let { offsetX, offsetY } = ev;
    if (checkClickPosition (offsetX, offsetY) === -1) {
        if (!getLine().txt) return // not to lose focus on first line
        gFocus = false;
        renderCanvas();
    }
}

function onDownloadCanvas(elLink) {
    const img = gCanvas.toDataURL('image/jpeg');
    elLink.href = img;
    elLink.download = 'Meme.jpg';
}
// Draw canvas without the focus
function onScreenClicked() {
    renderCanvas();
    gFocus = false;
}

function onSaveMeme() {
    const img = gCanvas.toDataURL('image/jpeg');
    // elLink.href = img;
    // elLink.download = 'Meme.jpg';
    saveMeme(img)
    renderCanvas()
    document.querySelector('input[name=inputText]').value = '';
    const elModal = document.querySelector('.modal');
    console.log(elModal)
    elModal.hidden = false
}

function onCloseModal() {
    const elModal = document.querySelector('.modal');
    elModal.hidden = true;
}
function drawImg(imgSrc, lines) {
    var img = new Image();
    img.src = imgSrc;
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height)
        renderLines(lines);
        drawFocus();
    }
}

function onDeleteMeme(id) {
    deleteMeme(id);
    onShowMemes();
}

function onShowMemes() {
    const elEditor = document.querySelector('.editor')
    elEditor.style.display = 'none'
    const memes = getMemes();
    memes.forEach(meme => {
        const img = gCanvas.toDataURL('image/jpeg');
    })
    var strHTMLs = memes.map(meme => {
        // return `<a href="${meme.img}" download="Meme-${meme.id}"><img
        // src="${meme.img}"></a>`
        return `<div>
                    <img src="${meme.img}">
                    <div class = "flex align-center space-between">
                        <a class = "download-meme" href="${meme.img}" download="Meme-${meme.id}"><img src="img/download.png"></a>
                        <img onclick = "onDeleteMeme(${meme.id})" class = "del-meme" src="img/trash.png">
                    </div>
                </div>`
    })
    const elMemeList = document.querySelector('.meme-list')
    elMemeList.innerHTML = strHTMLs.join('');
    const elImgGallery = document.querySelector('.img-gallery')
    elImgGallery.style.display = 'none'
    elMemeList.style.display = 'grid'
}

function onShowGallery() {
    const elEditor = document.querySelector('.editor')
    elEditor.style.display = 'none'
    const elMemeList = document.querySelector('.meme-list')
    elMemeList.style.display = 'none'
    const elImgGallery = document.querySelector('.img-gallery')
    elImgGallery.style.display = 'grid'
}



function drawText(line) {
    gCtx.lineWidth = '1.5'
    gCtx.strokeStyle = line.strokeColor;
    gCtx.fillStyle = line.color
    gCtx.font = `900 ${line.size}px ${line.font}` //TODO: understand the first parameter
    gCtx.textAlign = line.align;
    gCtx.fillText(line.txt, line.x, line.y)
    gCtx.strokeText(line.txt, line.x, line.y)
}

function drawFocus() {
    if (!gFocus) {
        gFocus = true;
        return;
    }
    const line = getLine();
    gCtx.beginPath()
    gCtx.strokeStyle = 'black'
    const width = gCtx.measureText(line.txt).width? gCtx.measureText(line.txt).width + 15: gCanvas.width-20
    gCtx.rect( line.x-5, line.y - line.size - 5, width , line.size + 10) // x,y,widht,height
    gCtx.stroke()
}