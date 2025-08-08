import fs from "fs";
import path from "path";
import promptSync from "prompt-sync";
import sharp from "sharp";

const prompt = promptSync();

async function logMetadata(label: string, filePath: string) {
    try {
        const meta = await sharp(filePath).metadata();
        console.log(`\n📄 Metadata (${label}): ${filePath}`);
        console.dir(meta, { depth: null });
    } catch (err) {
        console.error(`❌ Failed to read metadata:`, err);
    }
}

async function stripMetadata(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    const buffer = await fs.promises.readFile(filePath);
    let pipeline = sharp(buffer);

    switch (ext) {
        case ".jpg":
        case ".jpeg":
            pipeline = pipeline.jpeg({ quality: 90 });
            break;
        case ".png":
            pipeline = pipeline.png();
            break;
        case ".tiff":
            pipeline = pipeline.tiff();
            break;
        case ".webp":
            pipeline = pipeline.webp();
            break;
        case ".gif":
            pipeline = pipeline.gif();
            break;
        case ".avif":
            pipeline = pipeline.avif();
            break;
        default:
            console.error("⚠️ Unsupported file format.");
            return;
    }

    await logMetadata("BEFORE", filePath);
    await pipeline.toFile(filePath); // overwrite original
    await logMetadata("AFTER", filePath);

    console.log(`✅ Metadata stripped: ${filePath}`);
}

async function main() {
    const filePath = prompt("Enter image file path: ").trim();

    if (!filePath) {
        console.error("❌ No file path provided.");
        return;
    }

    if (!fs.existsSync(filePath)) {
        console.error("❌ File does not exist.");
        return;
    }

    await stripMetadata(filePath);
}

main();
