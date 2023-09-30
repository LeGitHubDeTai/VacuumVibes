/*-----------------------------------------------------------------------------------------------------------\
|  _____     _   _____ _             _ _          _____  _____  _____  __      _______  _____  _____  _____  |
| |_   _|   (_) /  ___| |           | (_)        / __  \|  _  |/ __  \/  |    / / __  \|  _  |/ __  \|____ | |
|   | | __ _ _  \ `--.| |_ _   _  __| |_  ___    `' / /'| |/' |`' / /'`| |   / /`' / /'| |/' |`' / /'    / / |
|   | |/ _` | |  `--. \ __| | | |/ _` | |/ _ \     / /  |  /| |  / /   | |  / /   / /  |  /| |  / /      \ \ |
|   | | (_| | | /\__/ / |_| |_| | (_| | | (_) |  ./ /___\ |_/ /./ /____| |_/ /  ./ /___\ |_/ /./ /___.___/ / |
|   \_/\__,_|_| \____/ \__|\__,_|\__,_|_|\___/   \_____/ \___/ \_____/\___/_/   \_____/ \___/ \_____/\____/  |
\-----------------------------------------------------------------------------------------------------------*/
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config(); // Charger les variables d'environnement depuis .env

async function checkIfExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        } else {
            console.error(`Une erreur s'est produite : ${error.message}`);
        }
    }
}

// Récupérer l'URL du site à partir de la variable d'environnement
const siteUrl = process.env.SITE_URL;
if (!siteUrl) {
    console.error("SITE_URL n'est pas défini dans le fichier .env.");
    process.exit(1); // Terminez le processus avec une erreur
}
const baseUrl = new URL(siteUrl);

const outputDirectory = process.env.OUT || 'out'; // Dossier de sortie

// Fonction pour supprimer le dossier "out" s'il existe
async function deleteOutputDirectory() {
    try {
        const exists = await fs.access(outputDirectory).then(() => true).catch(() => false);
        if (exists) {
            await deleteFolderRecursive(outputDirectory);
            console.log(`\x1b[34mDossier "${outputDirectory}" supprimé.\x1b[0m`);
        }
    } catch (error) {
        console.error(`Erreur lors de la suppression du dossier "${outputDirectory}": ${error.message}`);
    }
}

// Fonction pour supprimer un dossier récursivement
async function deleteFolderRecursive(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                await deleteFolderRecursive(filePath);
            } else {
                await fs.unlink(filePath);
            }
        }
        await fs.rmdir(folderPath);
    } catch (error) {
        console.error(`Erreur lors de la suppression du dossier ${folderPath}: ${error.message}`);
    }
}

// Fonction pour scanner les liens dans un fichier
async function scanLink(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        // Une expression régulière plus générique pour capturer tous les liens
        const linksInFile = Array.from(content.matchAll(/(http[s]?:\/\/[^\s"'<>]+)/g)).map((match) => match[1]);
        return linksInFile;
    } catch (error) {
        console.error(`Erreur lors de la numérisation des liens dans ${filePath}: ${error.message}`);
        return [];
    }
}

// Fonction pour scanner un répertoire et retourner la liste des fichiers
async function scanDir(directory) {
    try {
        let files = [];
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                // Si c'est un répertoire, récursivement scannez-le
                const subDirFiles = await scanDir(entryPath);
                files = files.concat(subDirFiles);
            } else {
                // Si c'est un fichier, ajoutez-le à la liste
                files.push(entryPath);
            }
        }

        return files;
    } catch (error) {
        console.error(`Erreur lors de la numérisation du répertoire ${directory}: ${error.message}`);
        return [];
    }
}

// Fonction pour échapper les caractères spéciaux dans une expression régulière
function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

// Fonction pour télécharger une ressource
async function downloadResource(resourceUrl, localPath, step) {
    try {
        if (resourceUrl.endsWith(')') == true) {
            resourceUrl = resourceUrl.slice(0, -1);
        }
        if (localPath.endsWith(')') == true) {
            localPath = localPath.slice(0, -1);
        }

        // Nettoyez et ajustez le chemin local avant d'écrire sur le disque
        const cleanedLocalPath = path.join(
            path.dirname(localPath),
            cleanFileName(path.basename(localPath), resourceUrl)
        );

        if (`./${cleanedLocalPath}` === `${outputDirectory}.html`) {
            return;
        }

        if (await checkIfExists(`${outputDirectory}.html`) == false) {
            const response = await axios.get(resourceUrl, { responseType: 'arraybuffer' });

            await fs.writeFile(cleanedLocalPath, response.data);
        }

        console.log(`\x1b[34mÉtape ${step}:\x1b[0m Téléchargé : ${cleanedLocalPath}`);
    } catch (error) {
        console.error(`Erreur lors du téléchargement de ${resourceUrl} : ${error.message}`);
    }
}

// Fonction pour nettoyer le nom du fichier en supprimant les paramètres de version et en ajoutant .html si nécessaire
function cleanFileName(fileName, resourceUrl) {
    fileName = fileName.replace(/[?#].*$/, ''); // Supprime tout après le '?' ou '#'
    if (!path.extname(fileName)) {
        // Si le nom du fichier n'a pas d'extension, ajoutez .html
        const ext = path.extname(new URL(resourceUrl).pathname);
        fileName += ext || '.html';
    }
    return fileName;
}

// Fonction pour remplacer un lien dans un fichier
async function replaceAllLinks(filePath, linkToReplace, step) {
    try {
        const fileExtension = path.extname(filePath).toLowerCase();

        const IMAGE_VIDEO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.svg'];

        // Vérifiez si le fichier est une image ou une vidéo
        if (IMAGE_VIDEO_EXTENSIONS.includes(fileExtension)) {
            console.log(`Le fichier ${filePath} est une image ou une vidéo. Le remplacement de liens est ignoré.`);
            return; // Ne faites rien si c'est une image ou une vidéo
        }

        let content = await fs.readFile(filePath, 'utf-8');

        // Utilisez une expression régulière pour remplacer tous les liens correspondants
        const escapedLinkToReplace = escapeRegExp(linkToReplace);
        const regex = new RegExp(`${escapedLinkToReplace}(\\?\\S*)?`, 'g'); // Correspond également aux paramètres de requête

        content = content.replace(regex, linkToReplace);

        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`\x1b[34mÉtape ${step}:\x1b[0m Liens dans ${filePath} remplacés.`);
    } catch (error) {
        console.error(`Erreur lors du remplacement des liens dans ${filePath}: ${error.message}`);
    }
}

async function processFiles(outputDir, links) {
    const filteredLinks = links.filter((link) => link.includes(baseUrl.hostname));
    const filesToScan = await scanDir(outputDir);

    for (const entry of filesToScan) {
        const entryPath = path.join(entry);

        try {
            const stats = await fs.stat(entryPath);

            if (stats.isFile()) {
                // Si c'est un fichier, effectuez le traitement
                const filePath = entryPath;
                const linksInFile = await scanLink(filePath);

                for (const linkInFile of linksInFile) {
                    const linkUrl = new URL(linkInFile);
                    // Vérifiez si le lien commence par siteUrl avant de l'ajouter
                    if (linkUrl.href.startsWith(siteUrl) && !filteredLinks.includes(linkUrl.href)) {
                        filteredLinks.push(linkUrl.href);
                        const newRelativePath = path.join(outputDir, linkUrl.pathname);
                        await fs.mkdir(path.dirname(newRelativePath), { recursive: true });
                        await downloadResource(linkUrl.href, newRelativePath, 9);
                    }
                }
            } else if (stats.isDirectory()) {
                // Si c'est un répertoire, récursivement scannez-le (s'il y a d'autres fichiers/dossiers à l'intérieur)
                const subDirFiles = await scanDir(entryPath);
                filesToScan.push(...subDirFiles);
            }
        } catch (error) {
            console.error(`Erreur lors du traitement de ${entryPath}: ${error.message}`);
        }
    }

    for (const filePath of filesToScan) {
        await replaceAllLinks(filePath, '/', 7);
    }

    return filteredLinks;
}

async function init() {
    try {
        // Étape 0
        await deleteOutputDirectory();
        await fs.mkdir(outputDirectory, { recursive: true });
        console.log(`\x1b[34mÉtape 0:\x1b[0m Dossier "${outputDirectory}" créé.`);

        const relativePath = path.join(outputDirectory, 'index.html');
        await downloadResource(siteUrl, relativePath, 1);

        let allLinks = [];
        let newLinks = await processFiles(outputDirectory, allLinks);

        while (newLinks.length > 0) {
            if (newLinks.length == 1) {
                if (newLinks[0] == siteUrl) {
                    console.log('\x1b[34mAucun nouveau lien trouvé, le téléchargement est terminé.\x1b[0m');
                    return;
                }
                if (newLinks[0] == `${siteUrl}/`) {
                    console.log('\x1b[34mAucun nouveau lien trouvé, le téléchargement est terminé.\x1b[0m');
                    return;
                }
            }
            console.log('\x1b[34mNouveaux liens trouvés (', newLinks.length, '\x1b[34m), recommençons...\x1b[0m');
            newLinks = await processFiles(outputDirectory, allLinks);
        }

        console.log('\x1b[34mAucun nouveau lien trouvé, le téléchargement est terminé.\x1b[0m');
    } catch (error) {
        console.error(`Erreur lors du téléchargement du site web : ${error.message}`);
    }
}

if (!siteUrl) {
    console.error("SITE_URL n'est pas défini dans le fichier .env.");
} else {
    init();
}
