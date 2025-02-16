const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();;
const port = 3000;

app.use(express.json());

app.post('/submit-text', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    console.log("received text: ", text);

    createSvgFile(text, (err, fileName) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to create SVG file' });
        }

        // 返回成功响应，并返回文件名
        res.json({ message: 'SVG file created successfully', fileName });
    });

})

const svgDirectory = path.join(__dirname, 'svg');
if (!fs.existsSync(svgDirectory)) {
    fs.mkdirSync(svgDirectory);
}

// 定义创建 SVG 文件的函数
function createSvgFile(text, callback) {
    // 生成随机数文件名
    const randomFileName = `${Math.floor(Math.random() * 1000000)}.svg`;
    const filePath = path.join(svgDirectory, randomFileName);

    const tspanElements = generateTspanElements(text);
    const backgroundElements = generateBackgroundElements();
    const symbolElements = generateSymbolElements(text);

    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            ${backgroundElements}

        <text x="10" y="20" font-family="Arial" font-size="8" fill="#ECF0F1" letter-spacing="-0.5">
            ${symbolElements}
            ${tspanElements}
        </text>
    </svg>`;

    // 将内容写入到 .svg 文件
    fs.writeFile(filePath, svgContent, (err) => {
        if (err) {
            return callback(err);
        }
        callback(null, randomFileName);
    });
}

function generateBackgroundElements() {
    return `<rect width="100%" height="50" fill="#2C3E50" rx="5"/>`;
}

function generateSymbolElements(text) {
    const totalCharacters = text.length;
    const freezeTime = `${totalCharacters * 0.2}s`;
    return `<tspan id="char0" visibility="hidden" font-size="8" fill="#ECF0F1" x="10">>&#160;&#160;</tspan>
            <animate href="#char0" attributeName="visibility" from="hidden" to="visible" begin="0s" dur="0.2s" fill="freeze" />
                    <animate href="#char0" attributeName="opacity" from="0" to="1" dur="0.4s" begin="0s" repeatCount="indefinite" />
                    <animate href="#char0" attributeName="opacity" from="1" to="1" begin="${freezeTime}" dur="0s" fill="freeze" />`
}


function generateTspanElements(text) {
    return text.split('').map((char, index) => {
        return `<tspan id="char${index + 1}" visibility="hidden">${char === ' ' ? '&#160;' : char}</tspan>
        <animate href="#char${index + 1}" attributeName="visibility" from="hidden" to="visible" begin="${index * 0.2}s" dur="0.2s" fill="freeze"/>`;
    }).join('\n');
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});