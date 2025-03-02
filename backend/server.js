const express = require('express');
const fs = require('fs');
const { get } = require('http');
const path = require('path');
const app = express();;
const port = 3000;

app.use(express.json());

const svgDirectory = path.join(__dirname, 'svg');
if (!fs.existsSync(svgDirectory)) {
    fs.mkdirSync(svgDirectory);
}

function getSvgWidth(text){
    const longestText = text.reduce((longest, current) => {
        return current.length > longest.length ? current : longest;
    }, "");

    const background_width = (longestText.length + 2 )* 11 + 20;
    return background_width;
}

function generateSymbolElements(text, DelayTime, DelayId, typingSpeed) {
    const totalCharacters = text.length;
    const freezeTime = `${totalCharacters * typingSpeed + DelayTime}s`;
    return `<tspan id="char${DelayId}" visibility="hidden" fill="#ECF0F1" x="10">>&#160;&#160;</tspan>
            <animate href="#char${DelayId}" attributeName="visibility" from="hidden" to="visible" begin="${DelayTime}s" dur="${typingSpeed}s" fill="freeze" />
            <animate href="#char${DelayId}" attributeName="opacity" from="0" to="1" dur="${typingSpeed}s" begin="${DelayTime}s" repeatCount="indefinite" />
            <animate href="#char${DelayId}" attributeName="opacity" from="1" to="1" begin="${freezeTime}" dur="0s" fill="freeze" />`
}

function generateTspanElements(text, DelayTime, DelayId, typingSpeed) {
    return text.split('').map((char, index) => {
        return `<tspan id="char${DelayId + index + 1}" visibility="hidden">${char === ' ' ? '&#160;' : char}</tspan>
        <animate href="#char${DelayId + index + 1}" attributeName="visibility" from="hidden" to="visible" begin="${index * typingSpeed + DelayTime}s" dur="${typingSpeed}s" fill="freeze"/>`;
    }).join('\n');
}

function generateBackgroundElements(background_height) {
    console.log("背景高度", background_height);
    return `<rect width="100%" height="${background_height}px" fill="#2C3E50" rx="0" ry="5" y="30"/>`;
}

function generateBarTitle(title, totalLength, typingSpeed) {
    return `<rect width="100%" height="30" fill="black" rx="5" ry="0" y="0" />
            <rect height="2" fill="#bdc3c7" rx="5" y="0">
                <animate attributeName="width" from="0" to="100%" dur="${totalLength*typingSpeed}s" fill="freeze" />
            </rect>
            <text text-anchor="middle" x="50%" fill="white" y="20" font-size="">${title}</text>`
}

function generateTextElements(text, typingSpeed) {
    let textElements = '';
    let DelayTime = 0;
    let DelayId = 0;
    text.forEach((text, index) => {
        const generateSymbolElements_content = generateSymbolElements(text, DelayTime, DelayId, typingSpeed);
        const generateTspanElements_content = generateTspanElements(text, DelayTime, DelayId, typingSpeed);
        console.log(`Index: ${index}, Content: ${text}, length: ${text.length}, DelayTime: ${DelayTime}`);
        DelayTime = DelayTime + text.length * typingSpeed;
        DelayId = DelayId + text.length + 1;
        textElements += `
        <text x="10" y="${index * 20 + 50}" font-family="Arial" fill="#ECF0F1" letter-spacing="-0.5">
            ${generateSymbolElements_content}
            ${generateTspanElements_content}
        </text>`
    });
    return textElements;
}

function generateSvgCode(text, typingSpeed, title) {
    const totalLength = text.reduce((sum, currentText) => sum + currentText.length, 0);
    const background_height = text.length * 20 + 20;
    const background_width = getSvgWidth(text);
    const randomFileName = `${Math.floor(Math.random() * 1000000)}.svg`;
    const filePath = path.join(svgDirectory, randomFileName);
    const backgroundElements = generateBackgroundElements(background_height);
    const generateBarTitle_content = generateBarTitle(title, totalLength, typingSpeed);
    const textElements = generateTextElements(text, typingSpeed);
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${background_width}" height="${background_height +30}">
            ${generateBarTitle_content}
            ${backgroundElements}
            ${textElements}
    </svg>`;
    return svgContent;
}

app.post('/submit-text', (req, res) => {
    const text = ["Hello World", "Hi im zhengfu200, pls give me a star thanks!"];
    const typingSpeed = 0.1;
    const title = "My Code";
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    console.log("received text: ", text);

    svgContent = generateSvgCode(text, typingSpeed, title);
    console.log("内容：" + svgContent);


    const filename = Math.floor(100000 + Math.random() * 900000).toString();
    const dirPath = path.join(__dirname, 'svg');

    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        const filePath = path.join(dirPath, `${filename}.svg`);
        fs.writeFileSync(filePath, svgContent);
        
        return res.json({ 
            message: '生成结束',
            filename: `${filename}.svg`
        });
    } catch (err) {
        console.error('文件写入失败:', err);
        return res.status(500).json({ error: '服务器文件存储错误' });
    }

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});