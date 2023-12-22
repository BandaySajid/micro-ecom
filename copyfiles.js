import fs from 'fs';
import path from 'path';

const sourceDir = 'src';
const distDir = 'dist';

const extensionsToCopy = ['.sql', '.json'];

function copyFilesRecursive(src, dest) {
    fs.readdirSync(src).forEach(file => {
        const filePath = path.join(src, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            copyFilesRecursive(filePath, path.join(dest, file));
        } else if (extensionsToCopy.includes(path.extname(file))) {
            fs.mkdirSync(dest, { recursive: true });
            fs.copyFileSync(filePath, path.join(dest, file));
        }
    });
}

copyFilesRecursive(sourceDir, distDir);
