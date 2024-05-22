import { IPlugin, Plugin } from './plugins/Plugin';

export * from './pixi';
export type { IPlugin };
export { Plugin };
/**
 * Export the Application class from the 'core' module.
 * This class is used to create a new application instance.
 */
export { Application } from './core/Application';
/**
 * Export the IApplication and RequiredApplicationConfig types from the 'core' module.
 * These types are used for type checking the application instance and its configuration.
 */
export type { IApplication, AppConfig } from './core/Application';
/**
 * Export various types from the 'modules' module.
 * These types are used for type checking the different modules of the application.
 */
export type { IAssetsPlugin } from './plugins/AssetsPlugin';
export type { ISceneManagerPlugin, LoadSceneMethod } from './plugins/SceneManagerPlugin';
export type { IWebEventsPlugin } from './plugins/WebEventsPlugin';
export type { IPopupManagerPlugin } from './plugins/popups/PopupManagerPlugin';
export type { IKeyboardPlugin, KeyboardEventDetail } from './plugins/KeyboardPlugin';
export type { IFocusable, IFocusManagerPlugin, FocusManagerPluginOptions } from './plugins/focus/FocusManagerPlugin';
export type { IFocusOutliner, FocusOutlinerConfig } from './plugins/focus/FocusOutliner';
export { FocusOutliner } from './plugins/focus/FocusOutliner';
export type { IAudioManagerPlugin } from './plugins/audio/AudioManagerPlugin';
export type { Ii18nPlugin, i18nOptions } from './plugins/i18nPlugin';
export type { IResizerPlugin } from './plugins/ResizerPlugin';
export type { IInputPlugin, ActionDetail } from './plugins/InputPlugin';
export type { ICaptionsPlugin, CaptionsOptions } from './plugins/captions/CaptionsPlugin';
export type { ICaptionRenderer } from './plugins/captions/CaptionsRenderer';
export type { IVoiceOverPlugin } from './plugins/audio/VoiceOverPlugin';
export { ActionContext, Action } from './plugins/InputPlugin';
/**
 * Export the StorageAdapter and LocalStorageAdapter classes from the 'store' module.
 * These classes are used for managing the application's storage.
 */
export { StorageAdapter } from './store/adapters/StorageAdapter';
export { LocalStorageAdapter } from './store/adapters/LocalStorageAdapter';
export type { IStorageAdapter } from './store/adapters/StorageAdapter';
export { Store } from './store/Store';
/**
 * Export various utility types and functions from the 'utils' module.
 * These utilities are used throughout the application for various tasks.
 */
export type { WithRequiredProps, Constructor, TextureLike, SpriteSheetLike, ContainerLike, RectLike, PointLike, WithPointLike, Size, ImportListItem, ImportList, SceneImportList, SceneImportListItem, EaseString, } from './utils/types';
export { clamp, lerp } from './utils/math';
export { resolvePointLike, getSheetLikeString, setObjectName } from './utils/functions';
export { getPreviousMapEntry, getLastMapEntry } from './utils/map';
export { isRetina, isMobile } from './utils/platform';
export { isDev, isProduction, env } from './utils/env';
export { Logger } from './utils/console/Logger';
export { Queue, createQueue } from './utils/promise/Queue';
export { delay } from './utils/async';
export { pluck, omitKeys } from './utils/object';
export { bindMethods, bindAllMethods, checkAndInvokeMethod } from './utils/methodBinding';
export { getDynamicModuleFromImportListItem } from './utils/framework';
/**
 * Export various mixin classes from the 'mixins' module.
 * These mixins are used to add additional functionality to the application's classes.
 */
export { FactoryContainer, Factory } from './mixins/factory';
export { Animated } from './mixins/animated';
export { Interactive } from './mixins/interaction';
export { Focusable } from './mixins/focus';
export { WithSignals } from './mixins/signals';
/**
 * Export the Container and Scene classes from the 'display' module.
 * These classes are used for managing the application's display.
 */
export { Container } from './display/Container';
export { Popup } from './display/Popup';
export type { PopupConfig } from './display/Popup';
export { Button } from './display/Button';
export { Scene } from './display/Scene';
export { Camera } from './display/Camera';
export type { ICamera } from './display/Camera';
export { FlexContainer } from './display/FlexContainer';
export { UICanvas } from './display/UICanvas';
export { SpineAnimation } from './display/SpineAnimation';
export type { ISpineAnimation } from './display/SpineAnimation';
export type { IFlexContainer, FlexWrap, FlexDirection, JustifyContent, AlignItems, FlexContainerConfig, } from './display/FlexContainer';
export type { IContainer } from './display/Container';
export type { IPopup } from './display/Popup';
export type { IScene } from './display/Scene';
export { Signal, SignalConnections, Collector, CollectorLast, CollectorArray, CollectorUntil0, CollectorWhile0, } from './signals/Signal';
export type { SignalConnection } from './signals/Signal';
/**
 * This function is used to create a new application instance.
 */
export { create } from './core/create';
/**
 * third party stuff
 */
export type { Spine } from './plugins/spine/pixi-spine';
//# sourceMappingURL=index.d.ts.map