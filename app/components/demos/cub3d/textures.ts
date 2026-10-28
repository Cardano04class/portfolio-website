import tech1c from "@/src/projects/cub3d/textures/TECH_1C.png";
import tech3b from "@/src/projects/cub3d/textures/TECH_3B.png";
import type { CubMap, Texture } from "./raycast";

/** The repo's own wall textures (textures/*.xpm), converted to PNG pixel for pixel. */
const FILES: Record<string, string> = { TECH_1C: tech1c.src, TECH_3B: tech3b.src };

async function decode(url: string): Promise<Texture> {
    const img = new Image();
    img.src = url;
    await img.decode();
    const size = img.naturalWidth;
    const ctx = new OffscreenCanvas(size, size).getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    ctx.drawImage(img, 0, 0);
    return { size, px: new Uint32Array(ctx.getImageData(0, 0, size, size).data.buffer) };
}

const cache = new Map<string, Promise<Texture>>();

/** Loads the four face textures a map names (NO, SO, EA, WE), in render order. */
export function loadFaceTextures(map: CubMap): Promise<Texture[]> {
    return Promise.all(
        map.faces.map((name) => {
            const url = FILES[name];
            if (!url) return Promise.reject(new Error("Error texture file path not found"));
            const hit = cache.get(name) ?? decode(url);
            cache.set(name, hit);
            return hit;
        }),
    );
}
