import {Container} from "pixi.js";

export class AlignedContainer extends Container{
    private _isRightAligned : boolean = false;

    public get  isRightAligned(){
        return this._isRightAligned;
    }

    public set isRightAligned(isRightAligned: boolean){
        this._isRightAligned = isRightAligned;
    }
}