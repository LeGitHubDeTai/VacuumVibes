/*-----------------------------------------------------------------------------------------------------------\
|  _____     _   _____ _             _ _          _____  _____  _____  __      _______  _____  _____  _____  |
| |_   _|   (_) /  ___| |           | (_)        / __  \|  _  |/ __  \/  |    / / __  \|  _  |/ __  \|____ | |
|   | | __ _ _  \ `--.| |_ _   _  __| |_  ___    `' / /'| |/' |`' / /'`| |   / /`' / /'| |/' |`' / /'    / / |
|   | |/ _` | |  `--. \ __| | | |/ _` | |/ _ \     / /  |  /| |  / /   | |  / /   / /  |  /| |  / /      \ \ |
|   | | (_| | | /\__/ / |_| |_| | (_| | | (_) |  ./ /___\ |_/ /./ /____| |_/ /  ./ /___\ |_/ /./ /___.___/ / |
|   \_/\__,_|_| \____/ \__|\__,_|\__,_|_|\___/   \_____/ \___/ \_____/\___/_/   \_____/ \___/ \_____/\____/  |
\-----------------------------------------------------------------------------------------------------------*/
const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

app.use(express.static('out'));

// Fonction récursive pour générer la structure HTML
function generateHTMLDirectoryTree(dir) {
    const stats = fs.statSync(dir);
    if (stats.isDirectory()) {
        const dirContents = fs.readdirSync(dir);
        const contentsHTML = dirContents.map(file => {
            const filePath = path.join(dir, file);
            return `
                <li>
                    <span class="folder">${file}</span>
                    <ul>
                        ${generateHTMLDirectoryTree(filePath)}
                    </ul>
                </li>
            `;
        });
        return contentsHTML.join('');
    } else {
        return `<li><span class="file">${path.basename(dir)}</span></li>`;
    }
}

app.get('/dir', (req, res) => {
    const dirPath = path.join(__dirname, 'out');

    // Obtenez la hiérarchie complète du dossier 'out' sous forme HTML
    const directoryTreeHTML = `
        <html>
        <head>
            <style>
                .folder { font-weight: bold; }
                .file { font-style: italic; }
            </style>
        </head>
        <body>
            <ul>
                ${generateHTMLDirectoryTree(dirPath)}
            </ul>
        </body>
        </html>
    `;

    // Renvoyer la hiérarchie en tant que page HTML
    res.send(directoryTreeHTML);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
