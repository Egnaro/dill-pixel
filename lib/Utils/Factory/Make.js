import { Assets, BitmapText, Container, Graphics, Mesh, SimpleMesh, SimplePlane, SimpleRope, Sprite, Text, TilingSprite } from "pixi.js";
import { BodyType, PhysicsSprite } from "../../GameObjects/PhysicsSprite";
/**
 * Gets a `PIXI.Texture` asset.
 * @param pAsset The name of the texture to get.
 * @param pSheet (optional) The spritesheet(s) that the texture is in. You can leave this out unless you have two textures with the same name in different spritesheets
 */
export class MakeFactory {
    texture(pAsset, pSheet) {
        // tslint:disable-next-line:no-shadowed-variable
        let texture;
        if (!pSheet || (pSheet === null || pSheet === void 0 ? void 0 : pSheet.length) === 0) {
            if (Assets.cache.has(pAsset)) {
                texture = Assets.get(pAsset);
            }
            else if (Assets.get(pAsset)) {
                texture = Assets.get(pAsset).texture;
            }
            else {
                throw new Error("Asset \"" + pAsset + "\" not loaded into Pixi cache");
            }
        }
        else if (pSheet instanceof Array) {
            const numSheets = pSheet.length;
            for (let i = 0; i < numSheets; i++) {
                const sheet = pSheet[i];
                if (!Assets.get(pAsset)) {
                    throw new Error("Spritesheet \"" + sheet + "\" not loaded into Pixi cache");
                }
                else {
                    const textures = Assets.get(pAsset).textures;
                    if (textures !== undefined) {
                        texture = textures[pAsset];
                        if (texture !== undefined) {
                            break;
                        }
                    }
                    else {
                        throw new Error("Spritesheet \"" + sheet + "\" loaded but textures arent!");
                    }
                }
            }
            if (texture === undefined) {
                throw new Error("Asset \"" + pAsset + "\" not found inside spritesheets \"" + pSheet.toString() + "\'");
            }
        }
        else {
            if (!Assets.get(pSheet)) {
                throw new Error("Spritesheet \"" + pSheet + "\" not loaded into Pixi cache");
            }
            else {
                const textures = Assets.get(pSheet).textures;
                if (textures !== undefined) {
                    if (!textures.hasOwnProperty(pAsset)) {
                        throw new Error("Asset \"" + pAsset + "\" not found inside spritesheet \"" + pSheet + "\'");
                    }
                    texture = textures[pAsset];
                }
                else {
                    throw new Error("Spritesheet \"" + pSheet + "\" loaded but textures arent?!");
                }
            }
        }
        return texture || new Sprite().texture;
    }
    sprite(pTexture, pSheet) {
        let sprite;
        sprite = new Sprite(typeof pTexture === 'string' ? this.texture(pTexture, pSheet) : pTexture);
        return sprite;
    }
    text(pText = ``, pStyle) {
        let text;
        text = new Text(pText, pStyle);
        return text;
    }
    bitmapText(pText = ``, pStyle) {
        let bitmapText;
        bitmapText = new BitmapText(pText, pStyle);
        return bitmapText;
    }
    container() {
        let container;
        container = new Container();
        return container;
    }
    graphics() {
        let graphics;
        graphics = new Graphics();
        return graphics;
    }
    tiledSprite(pTexture, pSheet, pWidth, pHeight, pTilePosition) {
        let tilingSprite;
        tilingSprite = new TilingSprite(this.texture(pTexture, pSheet), pWidth, pHeight);
        if (pTilePosition) {
            tilingSprite.tilePosition = pTilePosition;
        }
        return tilingSprite;
    }
    mesh(pGeometry, pShader, pState, pDrawMode) {
        let mesh;
        mesh = new Mesh(pGeometry, pShader, pState, pDrawMode);
        return mesh;
    }
    simpleRope(pTexture, pSheet, pPoints, pAutoUpdate) {
        let simpleRope;
        simpleRope = new SimpleRope(this.texture(pTexture, pSheet), pPoints);
        simpleRope.autoUpdate = pAutoUpdate !== false;
        return simpleRope;
    }
    simplePlane(pTexture, pSheet, pVertsWidth, pVertsHeight) {
        let simplePlane;
        simplePlane = new SimplePlane(this.texture(pTexture, pSheet), pVertsWidth, pVertsHeight);
        return simplePlane;
    }
    simpleMesh(pTexture, pSheet, pVertices, pUvs, pIndices, pDrawMode) {
        let simpleMesh;
        simpleMesh = new SimpleMesh(this.texture(pTexture, pSheet), pVertices, pUvs, pIndices, pDrawMode);
        return simpleMesh;
    }
    physicsSprite(pTexture, pSheet, pSize, pBodyType = BodyType.RECTANGLE) {
        let physicsSprite;
        physicsSprite = new PhysicsSprite(pTexture, pSheet, pSize, pBodyType);
        return physicsSprite;
    }
}
//# sourceMappingURL=Make.js.map