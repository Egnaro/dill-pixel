import { orientationLandscape, orientationPortrait } from '../signals';
import * as PixiUtils from './PixiUtils';
export class OrientationManager {
    constructor(app) {
        this.app = app;
        this._isPortrait = undefined;
        this._enabled = false;
        this._showOnLandscape = false;
    }
    /**
     * Call this function to initialize the manager and enable it
     * @param pSprite String to create the sprite with
     * @param pShowOnLandscape If the image should be shown on lanscape
     * @NOTE Normally, this should be called in Application.onLoadRequiredAssetsComplete
     */
    init(pSprite, pShowOnLandscape = false) {
        this._enabled = true;
        this._promptImage = document.createElement('img');
        // @ts-ignore
        this._promptImage.src = PixiUtils.getTexture(pSprite).baseTexture.imageUrl;
        this._showOnLandscape = pShowOnLandscape;
        this.enablePromptImage(false);
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('orientationchange', () => this.onResize());
        this.onResize();
    }
    /**
     * Called when the screen resizes
     */
    onResize() {
        if (!this._enabled) {
            return;
        }
        switch (window.orientation) {
            case -90:
            case 90:
                // Landscape
                this.enablePromptImage(this._showOnLandscape);
                if (this._isPortrait || this._isPortrait === undefined) {
                    this._isPortrait = false;
                    orientationLandscape();
                }
                break;
            default:
                // Portrait
                this.enablePromptImage(!this._showOnLandscape);
                if (!this._isPortrait) {
                    this._isPortrait = true;
                    orientationPortrait();
                }
                break;
        }
    }
    /**
     * Call this to enable or disable the prompt image
     * @param pEnable Enable the image or not
     */
    enablePromptImage(pEnable) {
        if (this._promptImage) {
            if (pEnable) {
                document.body.append(this._promptImage);
                this._promptImage.id = 'orientation-prompt-image';
                this._promptImage.style.position = 'fixed';
                this._promptImage.style.width = '100vw';
                this._promptImage.style.height = '100vh';
                this._promptImage.style.top = '0';
                this._promptImage.style.left = '0';
                this._promptImage.style.objectFit = 'cover';
                this._promptImage.style.objectPosition = 'center';
                this._promptImage.style.cursor = 'auto';
                this._promptImage.style.pointerEvents = 'auto';
            }
            else {
                try {
                    this._promptImage.remove();
                }
                catch (e) {
                    // ignore errors
                }
            }
        }
    }
}
//# sourceMappingURL=OrientationManager.js.map