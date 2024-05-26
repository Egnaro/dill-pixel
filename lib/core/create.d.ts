import { IApplication } from './interfaces';
import { AppConfig } from './types';

export declare const DEFAULT_GAME_CONTAINER_ID = "dill-pixel-game-container";
export declare function createContainer(id: string): HTMLDivElement;
export declare function create(config?: AppConfig, ApplicationClass?: new () => IApplication, domElement?: string | Window | HTMLElement, speak?: boolean): Promise<IApplication>;
//# sourceMappingURL=create.d.ts.map