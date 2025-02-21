const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();;
const port = 3000;

app.use(express.json());

const svgDirectory = path.join(__dirname, 'svg');
if (!fs.existsSync(svgDirectory)) {
    fs.mkdirSync(svgDirectory);
}

function generateSymbolElements(text, DelayTime, DelayId, typingSpeed) {
    const totalCharacters = text.length;
    const freezeTime = `${totalCharacters * typingSpeed + DelayTime}s`;
    return `<tspan id="char${DelayId}" visibility="hidden" font-size="8" fill="#ECF0F1" x="10">>&#160;&#160;</tspan>
            <animate href="#char${DelayId}" attributeName="visibility" from="hidden" to="visible" begin="${DelayTime}s" dur="${typingSpeed}s" fill="freeze" />
            <animate href="#char${DelayId}" attributeName="opacity" from="0" to="1" dur="${typingSpeed}s" begin="${DelayTime}s" repeatCount="indefinite" />
            <animate href="#char${DelayId}" attributeName="opacity" from="1" to="1" begin="${freezeTime}" dur="0s" fill="freeze" />`
}

function generateTspanElements(text, DelayTime, DelayId, typingSpeed) {
    return text.split('').map((char, index) => {
        return `<tspan id="char${DelayId+ index + 1}" visibility="hidden">${char === ' ' ? '&#160;' : char}</tspan>
        <animate href="#char${DelayId+ index + 1}" attributeName="visibility" from="hidden" to="visible" begin="${index * typingSpeed + DelayTime}s" dur="${typingSpeed}s" fill="freeze"/>`;
    }).join('\n');
}

function generateBackgroundElements(background_height) {
    console.log("背景高度", background_height);
    return `<rect width="100%" height="${background_height}px" fill="#2C3E50" rx="5"/>`;
}

function generateTextElements(text, typingSpeed){
    let textElements = '';
    let DelayTime = 0;
    let DelayId = 0;
    text.forEach((text, index) => {
        const generateSymbolElements_content = generateSymbolElements(text, DelayTime, DelayId, typingSpeed);
        const generateTspanElements_content = generateTspanElements(text, DelayTime, DelayId, typingSpeed);
        console.log(`Index: ${index}, Content: ${text}, length: ${text.length}, DelayTime: ${DelayTime}`);
        DelayTime = DelayTime + text.length * typingSpeed;
        DelayId = DelayId + text.length +1;
        textElements += `
        <text x="10" y="${index*10 + 20}" font-family="Arial" font-size="8" fill="#ECF0F1" letter-spacing="-0.5">
            ${generateSymbolElements_content}
            ${generateTspanElements_content}
        </text>`
    });
    return textElements;
}

function generateSvgCode(text, typingSpeed){
    const background_height = text.length*10 + 20;
    const randomFileName = `${Math.floor(Math.random() * 1000000)}.svg`;
    const filePath = path.join(svgDirectory, randomFileName);
    const backgroundElements = generateBackgroundElements(background_height);
    const textElements = generateTextElements(text, typingSpeed);
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            ${backgroundElements}
            ${textElements}
    </svg>`;

    console.log("内容：" + svgContent);
}

app.post('/submit-text', (req, res) => {
    const text = ["Hello World", "Hi im zhengfu200"];
    const typingSpeed = 0.1;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    console.log("received text: ", text);

    generateSvgCode(text, typingSpeed);

    return res.json({ message: '生成结束' });

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});