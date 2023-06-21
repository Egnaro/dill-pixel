import * as PIXI from "pixi.js";
import * as AudioCategory from "../Audio/AudioCategory";
import { AudioToken } from "../Audio/AudioToken";
import * as Topics from "../Data/Topics";
import * as InputUtils from "../Input/InputUtils";
import * as PixiUtils from "../Utils/PixiUtils";
import * as RectUtils from "../Utils/RectUtils";
/**
 * Receptacle
 */
export class Receptacle extends PIXI.Container {
    constructor() {
        super();
        this._isPointerOver = false;
        this._isActive = true;
        this._visuals = new PIXI.Container();
        this.addChild(this._visuals);
        this.cursor = "pointer";
        this.interactive = false;
        this.on(InputUtils.Events.POINTER_OVER, this.onPointerOver);
        this.on(InputUtils.Events.POINTER_DOWN, this.onPointerDown);
        this.on(InputUtils.Events.POINTER_UP, this.onPointerUp);
        this.on(InputUtils.Events.POINTER_UP_OUTSIDE, this.onPointerUpOutside);
        this.on(InputUtils.Events.POINTER_OUT, this.onPointerOut);
        this.on(InputUtils.Events.POINTER_MOVE, this.onPointerMove);
        this.on(InputUtils.Events.TOUCH_MOVE, this.onTouchMove);
        this._subscriptions = new Array();
        this._subscriptions.push(PubSub.subscribe(Topics.DRAG_BEGIN, this.onDragBegin.bind(this)));
        this._subscriptions.push(PubSub.subscribe(Topics.DRAG_END, this.onDragEnd.bind(this)));
        this._subscriptions.push(PubSub.subscribe(Topics.DRAGGABLE_SELECTED, this.onDraggableSelected.bind(this)));
        this._subscriptions.push(PubSub.subscribe(Topics.DRAGGABLE_DESELECTED, this.onDraggableDeselected.bind(this)));
    }
    /**
     * Sets whether is active
     */
    set isActive(pValue) {
        this._isActive = pValue;
    }
    /**
     * Gets whether is active
     */
    get isActive() {
        return this._isActive;
    }
    /**
     * onFocusBegin
     */
    onFocusBegin() {
        this.playHoverVo();
    }
    /**
     * onFocusEnd
     */
    onFocusEnd() {
        // unused
    }
    /**
     * onFocusActivated
     */
    onFocusActivated() {
        this.addDraggable(this._selected);
    }
    /**
     * onFocusPosition
     */
    getFocusPosition() {
        if (this.hitArea instanceof PIXI.Rectangle) {
            return new PIXI.Point().copyFrom(this.toGlobal(RectUtils.center(this.hitArea)));
        }
        else {
            return this.getGlobalPosition();
        }
    }
    /**
     * Gets focus size
     * @returns PIXI.Point
     */
    getFocusSize() {
        let bounds;
        if (this.hitArea instanceof PIXI.Rectangle) {
            bounds = PixiUtils.getGlobalBounds(this, this.hitArea.clone());
        }
        else {
            bounds = PixiUtils.getGlobalBounds(this);
        }
        return RectUtils.size(bounds);
    }
    /**
     * Destroys receptacle
     */
    destroy() {
        for (let i = 0; i < this._subscriptions.length; ++i) {
            PubSub.unsubscribe(this._subscriptions[i]);
        }
        super.destroy();
    }
    /**
     * Plays hover vo
     */
    playHoverVo() {
        if (this._hoverVo !== undefined) {
            PubSub.publishSync(Topics.PLAY_AUDIO, new AudioToken(this._hoverVo, 1, false, AudioCategory.VO.toString()));
        }
    }
    /**
     * onPointerOver
     */
    onPointerOver() {
        this._isPointerOver = true;
        if (this._selected !== undefined) {
            this.playHoverVo();
        }
    }
    /**
     * onPointerDown
     */
    onPointerDown(pEvent) {
        this._eventData = pEvent;
    }
    /**
     * onPointerUp
     */
    onPointerUp() {
        if (this._selected !== undefined) {
            this._eventData = undefined;
            this.addDraggable(this._selected);
        }
    }
    /**
     * onPointerUpOutside
     */
    onPointerUpOutside() {
        this._eventData = undefined;
    }
    /**
     * onPointerOut
     */
    onPointerOut() {
        this._isPointerOver = false;
    }
    /**
     * onPointerMove
     */
    onPointerMove(pEvent) {
        // override
    }
    onTouchMove(pEvent) {
        const local = pEvent.getLocalPosition(this);
        if (this.hitArea) {
            if (!this._isPointerOver) {
                if (this.hitArea.contains(local.x, local.y)) {
                    this.onPointerOver();
                }
            }
            else {
                if (this.hitArea.contains(local.x, local.y) === false) {
                    this.onPointerOut();
                }
            }
        }
    }
    /**
     * Adds draggable
     * @param pDraggable
     */
    addDraggable(pDraggable) {
        // override
    }
    /**
     * onDragBegin
     * @param pTopic
     * @param pDraggable
     */
    onDragBegin(pTopic, pDraggable) {
        if (this._isActive) {
            this.interactive = true;
            this._dragged = pDraggable;
        }
    }
    /**
     * onDragEnd
     * @param pTopic
     * @param pDraggable
     */
    onDragEnd(pTopic, pDraggable) {
        if (this._isActive) {
            if (this._isPointerOver && this._dragged !== undefined) {
                this.addDraggable(this._dragged);
            }
            this.interactive = false;
            this._dragged = undefined;
        }
    }
    /**
     * onDraggableSelected
     * @param pTopic
     * @param pDraggable
     */
    onDraggableSelected(pTopic, pDraggable) {
        if (this._isActive) {
            this.interactive = true;
            this._selected = pDraggable;
        }
    }
    /**
     * onDraggableDeselected
     * @param pTopic
     * @param pDraggable
     */
    onDraggableDeselected(pTopic, pDraggable) {
        if (this._isActive) {
            if (this._selected === pDraggable) {
                this.interactive = false;
                this._selected = undefined;
            }
        }
    }
}
//# sourceMappingURL=Receptacle.js.map