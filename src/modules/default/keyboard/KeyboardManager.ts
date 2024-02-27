import { Signal } from '../../../signals';
import { IModule } from '../../IModule';

type KeyboardEventType = 'keydown' | 'keyup';
type KeyboardEventDetail = { event: KeyboardEvent; key: string };
type KeySignal = Signal<(detail: KeyboardEventDetail) => void>;

export interface IKeyboardManager extends IModule {
  enabled: boolean;

  onKeyDown(key: string): KeySignal;

  onKeyUp(key: string): KeySignal;
}

export class KeyboardManager implements IModule {
  public readonly id: string = 'KeyboardManager';

  private _keyDownSignals: Map<string, KeySignal> = new Map();
  private _keyUpSignals: Map<string, KeySignal> = new Map();

  private _enabled: boolean = true;

  public get enabled(): boolean {
    return this._enabled;
  }

  public set enabled(value: boolean) {
    this._enabled = value;
  }

  public initialize(): void {
    this._handleEvent = this._handleEvent.bind(this);
  }

  public destroy() {
    document.removeEventListener('keydown', this._handleEvent);
    document.removeEventListener('keyup', this._handleEvent);
  }

  public onKeyDown(key: string): KeySignal {
    return this._checkAndAddSignal(key, 'keydown');
  }

  public onKeyUp(key: string): KeySignal {
    return this._checkAndAddSignal(key, 'keyup');
  }

  /**
   * Check if the signal exists and add it if it doesn't
   * Also, if this is the first signal, start listening for the event
   * @param {string} key
   * @param {KeyboardEventType} eventType
   * @returns {KeySignal}
   * @private
   */
  private _checkAndAddSignal(key: string, eventType: KeyboardEventType): KeySignal {
    const signalMap = eventType === 'keydown' ? this._keyDownSignals : this._keyUpSignals;
    if (!signalMap.size) {
      this._listen(eventType);
    }
    if (!signalMap.has(key)) {
      signalMap.set(key, new Signal<(detail: KeyboardEventDetail) => void>());
    }
    return signalMap.get(key) as KeySignal;
  }

  private _listen(eventType: KeyboardEventType): void {
    document.addEventListener(eventType, this._handleEvent);
  }

  private _handleEvent(event: KeyboardEvent): void {
    if (!this._enabled) {
      return;
    }
    const signalMap = event.type === 'keydown' ? this._keyDownSignals : this._keyUpSignals;
    signalMap.get(event.key)?.emit({ event, key: event.key });
  }
}