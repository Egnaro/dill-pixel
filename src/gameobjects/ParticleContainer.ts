import {IDestroyOptions, IPoint, ParticleContainer as PIXIParticleContainer, Ticker} from 'pixi.js';
import {SignalConnection, SignalConnections} from 'typed-signals';
import {Application} from '../core';
import {Editor} from '../misc';
import {Signals} from '../signals';
import {Add, Make} from '../utils/factory';

/**
 * Enhanced PIXI Container that has:
 * a factory for adding children,
 * a reference to the Application instance,
 * a signal connection manager,
 * and auto update / resize capabilities
 * @class ParticleContainer
 * @extends PIXIParticleContainer
 */
export class ParticleContainer extends PIXIParticleContainer {
  protected _addFactory: Add;

  // optionally add signals to a SignalConnections instance for easy removal
  protected _signalConnections: SignalConnections = new SignalConnections();

  protected _editMode = false;
  protected editor: Editor;

  public editable: boolean = true;
  public childrenEditable: boolean = true;

  constructor(autoResize: boolean = true, autoUpdate: boolean = false) {
    super();
    this.update = this.update.bind(this);
    this.onResize = this.onResize.bind(this);
    this._addFactory = new Add(this);

    if (autoResize) {
      Signals.onResize.connect(this.onResize);
    }

    if (autoUpdate) {
      Ticker.shared.add(this.update);
    }
  }

  set editMode(value: boolean) {
    this._editMode = value;
    if (this._editMode) {
      this.enableEditMode();
    } else {
      this.disableEditMode();
    }
  }

  get editMode(): boolean {
    return this._editMode;
  }

  enableEditMode() {
    this.editor = new Editor(this);
  }

  disableEditMode() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  get add(): Add {
    return this._addFactory;
  }

  get make(): typeof Make {
    return Make;
  }

  get app(): Application {
    return Application.instance;
  }

  destroy(_options?: IDestroyOptions | boolean) {
    this.disconnectAllSignals();
    super.destroy(_options);
  }

  public onResize(_size: IPoint) {
    // noop
  }

  public update(_deltaTime: number) {
    // noop
  }

  /**
   * @protected
   * adds a signal connection
   */
  protected addSignalConnection(pConnection: SignalConnection) {
    this._signalConnections.add(pConnection);
  }

  /**
   * @protected
   * removes all signal connections
   */
  protected disconnectAllSignals() {
    this._signalConnections.disconnectAll();
  }
}