// Very little sound in the game, so a file like this should be enough

import { Sound, sound } from '@pixi/sound';
import { songSoundAsset } from 'core-utils/assets/assetRegistry.ts';

let songSound: Sound;

export function toggleMusic() {
    if (songSound) {
        if (songSound.isPlaying) {
            songSound.pause();
        } else {
            songSound.play({ loop: true });
        }
    } else {
        songSound = sound.find(songSoundAsset);
        songSound.play({ loop: true });
    }
}

export function playOneShotSound(assetName: string) {
    sound.play(assetName);
}
