/**
 * Provides APIs to create windows, communicate with other windows and manipulate the current window.
 *
 * ## Window events
 *
 * Events can be listened to using {@link Window.listen}:
 * ```typescript
 * import { getCurrent } from "@tauri-apps/plugin-window";
 * getCurrent().listen("my-window-event", ({ event, payload }) => { });
 * ```
 *
 * @module
 */
import type { Event, EventName, EventCallback, UnlistenFn } from "@tauri-apps/api/event";
declare global {
    interface Window {
        __TAURI_INVOKE__: <T>(cmd: string, args?: unknown) => Promise<T>;
    }
}
type Theme = "light" | "dark";
type TitleBarStyle = "visible" | "transparent" | "overlay";
/**
 * Allows you to retrieve information about a given monitor.
 *
 * @since 2.0.0
 */
interface Monitor {
    /** Human-readable name of the monitor */
    name: string | null;
    /** The monitor's resolution. */
    size: PhysicalSize;
    /** the Top-left corner position of the monitor relative to the larger full screen area. */
    position: PhysicalPosition;
    /** The scale factor that can be used to map physical pixels to logical pixels. */
    scaleFactor: number;
}
/**
 * The payload for the `scaleChange` event.
 *
 * @since 2.0.0
 */
interface ScaleFactorChanged {
    /** The new window scale factor. */
    scaleFactor: number;
    /** The new window size */
    size: PhysicalSize;
}
/** The file drop event types. */
type FileDropEvent = {
    type: "hover";
    paths: string[];
} | {
    type: "drop";
    paths: string[];
} | {
    type: "cancel";
};
/**
 * A size represented in logical pixels.
 *
 * @since 2.0.0
 */
declare class LogicalSize {
    type: string;
    width: number;
    height: number;
    constructor(width: number, height: number);
}
/**
 * A size represented in physical pixels.
 *
 * @since 2.0.0
 */
declare class PhysicalSize {
    type: string;
    width: number;
    height: number;
    constructor(width: number, height: number);
    /**
     * Converts the physical size to a logical one.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const appWindow = getCurrent();
     * const factor = await appWindow.scaleFactor();
     * const size = await appWindow.innerSize();
     * const logical = size.toLogical(factor);
     * ```
     *  */
    toLogical(scaleFactor: number): LogicalSize;
}
/**
 *  A position represented in logical pixels.
 *
 * @since 2.0.0
 */
declare class LogicalPosition {
    type: string;
    x: number;
    y: number;
    constructor(x: number, y: number);
}
/**
 *  A position represented in physical pixels.
 *
 * @since 2.0.0
 */
declare class PhysicalPosition {
    type: string;
    x: number;
    y: number;
    constructor(x: number, y: number);
    /**
     * Converts the physical position to a logical one.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const appWindow = getCurrent();
     * const factor = await appWindow.scaleFactor();
     * const position = await appWindow.innerPosition();
     * const logical = position.toLogical(factor);
     * ```
     * */
    toLogical(scaleFactor: number): LogicalPosition;
}
/** @ignore */
interface WindowDef {
    label: string;
}
/** @ignore */
declare global {
    interface Window {
        __TAURI_METADATA__: {
            __windows: WindowDef[];
            __currentWindow: WindowDef;
        };
    }
}
/**
 * Attention type to request on a window.
 *
 * @since 2.0.0
 */
declare enum UserAttentionType {
    /**
     * #### Platform-specific
     * - **macOS:** Bounces the dock icon until the application is in focus.
     * - **Windows:** Flashes both the window and the taskbar button until the application is in focus.
     */
    Critical = 1,
    /**
     * #### Platform-specific
     * - **macOS:** Bounces the dock icon once.
     * - **Windows:** Flashes the taskbar button until the application is in focus.
     */
    Informational = 2
}
declare class CloseRequestedEvent {
    /** Event name */
    event: EventName;
    /** The label of the window that emitted this event. */
    windowLabel: string;
    /** Event identifier used to unlisten */
    id: number;
    private _preventDefault;
    constructor(event: Event<null>);
    preventDefault(): void;
    isPreventDefault(): boolean;
}
export type CursorIcon = "default" | "crosshair" | "hand" | "arrow" | "move" | "text" | "wait" | "help" | "progress" | "notAllowed" | "contextMenu" | "cell" | "verticalText" | "alias" | "copy" | "noDrop" | "grab" | "grabbing" | "allScroll" | "zoomIn" | "zoomOut" | "eResize" | "nResize" | "neResize" | "nwResize" | "sResize" | "seResize" | "swResize" | "wResize" | "ewResize" | "nsResize" | "neswResize" | "nwseResize" | "colResize" | "rowResize";
/**
 * Get an instance of `Window` for the current window.
 *
 * @since 2.0.0
 */
declare function getCurrent(): Window;
/**
 * Gets a list of instances of `Window` for all available windows.
 *
 * @since 2.0.0
 */
declare function getAll(): Window[];
/** @ignore */
export type WindowLabel = string;
/**
 * Create new webview window or get a handle to an existing one.
 *
 * Windows are identified by a *label*  a unique identifier that can be used to reference it later.
 * It may only contain alphanumeric characters `a-zA-Z` plus the following special characters `-`, `/`, `:` and `_`.
 *
 * @example
 * ```typescript
 * // loading embedded asset:
 * const appWindow = new Window('theUniqueLabel', {
 *   url: 'path/to/page.html'
 * });
 * // alternatively, load a remote URL:
 * const appWindow = new Window('theUniqueLabel', {
 *   url: 'https://github.com/tauri-apps/tauri'
 * });
 *
 * appWindow.once('tauri://created', function () {
 *  // window successfully created
 * });
 * appWindow.once('tauri://error', function (e) {
 *  // an error happened creating the window
 * });
 *
 * // emit an event to the backend
 * await appWindow.emit("some event", "data");
 * // listen to an event from the backend
 * const unlisten = await appWindow.listen("event name", e => {});
 * unlisten();
 * ```
 *
 * @since 2.0.0
 */
declare class Window {
    /** The window label. It is a unique identifier for the window, can be used to reference it later. */
    label: WindowLabel;
    /** Local event listeners. */
    listeners: Record<string, Array<EventCallback<any>>>;
    /**
     * Creates a new Window.
     * @example
     * ```typescript
     * import { Window } from '@tauri-apps/plugin-window';
     * const appWindow = new Window('my-label', {
     *   url: 'https://github.com/tauri-apps/tauri'
     * });
     * appWindow.once('tauri://created', function () {
     *  // window successfully created
     * });
     * appWindow.once('tauri://error', function (e) {
     *  // an error happened creating the window
     * });
     * ```
     *
     * @param label The unique webview window label. Must be alphanumeric: `a-zA-Z-/:_`.
     * @returns The {@link Window} instance to communicate with the webview.
     *
     * @since 2.0.0
     */
    constructor(label: WindowLabel, options?: WindowOptions);
    /**
     * Gets the Window for the webview associated with the given label.
     * @example
     * ```typescript
     * import { Window } from '@tauri-apps/plugin-window';
     * const mainWindow = Window.getByLabel('main');
     * ```
     *
     * @param label The webview window label.
     * @returns The Window instance to communicate with the webview or null if the webview doesn't exist.
     *
     * @since 2.0.0
     */
    static getByLabel(label: string): Window | null;
    /**
     * Get an instance of `Window` for the current window.
     *
     * @since 2.0.0
     */
    static getCurrent(): Window;
    /**
     * Gets a list of instances of `Window` for all available windows.
     *
     * @since 2.0.0
     */
    static getAll(): Window[];
    /**
     *  Gets the focused window.
     * @example
     * ```typescript
     * import { Window } from '@tauri-apps/plugin-window';
     * const focusedWindow = Window.getFocusedWindow();
     * ```
     *
     * @returns The Window instance to communicate with the webview or `undefined` if there is not any focused window.
     *
     * @since 1.4
     */
    static getFocusedWindow(): Promise<Window | null>;
    /**
     * Listen to an event emitted by the backend that is tied to the webview window.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const unlisten = await getCurrent().listen<string>('state-changed', (event) => {
     *   console.log(`Got error: ${payload}`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    listen<T>(event: EventName, handler: EventCallback<T>): Promise<UnlistenFn>;
    /**
     * Listen to an one-off event emitted by the backend that is tied to the webview window.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const unlisten = await getCurrent().once<null>('initialized', (event) => {
     *   console.log(`Window initialized!`);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param handler Event handler.
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    once<T>(event: string, handler: EventCallback<T>): Promise<UnlistenFn>;
    /**
     * Emits an event to the backend, tied to the webview window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().emit('window-loaded', { loggedIn: true, token: 'authToken' });
     * ```
     *
     * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
     * @param payload Event payload.
     */
    emit(event: string, payload?: unknown): Promise<void>;
    /** @ignore */
    _handleTauriEvent<T>(event: string, handler: EventCallback<T>): boolean;
    /**
     * The scale factor that can be used to map physical pixels to logical pixels.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const factor = await getCurrent().scaleFactor();
     * ```
     *
     * @returns The window's monitor scale factor.
     *
     * @since 2.0.0
     * */
    scaleFactor(): Promise<number>;
    /**
     * The position of the top-left hand corner of the window's client area relative to the top-left hand corner of the desktop.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const position = await getCurrent().innerPosition();
     * ```
     *
     * @returns The window's inner position.
     *
     * @since 2.0.0
     *  */
    innerPosition(): Promise<PhysicalPosition>;
    /**
     * The position of the top-left hand corner of the window relative to the top-left hand corner of the desktop.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const position = await getCurrent().outerPosition();
     * ```
     *
     * @returns The window's outer position.
     *
     * @since 2.0.0
     *  */
    outerPosition(): Promise<PhysicalPosition>;
    /**
     * The physical size of the window's client area.
     * The client area is the content of the window, excluding the title bar and borders.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const size = await getCurrent().innerSize();
     * ```
     *
     * @returns The window's inner size.
     *
     * @since 2.0.0
     */
    innerSize(): Promise<PhysicalSize>;
    /**
     * The physical size of the entire window.
     * These dimensions include the title bar and borders. If you don't want that (and you usually don't), use inner_size instead.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const size = await getCurrent().outerSize();
     * ```
     *
     * @returns The window's outer size.
     *
     * @since 2.0.0
     */
    outerSize(): Promise<PhysicalSize>;
    /**
     * Gets the window's current fullscreen state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const fullscreen = await getCurrent().isFullscreen();
     * ```
     *
     * @returns Whether the window is in fullscreen mode or not.
     *
     * @since 2.0.0
     *  */
    isFullscreen(): Promise<boolean>;
    /**
     * Gets the window's current minimized state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const minimized = await getCurrent().isMinimized();
     * ```
     *
     * @since 2.0.0
     * */
    isMinimized(): Promise<boolean>;
    /**
     * Gets the window's current maximized state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const maximized = await getCurrent().isMaximized();
     * ```
     *
     * @returns Whether the window is maximized or not.
     *
     * @since 2.0.0
     * */
    isMaximized(): Promise<boolean>;
    /**
     * Gets the window's current focus state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const focused = await getCurrent().isFocused();
     * ```
     *
     * @returns Whether the window is focused or not.
     *
     * @since 2.0.0
     * */
    isFocused(): Promise<boolean>;
    /**
     * Gets the window's current decorated state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const decorated = await getCurrent().isDecorated();
     * ```
     *
     * @returns Whether the window is decorated or not.
     *
     * @since 2.0.0
     *  */
    isDecorated(): Promise<boolean>;
    /**
     * Gets the window's current resizable state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const resizable = await getCurrent().isResizable();
     * ```
     *
     * @returns Whether the window is resizable or not.
     *
     * @since 2.0.0
     *  */
    isResizable(): Promise<boolean>;
    /**
     * Gets the window’s native maximize button state.
     *
     * #### Platform-specific
     *
     * - **Linux / iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const maximizable = await getCurrent().isMaximizable();
     * ```
     *
     * @returns Whether the window's native maximize button is enabled or not.
     *  */
    isMaximizable(): Promise<boolean>;
    /**
     * Gets the window’s native minimize button state.
     *
     * #### Platform-specific
     *
     * - **Linux / iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const minimizable = await getCurrent().isMinimizable();
     * ```
     *
     * @returns Whether the window's native minimize button is enabled or not.
     *  */
    isMinimizable(): Promise<boolean>;
    /**
     * Gets the window’s native close button state.
     *
     * #### Platform-specific
     *
     * - **iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const closable = await getCurrent().isClosable();
     * ```
     *
     * @returns Whether the window's native close button is enabled or not.
     *  */
    isClosable(): Promise<boolean>;
    /**
     * Gets the window's current visible state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const visible = await getCurrent().isVisible();
     * ```
     *
     * @returns Whether the window is visible or not.
     *
     * @since 2.0.0
     *  */
    isVisible(): Promise<boolean>;
    /**
     * Gets the window's current title.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const title = await getCurrent().title();
     * ```
     *
     * @since 2.0.0
     * */
    title(): Promise<string>;
    /**
     * Gets the window's current theme.
     *
     * #### Platform-specific
     *
     * - **macOS:** Theme was introduced on macOS 10.14. Returns `light` on macOS 10.13 and below.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * const theme = await getCurrent().theme();
     * ```
     *
     * @returns The window theme.
     *
     * @since 2.0.0
     * */
    theme(): Promise<Theme | null>;
    /**
     * Centers the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().center();
     * ```
     *
     * @param resizable
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    center(): Promise<void>;
    /**
     *  Requests user attention to the window, this has no effect if the application
     * is already focused. How requesting for user attention manifests is platform dependent,
     * see `UserAttentionType` for details.
     *
     * Providing `null` will unset the request for user attention. Unsetting the request for
     * user attention might not be done automatically by the WM when the window receives input.
     *
     * #### Platform-specific
     *
     * - **macOS:** `null` has no effect.
     * - **Linux:** Urgency levels have the same effect.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().requestUserAttention();
     * ```
     *
     * @param requestType
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    requestUserAttention(requestType: UserAttentionType | null): Promise<void>;
    /**
     * Updates the window resizable flag.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setResizable(false);
     * ```
     *
     * @param resizable
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setResizable(resizable: boolean): Promise<void>;
    /**
     * Sets whether the window's native maximize button is enabled or not.
     * If resizable is set to false, this setting is ignored.
     *
     * #### Platform-specific
     *
     * - **macOS:** Disables the "zoom" button in the window titlebar, which is also used to enter fullscreen mode.
     * - **Linux / iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setMaximizable(false);
     * ```
     *
     * @param maximizable
     * @returns A promise indicating the success or failure of the operation.
     */
    setMaximizable(maximizable: boolean): Promise<void>;
    /**
     * Sets whether the window's native minimize button is enabled or not.
     *
     * #### Platform-specific
     *
     * - **Linux / iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setMinimizable(false);
     * ```
     *
     * @param minimizable
     * @returns A promise indicating the success or failure of the operation.
     */
    setMinimizable(minimizable: boolean): Promise<void>;
    /**
     * Sets whether the window's native close button is enabled or not.
     *
     * #### Platform-specific
     *
     * - **Linux:** GTK+ will do its best to convince the window manager not to show a close button. Depending on the system, this function may not have any effect when called on a window that is already visible
     * - **iOS / Android:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setClosable(false);
     * ```
     *
     * @param closable
     * @returns A promise indicating the success or failure of the operation.
     */
    setClosable(closable: boolean): Promise<void>;
    /**
     * Sets the window title.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setTitle('Tauri');
     * ```
     *
     * @param title The new title
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setTitle(title: string): Promise<void>;
    /**
     * Maximizes the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().maximize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    maximize(): Promise<void>;
    /**
     * Unmaximizes the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().unmaximize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    unmaximize(): Promise<void>;
    /**
     * Toggles the window maximized state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().toggleMaximize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    toggleMaximize(): Promise<void>;
    /**
     * Minimizes the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().minimize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    minimize(): Promise<void>;
    /**
     * Unminimizes the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().unminimize();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    unminimize(): Promise<void>;
    /**
     * Sets the window visibility to true.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().show();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    show(): Promise<void>;
    /**
     * Sets the window visibility to false.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().hide();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    hide(): Promise<void>;
    /**
     * Closes the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().close();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    close(): Promise<void>;
    /**
     * Whether the window should have borders and bars.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setDecorations(false);
     * ```
     *
     * @param decorations Whether the window should have borders and bars.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setDecorations(decorations: boolean): Promise<void>;
    /**
     * Whether or not the window should have shadow.
     *
     * #### Platform-specific
     *
     * - **Windows:**
     *   - `false` has no effect on decorated window, shadows are always ON.
     *   - `true` will make ndecorated window have a 1px white border,
     * and on Windows 11, it will have a rounded corners.
     * - **Linux:** Unsupported.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setShadow(false);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setShadow(enable: boolean): Promise<void>;
    /**
     * Set window effects.
     *
     * @since 2.0
     */
    setEffects(effects: Effects): Promise<void>;
    /**
     * Clear any applied effects if possible.
     *
     * @since 2.0
     */
    clearEffects(): Promise<void>;
    /**
     * Whether the window should always be on top of other windows.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setAlwaysOnTop(true);
     * ```
     *
     * @param alwaysOnTop Whether the window should always be on top of other windows or not.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setAlwaysOnTop(alwaysOnTop: boolean): Promise<void>;
    /**
     * Prevents the window contents from being captured by other apps.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setContentProtected(true);
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setContentProtected(protected_: boolean): Promise<void>;
    /**
     * Resizes the window with a new inner size.
     * @example
     * ```typescript
     * import { getCurrent, LogicalSize } from '@tauri-apps/plugin-window';
     * await getCurrent().setSize(new LogicalSize(600, 500));
     * ```
     *
     * @param size The logical or physical inner size.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setSize(size: LogicalSize | PhysicalSize): Promise<void>;
    /**
     * Sets the window minimum inner size. If the `size` argument is not provided, the constraint is unset.
     * @example
     * ```typescript
     * import { getCurrent, PhysicalSize } from '@tauri-apps/plugin-window';
     * await getCurrent().setMinSize(new PhysicalSize(600, 500));
     * ```
     *
     * @param size The logical or physical inner size, or `null` to unset the constraint.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setMinSize(size: LogicalSize | PhysicalSize | null | undefined): Promise<void>;
    /**
     * Sets the window maximum inner size. If the `size` argument is undefined, the constraint is unset.
     * @example
     * ```typescript
     * import { getCurrent, LogicalSize } from '@tauri-apps/plugin-window';
     * await getCurrent().setMaxSize(new LogicalSize(600, 500));
     * ```
     *
     * @param size The logical or physical inner size, or `null` to unset the constraint.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setMaxSize(size: LogicalSize | PhysicalSize | null | undefined): Promise<void>;
    /**
     * Sets the window outer position.
     * @example
     * ```typescript
     * import { getCurrent, LogicalPosition } from '@tauri-apps/plugin-window';
     * await getCurrent().setPosition(new LogicalPosition(600, 500));
     * ```
     *
     * @param position The new position, in logical or physical pixels.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setPosition(position: LogicalPosition | PhysicalPosition): Promise<void>;
    /**
     * Sets the window fullscreen state.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setFullscreen(true);
     * ```
     *
     * @param fullscreen Whether the window should go to fullscreen or not.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setFullscreen(fullscreen: boolean): Promise<void>;
    /**
     * Bring the window to front and focus.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setFocus();
     * ```
     *
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setFocus(): Promise<void>;
    /**
     * Sets the window icon.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setIcon('/tauri/awesome.png');
     * ```
     *
     * Note that you need the `icon-ico` or `icon-png` Cargo features to use this API.
     * To enable it, change your Cargo.toml file:
     * ```toml
     * [dependencies]
     * tauri = { version = "...", features = ["...", "icon-png"] }
     * ```
     *
     * @param icon Icon bytes or path to the icon file.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setIcon(icon: string | Uint8Array): Promise<void>;
    /**
     * Whether the window icon should be hidden from the taskbar or not.
     *
     * #### Platform-specific
     *
     * - **macOS:** Unsupported.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setSkipTaskbar(true);
     * ```
     *
     * @param skip true to hide window icon, false to show it.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setSkipTaskbar(skip: boolean): Promise<void>;
    /**
     * Grabs the cursor, preventing it from leaving the window.
     *
     * There's no guarantee that the cursor will be hidden. You should
     * hide it by yourself if you want so.
     *
     * #### Platform-specific
     *
     * - **Linux:** Unsupported.
     * - **macOS:** This locks the cursor in a fixed location, which looks visually awkward.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setCursorGrab(true);
     * ```
     *
     * @param grab `true` to grab the cursor icon, `false` to release it.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setCursorGrab(grab: boolean): Promise<void>;
    /**
     * Modifies the cursor's visibility.
     *
     * #### Platform-specific
     *
     * - **Windows:** The cursor is only hidden within the confines of the window.
     * - **macOS:** The cursor is hidden as long as the window has input focus, even if the cursor is
     *   outside of the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setCursorVisible(false);
     * ```
     *
     * @param visible If `false`, this will hide the cursor. If `true`, this will show the cursor.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setCursorVisible(visible: boolean): Promise<void>;
    /**
     * Modifies the cursor icon of the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setCursorIcon('help');
     * ```
     *
     * @param icon The new cursor icon.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setCursorIcon(icon: CursorIcon): Promise<void>;
    /**
     * Changes the position of the cursor in window coordinates.
     * @example
     * ```typescript
     * import { getCurrent, LogicalPosition } from '@tauri-apps/plugin-window';
     * await getCurrent().setCursorPosition(new LogicalPosition(600, 300));
     * ```
     *
     * @param position The new cursor position.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setCursorPosition(position: LogicalPosition | PhysicalPosition): Promise<void>;
    /**
     * Changes the cursor events behavior.
     *
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().setIgnoreCursorEvents(true);
     * ```
     *
     * @param ignore `true` to ignore the cursor events; `false` to process them as usual.
     * @returns A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    setIgnoreCursorEvents(ignore: boolean): Promise<void>;
    /**
     * Starts dragging the window.
     * @example
     * ```typescript
     * import { getCurrent } from '@tauri-apps/plugin-window';
     * await getCurrent().startDragging();
     * ```
     *
     * @return A promise indicating the success or failure of the operation.
     *
     * @since 2.0.0
     */
    startDragging(): Promise<void>;
    /**
     * Listen to window resize.
     *
     * @example
     * ```typescript
     * import { getCurrent } from "@tauri-apps/plugin-window";
     * const unlisten = await getCurrent().onResized(({ payload: size }) => {
     *  console.log('Window resized', size);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    onResized(handler: EventCallback<PhysicalSize>): Promise<UnlistenFn>;
    /**
     * Listen to window move.
     *
     * @example
     * ```typescript
     * import { getCurrent } from "@tauri-apps/plugin-window";
     * const unlisten = await getCurrent().onMoved(({ payload: position }) => {
     *  console.log('Window moved', position);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    onMoved(handler: EventCallback<PhysicalPosition>): Promise<UnlistenFn>;
    /**
     * Listen to window close requested. Emitted when the user requests to closes the window.
     *
     * @example
     * ```typescript
     * import { getCurrent } from "@tauri-apps/plugin-window";
     * import { confirm } from '@tauri-apps/api/dialog';
     * const unlisten = await getCurrent().onCloseRequested(async (event) => {
     *   const confirmed = await confirm('Are you sure?');
     *   if (!confirmed) {
     *     // user did not confirm closing the window; let's prevent it
     *     event.preventDefault();
     *   }
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    onCloseRequested(handler: (event: CloseRequestedEvent) => void | Promise<void>): Promise<UnlistenFn>;
    /**
     * Listen to window focus change.
     *
     * @example
     * ```typescript
     * import { getCurrent } from "@tauri-apps/plugin-window";
     * const unlisten = await getCurrent().onFocusChanged(({ payload: focused }) => {
     *  console.log('Focus changed, window is focused? ' + focused);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    onFocusChanged(handler: EventCallback<boolean>): Promise<UnlistenFn>;
    /**
     * Listen to window scale change. Emitted when the window's scale factor has changed.
     * The following user actions can cause DPI changes:
     * - Changing the display's resolution.
     * - Changing the display's scale factor (e.g. in Control Panel on Windows).
     * - Moving the window to a display with a different scale factor.
     *
     * @example
     * ```typescript
     * import { getCurrent } from "@tauri-apps/plugin-window";
     * const unlisten = await getCurrent().onScaleChanged(({ payload }) => {
     *  console.log('Scale changed', payload.scaleFactor, payload.size);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    onScaleChanged(handler: EventCallback<ScaleFactorChanged>): Promise<UnlistenFn>;
    /**
     * Listen to the window menu item click. The payload is the item id.
     *
     * @example
     * ```typescript
     * import { getCurrent } from "@tauri-apps/plugin-window";
     * const unlisten = await getCurrent().onMenuClicked(({ payload: menuId }) => {
     *  console.log('Menu clicked: ' + menuId);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    onMenuClicked(handler: EventCallback<string>): Promise<UnlistenFn>;
    /**
     * Listen to a file drop event.
     * The listener is triggered when the user hovers the selected files on the window,
     * drops the files or cancels the operation.
     *
     * @example
     * ```typescript
     * import { getCurrent } from "@tauri-apps/plugin-window";
     * const unlisten = await getCurrent().onFileDropEvent((event) => {
     *  if (event.payload.type === 'hover') {
     *    console.log('User hovering', event.payload.paths);
     *  } else if (event.payload.type === 'drop') {
     *    console.log('User dropped', event.payload.paths);
     *  } else {
     *    console.log('File drop cancelled');
     *  }
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    onFileDropEvent(handler: EventCallback<FileDropEvent>): Promise<UnlistenFn>;
    /**
     * Listen to the system theme change.
     *
     * @example
     * ```typescript
     * import { getCurrent } from "@tauri-apps/plugin-window";
     * const unlisten = await getCurrent().onThemeChanged(({ payload: theme }) => {
     *  console.log('New theme: ' + theme);
     * });
     *
     * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
     * unlisten();
     * ```
     *
     * @returns A promise resolving to a function to unlisten to the event.
     * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
     *
     * @since 2.0.0
     */
    onThemeChanged(handler: EventCallback<Theme>): Promise<UnlistenFn>;
}
/**
 * an array RGBA colors. Each value has minimum of 0 and maximum of 255.
 *
 * @since 2.0
 */
type Color = [number, number, number, number];
/**
 * Platform-specific window effects
 *
 * @since 2.0
 */
declare enum Effect {
    /**
     * A default material appropriate for the view's effectiveAppearance.  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. You should instead choose an appropriate semantic material.
     */
    AppearanceBased = "appearanceBased",
    /**
     *  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. Use a semantic material instead.
     */
    Light = "light",
    /**
     *  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. Use a semantic material instead.
     */
    Dark = "dark",
    /**
     *  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. Use a semantic material instead.
     */
    MediumLight = "mediumLight",
    /**
     *  **macOS 10.14-**
     *
     * @deprecated since macOS 10.14. Use a semantic material instead.
     */
    UltraDark = "ultraDark",
    /**
     *  **macOS 10.10+**
     */
    Titlebar = "titlebar",
    /**
     *  **macOS 10.10+**
     */
    Selection = "selection",
    /**
     *  **macOS 10.11+**
     */
    Menu = "menu",
    /**
     *  **macOS 10.11+**
     */
    Popover = "popover",
    /**
     *  **macOS 10.11+**
     */
    Sidebar = "sidebar",
    /**
     *  **macOS 10.14+**
     */
    HeaderView = "headerView",
    /**
     *  **macOS 10.14+**
     */
    Sheet = "sheet",
    /**
     *  **macOS 10.14+**
     */
    WindowBackground = "windowBackground",
    /**
     *  **macOS 10.14+**
     */
    HudWindow = "hudWindow",
    /**
     *  **macOS 10.14+**
     */
    FullScreenUI = "fullScreenUI",
    /**
     *  **macOS 10.14+**
     */
    Tooltip = "tooltip",
    /**
     *  **macOS 10.14+**
     */
    ContentBackground = "contentBackground",
    /**
     *  **macOS 10.14+**
     */
    UnderWindowBackground = "underWindowBackground",
    /**
     *  **macOS 10.14+**
     */
    UnderPageBackground = "underPageBackground",
    /**
     *  **Windows 11 Only**
     */
    Mica = "mica",
    /**
     * **Windows 7/10/11(22H1) Only**
     *
     * ## Notes
     *
     * This effect has bad performance when resizing/dragging the window on Windows 11 build 22621.
     */
    Blur = "blur",
    /**
     * **Windows 10/11**
     *
     * ## Notes
     *
     * This effect has bad performance when resizing/dragging the window on Windows 10 v1903+ and Windows 11 build 22000.
     */
    Acrylic = "acrylic"
}
/**
 * Window effect state **macOS only**
 *
 * @see https://developer.apple.com/documentation/appkit/nsvisualeffectview/state
 *
 * @since 2.0
 */
declare enum EffectState {
    /**
     *  Make window effect state follow the window's active state **macOS only**
     */
    FollowsWindowActiveState = "followsWindowActiveState",
    /**
     *  Make window effect state always active **macOS only**
     */
    Active = "active",
    /**
     *  Make window effect state always inactive **macOS only**
     */
    Inactive = "inactive"
}
/** The window effects configuration object
 *
 * @since 2.0
 */
interface Effects {
    /**
     *  List of Window effects to apply to the Window.
     * Conflicting effects will apply the first one and ignore the rest.
     */
    effects: Effect[];
    /**
     * Window effect state **macOS Only**
     */
    state?: EffectState;
    /**
     * Window effect corner radius **macOS Only**
     */
    radius?: number;
    /**
     *  Window effect color. Affects {@link Effects.Blur} and {@link Effects.Acrylic} only
     * on Windows 10 v1903+. Doesn't have any effect on Windows 7 or Windows 11.
     */
    color?: Color;
}
/**
 * Configuration for the window to create.
 *
 * @since 2.0.0
 */
interface WindowOptions {
    /**
     * Remote URL or local file path to open.
     *
     * - URL such as `https://github.com/tauri-apps` is opened directly on a Tauri window.
     * - data: URL such as `data:text/html,<html>...` is only supported with the `window-data-url` Cargo feature for the `tauri` dependency.
     * - local file path or route such as `/path/to/page.html` or `/users` is appended to the application URL (the devServer URL on development, or `tauri://localhost/` and `https://tauri.localhost/` on production).
     */
    url?: string;
    /** Show window in the center of the screen.. */
    center?: boolean;
    /** The initial vertical position. Only applies if `y` is also set. */
    x?: number;
    /** The initial horizontal position. Only applies if `x` is also set. */
    y?: number;
    /** The initial width. */
    width?: number;
    /** The initial height. */
    height?: number;
    /** The minimum width. Only applies if `minHeight` is also set. */
    minWidth?: number;
    /** The minimum height. Only applies if `minWidth` is also set. */
    minHeight?: number;
    /** The maximum width. Only applies if `maxHeight` is also set. */
    maxWidth?: number;
    /** The maximum height. Only applies if `maxWidth` is also set. */
    maxHeight?: number;
    /** Whether the window is resizable or not. */
    resizable?: boolean;
    /** Window title. */
    title?: string;
    /** Whether the window is in fullscreen mode or not. */
    fullscreen?: boolean;
    /** Whether the window will be initially focused or not. */
    focus?: boolean;
    /**
     * Whether the window is transparent or not.
     * Note that on `macOS` this requires the `macos-private-api` feature flag, enabled under `tauri.conf.json > tauri > macOSPrivateApi`.
     * WARNING: Using private APIs on `macOS` prevents your application from being accepted to the `App Store`.
     */
    transparent?: boolean;
    /** Whether the window should be maximized upon creation or not. */
    maximized?: boolean;
    /** Whether the window should be immediately visible upon creation or not. */
    visible?: boolean;
    /** Whether the window should have borders and bars or not. */
    decorations?: boolean;
    /** Whether the window should always be on top of other windows or not. */
    alwaysOnTop?: boolean;
    /** Prevents the window contents from being captured by other apps. */
    contentProtected?: boolean;
    /** Whether or not the window icon should be added to the taskbar. */
    skipTaskbar?: boolean;
    /**
     *  Whether or not the window has shadow.
     *
     * #### Platform-specific
     *
     * - **Windows:**
     *   - `false` has no effect on decorated window, shadows are always ON.
     *   - `true` will make ndecorated window have a 1px white border,
     * and on Windows 11, it will have a rounded corners.
     * - **Linux:** Unsupported.
     *
     * @since 2.0.0
     */
    shadow?: boolean;
    /**
     * Whether the file drop is enabled or not on the webview. By default it is enabled.
     *
     * Disabling it is required to use drag and drop on the frontend on Windows.
     */
    fileDropEnabled?: boolean;
    /**
     * The initial window theme. Defaults to the system theme.
     *
     * Only implemented on Windows and macOS 10.14+.
     */
    theme?: Theme;
    /**
     * The style of the macOS title bar.
     */
    titleBarStyle?: TitleBarStyle;
    /**
     * If `true`, sets the window title to be hidden on macOS.
     */
    hiddenTitle?: boolean;
    /**
     * Whether clicking an inactive window also clicks through to the webview on macOS.
     */
    acceptFirstMouse?: boolean;
    /**
     * Defines the window [tabbing identifier](https://developer.apple.com/documentation/appkit/nswindow/1644704-tabbingidentifier) on macOS.
     *
     * Windows with the same tabbing identifier will be grouped together.
     * If the tabbing identifier is not set, automatic tabbing will be disabled.
     */
    tabbingIdentifier?: string;
    /**
     * The user agent for the webview.
     */
    userAgent?: string;
    /**
     * Whether or not the webview should be launched in incognito mode.
     *
     * #### Platform-specific
     *
     * - **Android:** Unsupported.
     */
    incognito?: boolean;
    /**
     * Whether the window's native maximize button is enabled or not. Defaults to `true`.
     */
    maximizable?: boolean;
    /**
     * Whether the window's native minimize button is enabled or not. Defaults to `true`.
     */
    minimizable?: boolean;
    /**
     * Whether the window's native close button is enabled or not. Defaults to `true`.
     */
    closable?: boolean;
}
/**
 * Returns the monitor on which the window currently resides.
 * Returns `null` if current monitor can't be detected.
 * @example
 * ```typescript
 * import { currentMonitor } from '@tauri-apps/plugin-window';
 * const monitor = currentMonitor();
 * ```
 *
 * @since 2.0.0
 */
declare function currentMonitor(): Promise<Monitor | null>;
/**
 * Returns the primary monitor of the system.
 * Returns `null` if it can't identify any monitor as a primary one.
 * @example
 * ```typescript
 * import { primaryMonitor } from '@tauri-apps/plugin-window';
 * const monitor = primaryMonitor();
 * ```
 *
 * @since 2.0.0
 */
declare function primaryMonitor(): Promise<Monitor | null>;
/**
 * Returns the list of all the monitors available on the system.
 * @example
 * ```typescript
 * import { availableMonitors } from '@tauri-apps/plugin-window';
 * const monitors = availableMonitors();
 * ```
 *
 * @since 2.0.0
 */
declare function availableMonitors(): Promise<Monitor[]>;
export { Window, CloseRequestedEvent, getCurrent, getAll, LogicalSize, PhysicalSize, LogicalPosition, PhysicalPosition, UserAttentionType, Effect, EffectState, currentMonitor, primaryMonitor, availableMonitors, };
export type { Theme, TitleBarStyle, Monitor, ScaleFactorChanged, FileDropEvent, WindowOptions, Color, };
