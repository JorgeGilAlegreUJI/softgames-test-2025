import { Texture } from 'pixi.js';

export async function loadJSON<T>(url: string): Promise<T> {
    const res = await fetch(url);
    return await res.json();
}

// Pixi .from(url) has problem with non-typed urls. This is a workaround
export async function loadTexture(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Important for cross-origin images
        img.onload = () => resolve(Texture.from(img));
        img.onerror = (err) => reject(err);
        img.src = url;
    });
}
