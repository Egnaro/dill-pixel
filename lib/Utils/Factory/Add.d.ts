import { Container, Graphics, IBitmapTextStyle, ITextStyle, TextStyle, Texture } from "pixi.js";
import { BodyType, PhysicsSprite } from "../../GameObjects/PhysicsSprite";
export declare class AddFactory {
    private defaultContainer;
    private _make;
    constructor(defaultContainer: Container);
    existing(pObject: any): any;
    coloredSprite(color?: number, alpha?: number, position?: {
        x: number;
        y: number;
    } | [number, number?] | number, anchor?: {
        x: number;
        y: number;
    } | [number, number?] | number, scale?: {
        x: number;
        y: number;
    } | [number, number?] | number): import("pixi.js").Sprite;
    sprite(pAsset: string, pSheet?: string | string[] | undefined, alpha?: number, position?: {
        x: number;
        y: number;
    } | [number, number?] | number, anchor?: {
        x: number;
        y: number;
    } | [number, number?] | number, scale?: {
        x: number;
        y: number;
    } | [number, number?] | number): import("pixi.js").Sprite;
    text(pText?: string, pStyle?: Partial<ITextStyle> | TextStyle, alpha?: number, position?: {
        x: number;
        y: number;
    } | [number, number?] | number, anchor?: {
        x: number;
        y: number;
    } | [number, number?] | number, scale?: {
        x: number;
        y: number;
    } | [number, number?] | number): import("pixi.js").Text;
    bitmapText(pText: string, pStyle?: IBitmapTextStyle, alpha?: number, position?: {
        x: number;
        y: number;
    } | [number, number?] | number, anchor?: {
        x: number;
        y: number;
    } | [number, number?] | number, scale?: {
        x: number;
        y: number;
    } | [number, number?] | number): import("pixi.js").BitmapText;
    container(alpha?: number, position?: {
        x: number;
        y: number;
    } | [number, number?] | number, scale?: {
        x: number;
        y: number;
    } | [number, number?] | number): Container<import("pixi.js").DisplayObject>;
    graphics(alpha?: number, position?: {
        x: number;
        y: number;
    } | [number, number?] | number, scale?: {
        x: number;
        y: number;
    } | [number, number?] | number): Graphics;
    physicsSprite(pTexture: string | Texture, pSheet?: string | string[] | undefined, pSize?: {
        x: number;
        y: number;
    } | [number, number?] | number, pType?: BodyType, pAlpha?: number, pPosition?: {
        x: number;
        y: number;
    } | [number, number?] | number): PhysicsSprite;
}
//# sourceMappingURL=Add.d.ts.map