import {Sound, sound} from "@pixi/sound";
import {songSoundAsset} from "core-utils/assets/assetLibrary.ts";

let songSound : Sound;

export function toggleMusic(){
    if(songSound){
        if(songSound.isPlaying){
            songSound.pause();
        }
        else{
            songSound.play();
        }
    }
    else{
        songSound = sound.find(songSoundAsset);
        songSound.play({loop : true});
    }
}

export function playOneShotSound(assetName: string){
    sound.play(assetName);
}