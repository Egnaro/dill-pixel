import { Bounds, Container, PointLike } from 'pixi.js';
import { IApplication } from '../../../core';
import { PIXIContainer } from '../../../pixi';
import { Signal } from '../../../signals';
import { Constructor, getLastMapEntry, getPreviousMapEntry, Logger } from '../../../utils';
import { IModule } from '../../IModule';
import { FocusOutliner, FocusOutlinerConfig, IFocusOutliner } from './FocusOutliner';

export type FocusManagerOptions = {
  outliner: IFocusOutliner | Partial<FocusOutlinerConfig>;
};

export interface IFocusable {
  onFocusBegin: Signal<(focusable: IFocusable) => void>;
  onFocusEnd: Signal<(focusable: IFocusable) => void>;
  onFocus: Signal<(focusable: IFocusable) => void>;
  position: PointLike;

  focusBegin(): void;

  focusEnd(): void;

  focus(): void;

  getBounds(): Bounds;
}

export interface IFocusLayer {
  currentFocusable: IFocusable | null;
  defaultFocusable: IFocusable | null;
  lastFocusable: IFocusable | null;

  hasFocusable(focusable: IFocusable | null): boolean;

  setCurrent(): void;

  addFocusable(focusable: IFocusable): void;

  removeFocusable(focusable: IFocusable): void;

  navigate(direction: number): void;
}

class FocusLayer implements IFocusLayer {
  public currentFocusable: IFocusable | null = null;
  public lastFocusable: IFocusable | null = null;
  public defaultFocusable: IFocusable | null = null;

  private _focusables: IFocusable[] = [];
  private _currentIndex: number = 0;

  constructor() {}

  public setCurrent() {
    if (!this.defaultFocusable) {
      this.defaultFocusable = this._focusables[0];
    }
  }

  public hasFocusable(focusable: IFocusable | null) {
    if (!focusable) {
      return false;
    }
    return this._focusables.indexOf(focusable) > -1;
  }

  public addFocusable(focusable: IFocusable, isDefault: boolean = false): void {
    this._focusables.push(focusable);
    if (isDefault) {
      this.defaultFocusable = focusable;
    }
  }

  public removeFocusable(focusable: IFocusable) {
    const index = this._focusables.indexOf(focusable);
    if (index !== -1) {
      this._focusables.splice(index, 1);

      if (this.currentFocusable === focusable) {
        this.currentFocusable = null;
      }

      if (this.lastFocusable === focusable) {
        this.lastFocusable = null;
      }

      if (this.defaultFocusable === focusable) {
        this.defaultFocusable = null;
      }
    }
  }

  public navigate(direction: number): void {
    this._currentIndex = (this._currentIndex + direction + this._focusables.length) % this._focusables.length;

    this.lastFocusable = this.currentFocusable;
    this.lastFocusable?.focusEnd();
    this.lastFocusable?.onFocusEnd?.emit(this.lastFocusable);

    this.currentFocusable = this._focusables[this._currentIndex];
    this.currentFocusable?.focusBegin();
    this.currentFocusable?.onFocusBegin?.emit(this.currentFocusable);
    this.currentFocusable?.focus();
    this.currentFocusable?.onFocus?.emit(this.currentFocusable);
  }
}

type FocusChangeDetail = { layer: string | number | null; focusable: IFocusable | null };

export interface IFocusManager extends IModule {
  readonly view: Container;
  readonly layerCount: number;
  readonly currentLayerId: string | number | null;
  readonly active: boolean;

  onActivated: Signal<() => void>;
  onDeactivated: Signal<() => void>;
  onFocusLayerChange: Signal<(currentLayerId: string | number) => void>;
  onFocusChange: Signal<(detail: FocusChangeDetail) => void>;

  focus(focusable: IFocusable): void;

  forceFocus(focusable: IFocusable): void;

  addFocusLayer(layerId?: string | number, focusables?: IFocusable | IFocusable[], setAsCurrent?: boolean): IFocusLayer;

  removeFocusLayer(layerId?: string | number): void;

  setFocusLayer(layerId: string | number): void;

  setLayerOrder(layerIds: (string | number)[]): void;

  addFocusable(focusable: IFocusable | IFocusable[], layerId?: string | number): void;

  removeFocusable(focusable: IFocusable | IFocusable[]): void;

  deactivate(): void;
}

export class FocusManager implements IFocusManager {
  public readonly id: string = 'FocusManager';
  public readonly view = new Container();
  // signals
  public onActivated = new Signal<() => void>();
  public onDeactivated = new Signal<() => void>();
  public onFocusLayerChange = new Signal<(currentLayerId: string | number) => void>();
  public onFocusChange = new Signal<(detail: FocusChangeDetail) => void>();
  //
  private _focusOutliner: IFocusOutliner;
  private _layers: Map<string | number, IFocusLayer> = new Map();

  private _currentLayerId: string | number | null = null;
  private _focusTarget: IFocusable | null = null;

  private _active: boolean = false;

  constructor() {}

  get active(): boolean {
    return this._active;
  }

  get currentLayerId(): string | number | null {
    return this._currentLayerId;
  }

  public get layerCount(): number {
    return this._layers.size;
  }

  public initialize(app: IApplication): void {
    const options: Partial<FocusManagerOptions> = app.config?.focusOptions || {};
    this._focusOutliner =
      typeof options === 'function'
        ? new (options as Constructor<IFocusOutliner>)()
        : new FocusOutliner(options as Partial<FocusOutlinerConfig>);

    this.view.addChild(this._focusOutliner as unknown as PIXIContainer);
    this._setupKeyboardListeners();
  }

  public destroy(): void {
    this.deactivate();
    this._focusOutliner.destroy();
    this._layers.clear();
  }

  public deactivate(): void {
    this._setTarget(null);
  }

  public addFocusable(focusable: IFocusable | IFocusable[], layerId?: string | number): void {
    if (layerId === undefined) {
      layerId = getLastMapEntry(this._layers)?.[0];
    }
    const layer = this._layers.get(layerId!);
    if (!layer) {
      throw new Error(`Layer with ID ${layerId} does not exist.`);
    }
    if (!Array.isArray(focusable)) {
      focusable = [focusable];
    }
    (focusable as IFocusable[]).forEach((f) => {
      layer.addFocusable(f);
    });
  }

  public removeFocusable(focusable: IFocusable | IFocusable[]) {
    if (!Array.isArray(focusable)) {
      focusable = [focusable];
    }
    this._layers.forEach((layer) => {
      (focusable as IFocusable[]).forEach((f) => {
        layer.removeFocusable(f);
      });
    });
  }

  public setLayerOrder(layerIds: (string | number)[]): void {
    const newLayers: Map<string | number, IFocusLayer> = new Map();
    layerIds.forEach((layerId) => {
      if (!this._layers.has(layerId)) {
        throw new Error(`Layer with ID ${layerId} does not exist.`);
      }
      newLayers.set(layerId, this._layers.get(layerId)!);
    });
    this._layers = newLayers;
  }

  public addFocusLayer(
    layerId?: string | number,
    focusables?: IFocusable | IFocusable[],
    setAsCurrent: boolean = true,
  ): IFocusLayer {
    if (layerId === undefined) {
      layerId = this._layers.size;
    }
    if (this._layers.has(layerId)) {
      throw new Error(`Layer with ID ${layerId} already exists.`);
    }
    const newLayer = new FocusLayer();
    this._layers.set(layerId, newLayer);
    if (setAsCurrent || this._currentLayerId === null) {
      this.setFocusLayer(layerId);
    }
    if (focusables) {
      this.addFocusable(focusables, layerId);
    }
    return newLayer;
  }

  public removeFocusLayer(layerId?: string | number, removeTopLayerIfUndefined = true): void {
    if (layerId === undefined && removeTopLayerIfUndefined) {
      return this._removeTopLayer();
    }
    if (!this._layers.has(layerId!)) {
      throw new Error(`Layer with ID ${layerId} does not exist.`);
    }
    const nextLayerId = getPreviousMapEntry(this._layers, layerId)?.[0];
    this._layers.delete(layerId!);
    this._postDelete(nextLayerId);
  }

  public forceFocus(focusable: IFocusable) {
    this.focus(focusable);
  }

  public focus(focusable: IFocusable) {
    this._setTarget(focusable);
  }

  public setFocusLayer(layerId: string | number): void {
    if (!this._layers.has(layerId)) {
      throw new Error(`Layer with ID ${layerId} does not exist.`);
    }
    this._currentLayerId = layerId;
    const currentLayer = this._getCurrentLayer();
    if (currentLayer) {
      currentLayer.setCurrent();
      this._setTarget(currentLayer.currentFocusable || currentLayer.defaultFocusable || null);
    }

    this.onFocusLayerChange.emit(this._currentLayerId);
  }

  private _getCurrentLayer() {
    return this._currentLayerId != null ? this._layers.get(this._currentLayerId) : null;
  }

  private _removeTopLayer() {
    const layerId = getLastMapEntry(this._layers)[0];
    const nextLayerId = getPreviousMapEntry(this._layers, layerId)?.[0];
    this._layers.delete(layerId);
    this._postDelete(nextLayerId);
  }

  private _postDelete(nextLayerId: string | number) {
    if (this._layers.size === 0) {
      this._currentLayerId = null;
    } else if (nextLayerId !== undefined) {
      this.setFocusLayer(nextLayerId);
    }
  }

  private _setTarget(focusTarget: IFocusable | null) {
    this._focusTarget = focusTarget;

    if (this._focusTarget) {
      if (this._getCurrentLayer()?.hasFocusable(focusTarget)) {
        this._updateOutliner();
      } else {
        Logger.warn(`The focusable ${focusTarget} does not exist on the current focus layer: ${this._currentLayerId}`);
      }
    } else {
      this._focusOutliner.clear();

      if (this._active) {
        this._active = false;
        this.onDeactivated.emit();
      }
    }

    this.onFocusChange.emit({ focusable: focusTarget, layer: this._currentLayerId });
  }

  private _setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (!this._active) {
          this._active = true;
          this.onActivated.emit();
        }
        const direction = e.shiftKey ? -1 : 1;
        this._navigate(direction);
      }
    });

    window.addEventListener('mousedown', () => {
      this.deactivate();
    });
  }

  private _navigate(direction: number): void {
    if (this._currentLayerId == null || this._layers.size === 0) return;
    const currentLayer = this._layers.get(this._currentLayerId);
    if (currentLayer) {
      currentLayer.navigate(direction);
      this._setTarget(currentLayer.currentFocusable);
    }
  }

  private _updateOutliner() {
    if (this._focusTarget) {
      this._focusOutliner.position.set(this._focusTarget.position.x, this._focusTarget.position.y);
      this._focusOutliner.draw(this._focusTarget);
    } else {
      this._focusOutliner.clear();
    }
  }
}