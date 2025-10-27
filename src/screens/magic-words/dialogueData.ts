export interface DialogueEntry {
    name: string;
    text: string;
}

export interface Emoji {
    name: string;
    url: string;
}

export interface Avatar {
    name: string;
    url: string;
    position: "left" | "right" ;
}

export interface DialogueData {
    dialogue: DialogueEntry[];
    emojies: Emoji[];
    avatars: Avatar[];
}