import { Door } from '@/entities/physics/Door';
import { Platform, PlatformConfig, PlatformMovementConfigOpts } from '@/entities/physics/Platform';
import { Player } from '@/entities/physics/Player';
import { Portal } from '@/entities/physics/Portal';

import { BaseScene } from '@/scenes/BaseScene';
import { Camera, Container, delay, UICanvas } from 'dill-pixel';
import { Assets, Ticker } from 'pixi.js';
import { Collision, default as SnapPhysics } from '@dill-pixel/plugin-snap-physics';
import { SegmentConfig } from '@/entities/physics/Segment';
import { EndlessRunner } from '@/entities/physics/EndlessRunner';
import { Joystick } from '@/ui/Joystick';

export class EndlessRunnerScene extends BaseScene {
  ui: UICanvas;
  level: Container;
  player: Player;
  platforms: Platform[] = [];
  doors: Door[] = [];
  portals: Portal[] = [];
  _isPaused: boolean = false;
  camera: Camera;
  protected readonly title = 'Snap Physics - Endless Runner';
  protected readonly subtitle = 'Arrows, WASD to move, up / spacebar to jump, "P" to pause.';
  protected config = {
    useCamera: false,
    zoom: 1,
    useSpatialHash: true,
    gridCellSize: 300,
    debug: false,
  };
  private _segments: SegmentConfig[];
  private _joystick: Joystick;

  // private _debugGfx = new Graphics();

  protected get physics(): SnapPhysics {
    return this.app.getPlugin('physics') as unknown as SnapPhysics;
  }

  configureGUI() {
    const spatialHashFolder = this.gui.addFolder('Spatial Hash Collisions');
    spatialHashFolder.open();

    spatialHashFolder
      .add(this.config, 'useSpatialHash')
      .onChange(() => {
        this._handleSpatialHashChanged();
      })
      .name('Active');

    spatialHashFolder
      .add(this.config, 'gridCellSize', 50, 800, 50)
      .onChange(() => {
        this._handleGridCellSizeChange();
      })
      .name('Cell Size');

    this.gui
      .add(this.config, 'debug')
      .onChange(() => {
        this._handleDebugChanged();
      })
      .name('Debug Physics');
  }

  async initialize() {
    await super.initialize();

    await Assets.loadBundle('spine');

    this.app.focus.addFocusLayer(this.id);

    this.level = this.add.container({
      label: 'Level',
      position: [-this.app.size.width * 0.5, -this.app.size.height * 0.5],
    });

    this.physics.system.initialize({
      gravity: 10,
      container: this.level,
      debug: false,
      fps: 60,

      useSpatialHashGrid: this.config.useSpatialHash,
      cellSize: this.config.gridCellSize,
      collisionResolver: this._resolveCollision,
    });
    const bottom = this.app.size.height - 200;
    this._segments = this.createSegments(bottom);

    EndlessRunner.initialize(this.app.size.width * 0.75, [1, 0]);

    while (!EndlessRunner.hasEnoughSegments) {
      const segment = this.getEmptySegment(bottom);
      this.level.add.existing(segment);
    }

    EndlessRunner.width = this.app.size.width * 2;

    this.addPlayer();
    this.addControls();

    this._handleDebugChanged();
    this._handleUseCameraChanged();

    this.addSignalConnection(
      this.app.keyboard.onKeyDown('p').connect(() => {
        this.app.sendAction('pause');
      }),
      this.app.actions('pause').connect(this._togglePause),
    );
  }

  async start() {
    await delay(0.5);
  }

  update(ticker: Ticker) {
    if (this._isPaused) return;
    if (
      this.app.keyboard.isKeyDown('ArrowUp') ||
      this.app.keyboard.isKeyDown(' ') ||
      this.app.keyboard.isKeyDown('w')
    ) {
      this.app.sendAction('jump');
    }
    if (
      this.app.keyboard.isKeyDown('ArrowLeft') ||
      this.app.keyboard.isKeyDown('a') ||
      this._joystick.direction.includes('left')
    ) {
      this.app.sendAction('move_left');
    }
    if (
      this.app.keyboard.isKeyDown('ArrowRight') ||
      this.app.keyboard.isKeyDown('d') ||
      this._joystick.direction.includes('right')
    ) {
      this.app.sendAction('move_right');
    }

    // add more segments if needed
    if (!EndlessRunner.hasEnoughSegments) {
      while (!EndlessRunner.hasEnoughSegments && !this._isPaused) {
        const segment = this.createRandomSegment();
        this.level.add.existing(segment);
      }
    }

    // update physics - adding EndlessRunner.update to pre-update hooks
    this.physics.system.update(ticker.deltaTime, [EndlessRunner.update]);

    if (this.player.x < -50 || this.player.y > this.app.size.height + 50) {
      this.player.kill();
    }
  }

  createRandomSegment() {
    return EndlessRunner.createSegment(this._segments[Math.floor(Math.random() * this._segments.length)]);
  }

  getEmptySegment(bottom: number) {
    const emptySegmentConfig = {
      width: 1000,
      platforms: [this.getPlatFormConfig(500, bottom, 1000, 20)],
    };
    return EndlessRunner.createSegment(emptySegmentConfig);
  }

  resize() {
    super.resize();
    if (this.camera) {
      this.camera.viewportWidth = this.app.size.width;
      this.camera.viewportHeight = this.app.size.height;
    }

    this.player.constrainX(50, this.app.size.width - 50);

    this._isPaused = true;
    EndlessRunner.width = this.app.size.width * 2;
    this.level.position.set(-this.app.size.width * 0.5, -this.app.size.height * 0.5);

    this.app.ticker.addOnce(() => {
      this._isPaused = false;
    });
  }

  createSegments(bottom: number): SegmentConfig[] {
    const segment0Config = {
      width: 600,
      platforms: [
        this.getPlatFormConfig(300, bottom - 50, 400, 20),
        this.getPlatFormConfig(250, bottom - 100, 30, 100),
        this.getPlatFormConfig(370, bottom - 300, 200, 30),
      ],
    };

    const segment1Config = {
      width: 500,
      platforms: [
        this.getPlatFormConfig(250, bottom, 500, 20),
        this.getPlatFormConfig(250, bottom - 88, 30, 160),
        this.getPlatFormConfig(205, bottom - 120, 60, 20, false),
        this.getPlatFormConfig(295, bottom - 120, 60, 20, false),
      ],
    };

    const segment2Config = {
      width: 300,
      platforms: [this.getPlatFormConfig(150, bottom, 300, 20), this.getPlatFormConfig(150, bottom - 75, 30, 140)],
    };

    const segment3Config = {
      width: 500,
      platforms: [
        this.getPlatFormConfig(250, bottom, 500, 20),
        this.getPlatFormConfig(250, bottom - 240, 200, 20, false, true, {
          speed: 1,
          startingDirection: { x: 1, y: 0 },
          range: [250, 0],
        }),
      ],
    };

    const segment4Config = {
      width: 400,
      platforms: [
        this.getPlatFormConfig(200, bottom, 400, 20),
        this.getPlatFormConfig(200, bottom - 120, 200, 20, false, true, {
          speed: 1,
          startingDirection: { x: 0, y: 1 },
          range: [0, 200],
        }),
      ],
    };

    const segment5Config = {
      width: 300,
      platforms: [this.getPlatFormConfig(150, bottom, 300, 20), this.getPlatFormConfig(150, bottom - 220, 30, 200)],
    };

    return [segment0Config, segment1Config, segment2Config, segment3Config, segment4Config, segment5Config];
    // return [segment0Config];
  }

  getPlatFormConfig(
    x: number,
    y: number,
    width: number,
    height = 15,
    canJumpThroughBottom: boolean = false,
    moving: boolean = false,
    movementConfig?: PlatformMovementConfigOpts,
    color: number = 0x00fff0,
  ): PlatformConfig {
    return Platform.resolveConfig({
      width,
      height,
      color,
      canJumpThroughBottom,
      moving,
      movementConfig,
      x,
      y,
    });
  }

  addPlayer() {
    let delay = 0.5;
    if (!this.player) {
      delay = 1;
      this.player = new Player();
      this.player.constrainX(50, this.app.size.width - 50);
      this.player.onKilled.connect(this._handlePlayerKilled);
    }
    this.player.lookRight();
    this.level.add.existing(this.player);
    this.player.spawn({ x: this.app.size.width * 0.1, y: this.app.size.height * 0.3 }, delay);
  }

  addControls() {
    this.ui = this.add.uiCanvas({ padding: 10, useAppSize: true });
    this.ui.zIndex = 100;

    const jumpButton = this.make.button({
      cursor: 'pointer',
      scale: 0.5,
      textures: {
        default: 'btn_circle/up',
        hover: 'btn_circle/over',
        disabled: 'btn_circle/up',
        active: 'btn_circle/down',
      },
      sheet: 'ui.json',
      accessibleTitle: 'jump',
      accessibleHint: `Press to jump`,
    });

    jumpButton.addIsDownCallback('jump', () => {
      this.app.sendAction('jump');
    });

    this._joystick = new Joystick({
      inner: this.make.sprite({
        asset: 'joystick/handle',
        sheet: 'ui.json',
      }),
      outer: this.make.sprite({
        asset: 'joystick/base',
        sheet: 'ui.json',
      }),
      innerScale: 0.7,
      outerScale: 0.7,
    });
    this.ui.addElement(this._joystick, { align: 'left' });
    this.ui.addElement(jumpButton, { align: 'right', padding: { right: 15 } });

    if (!this.app.isMobile) {
      this._joystick.visible = false;
      jumpButton.visible = false;
    }
  }

  async _handlePlayerKilled() {
    this.addPlayer();
  }

  destroy() {
    this._isPaused = true;
    this.physics.destroy();
    EndlessRunner.destroy();
    this.level.removeChildren();
    super.destroy();
  }

  protected _handleDebugChanged() {
    const { debug } = this.config;
    this.physics.system.debug = debug;
  }

  protected _handleCameraZoomChanged() {
    const { zoom } = this.config;
    if (this.camera) {
      this.camera.zoom(zoom);
    }
  }

  protected _handleUseCameraChanged() {
    const { useCamera } = this.config;
    if (useCamera) {
      this.camera = new Camera({
        container: this.level,
        viewportWidth: this.app.size.width,
        viewportHeight: this.app.size.height,
        worldWidth: this.physics.system.worldWidth,
        worldHeight: this.physics.system.worldHeight,
        minX: -300,
        minY: 0,
        maxX: 300,
        maxY: 200,
        lerp: 0.1,
      });
      this.physics.system.camera = this.camera;
      this.add.existing(this.camera);
      this.camera.follow(this.player, [this.app.screen.width * 0.25, -100]);
      this.camera.onZoom.connect(this._adjustCollisionThreshold);
      this.camera.onZoomComplete.connect(this._resetCollisionThreshold);
      this._handleCameraZoomChanged();
    } else {
      this.removeChild(this.camera);
      // @ts-expect-error camera can't be null error
      this.camera = null;
      this.addChild(this.level);
      this.level.position.set(-this.app.size.width * 0.5, -this.app.size.height * 0.5);
      this.level.pivot.set(0, 0);
    }
  }

  private _togglePause() {
    this._isPaused = !this._isPaused;
  }

  private _adjustCollisionThreshold() {
    if (!this.camera) {
      return;
    }
    this.physics.system.collisionThreshold = Math.round(this.camera.scale.x + 2);
  }

  private _resetCollisionThreshold() {
    this.physics.system.collisionThreshold = this.physics.system.DEFAULT_COLLISION_THRESHOLD;
  }

  private _handleSpatialHashChanged() {
    this.physics.useSpatialHashGrid = this.config.useSpatialHash;
  }

  private _handleGridCellSizeChange() {
    this.physics.gridCellSize = this.config.gridCellSize;
  }

  private _resolveCollision(collision: Collision) {
    switch (collision.type) {
      case 'Portal|Player':
      case 'Portal|FX':
      case 'Player|FX':
      case 'FX|Player':
        return false;
      case 'Player|Platform':
        // eslint-disable-next-line no-case-declarations
        const platform = collision.entity2 as Platform;
        // eslint-disable-next-line no-case-declarations
        const player = collision.entity1 as Player;
        if (platform.canJumpThroughBottom) {
          if (collision.top) {
            player.setPassingThrough(platform);
          } else if (player.bottom <= platform.top) {
            player.removePassingThrough(platform);
          }
          return !player.isPassingThrough(platform);
        }
        return true;
      default:
        return true;
    }
  }
}
