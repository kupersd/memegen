'use strict'
const STORAGE_KEY = 'memesDB';

var gImgs = [{ id: 1, url: 'img/1.jpg', keywords: ['happy'] },
{ id: 2, url: 'img/2.jpg', keywords: ['happy'] },
{ id: 3, url: 'img/3.jpg', keywords: ['happy'] },
{ id: 4, url: 'img/4.jpg', keywords: ['happy'] },
{ id: 5, url: 'img/5.jpg', keywords: ['happy'] },
{ id: 6, url: 'img/6.jpg', keywords: ['happy'] },
{ id: 7, url: 'img/7.jpg', keywords: ['happy'] },
{ id: 8, url: 'img/8.jpg', keywords: ['happy'] },
{ id: 9, url: 'img/9.jpg', keywords: ['happy'] },
{ id: 10, url: 'img/10.jpg', keywords: ['happy'] },
{ id: 11, url: 'img/11.jpg', keywords: ['happy'] },
{ id: 12, url: 'img/12.jpg', keywords: ['happy'] },
{ id: 13, url: 'img/13.jpg', keywords: ['happy'] },
{ id: 14, url: 'img/14.jpg', keywords: ['happy'] },
{ id: 15, url: 'img/15.jpg', keywords: ['happy'] },
{ id: 16, url: 'img/16.jpg', keywords: ['happy'] },
{ id: 17, url: 'img/17.jpg', keywords: ['happy'] },
{ id: 18, url: 'img/18.jpg', keywords: ['happy'] },
];

var gMemes;
var gMeme;
var gIdx;

function createMemes() {
    var memes = loadFromStorage(STORAGE_KEY)
    console.log ('create memes')
    if (!memes || !memes.?length) {
        gIdx = 101;
        memes = [];
        gMemes = memes;
    }
    else {
        gMemes = memes;
        gIdx = gMemes[gMemes.length-1].id + 1;
    }
        
    saveToStorage(STORAGE_KEY, gMemes);
}

function getImg() {
    return gImgs.find(img => img.id === gMeme.selectedImgId).url
}

function getLine() {
    return gMeme.lines[gMeme.selectedLineIdx];
}
function getLines() {
    return gMeme.lines;
}

function setLineText(text) {
    gMeme.lines[gMeme.selectedLineIdx].txt = text;
}

function moveLine(diff) {
    gMeme.lines[gMeme.selectedLineIdx].y += diff; //TODO: relate to borders of Canvas
}

function changeFontSize(diff) {
    gMeme.lines[gMeme.selectedLineIdx].size += diff; //TODO: relate to borders of Canvas
}

function changeStroke(color) {
    gMeme.lines[gMeme.selectedLineIdx].strokeColor = color
}
function changeFill(color) {
    gMeme.lines[gMeme.selectedLineIdx].color = color
}

function changeFont(font) {
    gMeme.lines[gMeme.selectedLineIdx].font = font;
}

function changeAlignment(alignment) {
    gMeme.lines[gMeme.selectedLineIdx].align = alignment;
    switch (alignment) {
        case 'center':
            gMeme.lines[gMeme.selectedLineIdx].x = gCanvas.width / 2;
            break;
        case 'left':
            gMeme.lines[gMeme.selectedLineIdx].x = 10;
            break;
        case 'right':
            gMeme.lines[gMeme.selectedLineIdx].x = gCanvas.width - 10;
            break;
    }
}

function addLine() {
    const emptyIdx = gMeme.lines.findIndex(line => line.txt === '')
    console.log(emptyIdx)
    if (emptyIdx !== -1) {
        gMeme.selectedLineIdx = emptyIdx;
        console.log('return')
        return;
    }
    gMeme.selectedLineIdx = gMeme.lines.length;
    gMeme.lines.push({ txt: '', size: 40, align: 'left', strokeColor: 'black', color: 'White', font: 'impact', x: 10, y: 0 })
    gMeme.lines[gMeme.selectedLineIdx].y = (gMeme.selectedLineIdx === 1) ? gCanvas.height - 50 : gCanvas.height / 2;
}

function delLine() {
    if (gMeme.selectedLineIdx !== (gMeme.lines.length - 1 || gMeme.lines.length === 1)) _cleanLine()
    else {
        gMeme.lines.pop()
        gMeme.selectedLineIdx--;
    }
}
function switchSelectedLine() {
    if (gMeme.selectedLineIdx === (gMeme.lines.length - 1))
        gMeme.selectedLineIdx = 0;
    else gMeme.selectedLineIdx++;
}

function setImgChosen(imgId) {
    _createMeme(imgId)
}

function setMoveActive(isActive, offsetX = 0, offsetY = 0) {
    gMeme.isMoveActive = isActive;
    if (!isActive) return // Mouse is up
    const lineIdx = checkClickPosition (offsetX, offsetY)
    if (lineIdx === -1) {
        gMeme.isMoveActive = false;
        return;
    }
    console.log(offsetX, offsetY, gMeme.lines[lineIdx].x, gMeme.lines[lineIdx].x)
    gMeme.selectedLineIdx = lineIdx;
    gMeme.relX = offsetX;
    gMeme.relY = offsetY;
}

function getIsMoveActive() {
    return gMeme.isMoveActive
}

function checkClickPosition (offsetX, offsetY) {
    const width = gCtx.measureText(gMeme.lines[gMeme.selectedLineIdx].txt).width? gCtx.measureText(gMeme.lines[gMeme.selectedLineIdx].txt).width: gCanvas.width -15;  
    return gMeme.lines.findIndex(line => (offsetX >= line.x-5 && offsetX <= line.x + width +5 && offsetY >= line.y - line.size - 5) && (offsetY <= line.y + 5))
}

function setLineLocation(offsetX, offsetY) {
    const diffX = offsetX - gMeme.relX;
    const diffY = offsetY - gMeme.relY;
    gMeme.lines[gMeme.selectedLineIdx].x += diffX;
    gMeme.lines[gMeme.selectedLineIdx].y += diffY;
    gMeme.relX = offsetX;
    gMeme.relY = offsetY;
}

function saveMeme(img) {
    console.log(gIdx)
    gMemes.push({id:gIdx++, img:img});
    saveToStorage(STORAGE_KEY, gMemes)
    _createMeme(gMeme.selectedImgId);
}

function deleteMeme(id) {
    const delIdx = gMemes.findIndex( meme => meme.id === id);
    gMemes.splice(delIdx,1)
    saveToStorage(STORAGE_KEY, gMemes)
}

function getMemes() {
    return gMemes;
}

function _createMeme(imgId) {
    gMeme = {
        selectedImgId: imgId,
        selectedLineIdx: 0,
        isMoveActive: false,
        relX: 0,
        relY: 0,
        lines: [
            {
                txt: '',
                size: 40,
                align: 'left',
                strokeColor: 'black',
                color: 'white',
                font: 'impact',
                x: 10,
                y: 50
            }
        ]
    }
}

function _cleanLine() {
    gMeme.lines[gMeme.selectedLineIdx] = {
        txt: '',
        size: 40,
        align: 'left',
        strokeColor: 'black',
        color: 'White',
        font: 'impact',
        x: 10,
        y: gMeme.lines[gMeme.selectedLineIdx].y
    };
}