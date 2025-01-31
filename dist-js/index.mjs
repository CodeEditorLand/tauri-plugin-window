import { emit, listen, once, TauriEvent } from "@tauri-apps/api/event";

// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * A size represented in logical pixels.
 *
 * @since 2.0.0
 */
class LogicalSize {
	constructor(width, height) {
		this.type = "Logical";
		this.width = width;
		this.height = height;
	}
}
/**
 * A size represented in physical pixels.
 *
 * @since 2.0.0
 */
class PhysicalSize {
	constructor(width, height) {
		this.type = "Physical";
		this.width = width;
		this.height = height;
	}
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
	toLogical(scaleFactor) {
		return new LogicalSize(
			this.width / scaleFactor,
			this.height / scaleFactor,
		);
	}
}
/**
 *  A position represented in logical pixels.
 *
 * @since 2.0.0
 */
class LogicalPosition {
	constructor(x, y) {
		this.type = "Logical";
		this.x = x;
		this.y = y;
	}
}
/**
 *  A position represented in physical pixels.
 *
 * @since 2.0.0
 */
class PhysicalPosition {
	constructor(x, y) {
		this.type = "Physical";
		this.x = x;
		this.y = y;
	}
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
	toLogical(scaleFactor) {
		return new LogicalPosition(this.x / scaleFactor, this.y / scaleFactor);
	}
}
/**
 * Attention type to request on a window.
 *
 * @since 2.0.0
 */
var UserAttentionType;
(function (UserAttentionType) {
	/**
	 * #### Platform-specific
	 * - **macOS:** Bounces the dock icon until the application is in focus.
	 * - **Windows:** Flashes both the window and the taskbar button until the application is in focus.
	 */
	UserAttentionType[(UserAttentionType["Critical"] = 1)] = "Critical";
	/**
	 * #### Platform-specific
	 * - **macOS:** Bounces the dock icon once.
	 * - **Windows:** Flashes the taskbar button until the application is in focus.
	 */
	UserAttentionType[(UserAttentionType["Informational"] = 2)] =
		"Informational";
})(UserAttentionType || (UserAttentionType = {}));
class CloseRequestedEvent {
	constructor(event) {
		this._preventDefault = false;
		this.event = event.event;
		this.windowLabel = event.windowLabel;
		this.id = event.id;
	}
	preventDefault() {
		this._preventDefault = true;
	}
	isPreventDefault() {
		return this._preventDefault;
	}
}
/**
 * Get an instance of `Window` for the current window.
 *
 * @since 2.0.0
 */
function getCurrent() {
	return new Window(window.__TAURI_METADATA__.__currentWindow.label, {
		// @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
		skip: true,
	});
}
/**
 * Gets a list of instances of `Window` for all available windows.
 *
 * @since 2.0.0
 */
function getAll() {
	return window.__TAURI_METADATA__.__windows.map(
		(w) =>
			new Window(w.label, {
				// @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
				skip: true,
			}),
	);
}
/** @ignore */
// events that are emitted right here instead of by the created webview
const localTauriEvents = ["tauri://created", "tauri://error"];
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
class Window {
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
	constructor(label, options = {}) {
		this.label = label;
		this.listeners = Object.create(null);
		// @ts-expect-error `skip` is not a public API so it is not defined in WindowOptions
		if (!(options === null || options === void 0 ? void 0 : options.skip)) {
			window
				.__TAURI_INVOKE__("plugin:window|create", {
					options: {
						...options,
						label,
					},
				})
				.then(async () => this.emit("tauri://created"))
				.catch(async (e) => this.emit("tauri://error", e));
		}
	}
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
	static getByLabel(label) {
		if (getAll().some((w) => w.label === label)) {
			// @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
			return new Window(label, { skip: true });
		}
		return null;
	}
	/**
	 * Get an instance of `Window` for the current window.
	 *
	 * @since 2.0.0
	 */
	static getCurrent() {
		return getCurrent();
	}
	/**
	 * Gets a list of instances of `Window` for all available windows.
	 *
	 * @since 2.0.0
	 */
	static getAll() {
		return getAll();
	}
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
	static async getFocusedWindow() {
		for (const w of getAll()) {
			if (await w.isFocused()) {
				return w;
			}
		}
		return null;
	}
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
	async listen(event, handler) {
		if (this._handleTauriEvent(event, handler)) {
			return Promise.resolve(() => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, security/detect-object-injection
				const listeners = this.listeners[event];
				listeners.splice(listeners.indexOf(handler), 1);
			});
		}
		return listen(event, handler, { target: this.label });
	}
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
	async once(event, handler) {
		if (this._handleTauriEvent(event, handler)) {
			return Promise.resolve(() => {
				// eslint-disable-next-line security/detect-object-injection
				const listeners = this.listeners[event];
				listeners.splice(listeners.indexOf(handler), 1);
			});
		}
		return once(event, handler, { target: this.label });
	}
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
	async emit(event, payload) {
		if (localTauriEvents.includes(event)) {
			// eslint-disable-next-line
			for (const handler of this.listeners[event] || []) {
				handler({ event, id: -1, windowLabel: this.label, payload });
			}
			return Promise.resolve();
		}
		return emit(event, payload, { target: this.label });
	}
	/** @ignore */
	_handleTauriEvent(event, handler) {
		if (localTauriEvents.includes(event)) {
			if (!(event in this.listeners)) {
				// eslint-disable-next-line
				this.listeners[event] = [handler];
			} else {
				// eslint-disable-next-line
				this.listeners[event].push(handler);
			}
			return true;
		}
		return false;
	}
	// Getters
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
	async scaleFactor() {
		return window.__TAURI_INVOKE__("plugin:window|scale_factor", {
			label: this.label,
		});
	}
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
	async innerPosition() {
		return window
			.__TAURI_INVOKE__("plugin:window|inner_position", {
				label: this.label,
			})
			.then(({ x, y }) => new PhysicalPosition(x, y));
	}
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
	async outerPosition() {
		return window
			.__TAURI_INVOKE__("plugin:window|outer_position", {
				label: this.label,
			})
			.then(({ x, y }) => new PhysicalPosition(x, y));
	}
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
	async innerSize() {
		return window
			.__TAURI_INVOKE__("plugin:window|inner_size", {
				label: this.label,
			})
			.then(({ width, height }) => new PhysicalSize(width, height));
	}
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
	async outerSize() {
		return window
			.__TAURI_INVOKE__("plugin:window|outer_size", {
				label: this.label,
			})
			.then(({ width, height }) => new PhysicalSize(width, height));
	}
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
	async isFullscreen() {
		return window.__TAURI_INVOKE__("plugin:window|is_fullscreen", {
			label: this.label,
		});
	}
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
	async isMinimized() {
		return window.__TAURI_INVOKE__("plugin:window|is_minimized", {
			label: this.label,
		});
	}
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
	async isMaximized() {
		return window.__TAURI_INVOKE__("plugin:window|is_maximized", {
			label: this.label,
		});
	}
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
	async isFocused() {
		return window.__TAURI_INVOKE__("plugin:window|is_focused", {
			label: this.label,
		});
	}
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
	async isDecorated() {
		return window.__TAURI_INVOKE__("plugin:window|is_decorated", {
			label: this.label,
		});
	}
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
	async isResizable() {
		return window.__TAURI_INVOKE__("plugin:window|is_resizable", {
			label: this.label,
		});
	}
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
	async isMaximizable() {
		return window.__TAURI_INVOKE__("plugin:window|is_maximizable", {
			label: this.label,
		});
	}
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
	async isMinimizable() {
		return window.__TAURI_INVOKE__("plugin:window|is_minimizable", {
			label: this.label,
		});
	}
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
	async isClosable() {
		return window.__TAURI_INVOKE__("plugin:window|is_closable", {
			label: this.label,
		});
	}
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
	async isVisible() {
		return window.__TAURI_INVOKE__("plugin:window|is_visible", {
			label: this.label,
		});
	}
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
	async title() {
		return window.__TAURI_INVOKE__("plugin:window|title", {
			label: this.label,
		});
	}
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
	async theme() {
		return window.__TAURI_INVOKE__("plugin:window|theme", {
			label: this.label,
		});
	}
	// Setters
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
	async center() {
		return window.__TAURI_INVOKE__("plugin:window|center", {
			label: this.label,
		});
	}
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
	async requestUserAttention(requestType) {
		let requestType_ = null;
		if (requestType) {
			if (requestType === UserAttentionType.Critical) {
				requestType_ = { type: "Critical" };
			} else {
				requestType_ = { type: "Informational" };
			}
		}
		return window.__TAURI_INVOKE__("plugin:window|request_user_attention", {
			label: this.label,
			value: requestType_,
		});
	}
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
	async setResizable(resizable) {
		return window.__TAURI_INVOKE__("plugin:window|set_resizable", {
			label: this.label,
			value: resizable,
		});
	}
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
	async setMaximizable(maximizable) {
		return window.__TAURI_INVOKE__("plugin:window|set_maximizable", {
			label: this.label,
			value: maximizable,
		});
	}
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
	async setMinimizable(minimizable) {
		return window.__TAURI_INVOKE__("plugin:window|set_minimizable", {
			label: this.label,
			value: minimizable,
		});
	}
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
	async setClosable(closable) {
		return window.__TAURI_INVOKE__("plugin:window|set_closable", {
			label: this.label,
			value: closable,
		});
	}
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
	async setTitle(title) {
		return window.__TAURI_INVOKE__("plugin:window|set_title", {
			label: this.label,
			value: title,
		});
	}
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
	async maximize() {
		return window.__TAURI_INVOKE__("plugin:window|maximize", {
			label: this.label,
		});
	}
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
	async unmaximize() {
		return window.__TAURI_INVOKE__("plugin:window|unmaximize", {
			label: this.label,
		});
	}
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
	async toggleMaximize() {
		return window.__TAURI_INVOKE__("plugin:window|toggle_maximize", {
			label: this.label,
		});
	}
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
	async minimize() {
		return window.__TAURI_INVOKE__("plugin:window|minimize", {
			label: this.label,
		});
	}
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
	async unminimize() {
		return window.__TAURI_INVOKE__("plugin:window|unminimize", {
			label: this.label,
		});
	}
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
	async show() {
		return window.__TAURI_INVOKE__("plugin:window|show", {
			label: this.label,
		});
	}
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
	async hide() {
		return window.__TAURI_INVOKE__("plugin:window|hide", {
			label: this.label,
		});
	}
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
	async close() {
		return window.__TAURI_INVOKE__("plugin:window|close", {
			label: this.label,
		});
	}
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
	async setDecorations(decorations) {
		return window.__TAURI_INVOKE__("plugin:window|set_decorations", {
			label: this.label,
			value: decorations,
		});
	}
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
	async setShadow(enable) {
		return window.__TAURI_INVOKE__("plugin:window|set_shadow", {
			label: this.label,
			value: enable,
		});
	}
	/**
	 * Set window effects.
	 *
	 * @since 2.0
	 */
	async setEffects(effects) {
		return window.__TAURI_INVOKE__("plugin:window|set_effects", {
			label: this.label,
			value: effects,
		});
	}
	/**
	 * Clear any applied effects if possible.
	 *
	 * @since 2.0
	 */
	async clearEffects() {
		return window.__TAURI_INVOKE__("plugin:window|set_effects", {
			label: this.label,
			value: null,
		});
	}
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
	async setAlwaysOnTop(alwaysOnTop) {
		return window.__TAURI_INVOKE__("plugin:window|set_always_on_top", {
			label: this.label,
			value: alwaysOnTop,
		});
	}
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
	async setContentProtected(protected_) {
		return window.__TAURI_INVOKE__("plugin:window|set_content_protected", {
			label: this.label,
			value: protected_,
		});
	}
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
	async setSize(size) {
		if (!size || (size.type !== "Logical" && size.type !== "Physical")) {
			throw new Error(
				"the `size` argument must be either a LogicalSize or a PhysicalSize instance",
			);
		}
		return window.__TAURI_INVOKE__("plugin:window|set_size", {
			label: this.label,
			value: {
				type: size.type,
				data: {
					width: size.width,
					height: size.height,
				},
			},
		});
	}
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
	async setMinSize(size) {
		if (size && size.type !== "Logical" && size.type !== "Physical") {
			throw new Error(
				"the `size` argument must be either a LogicalSize or a PhysicalSize instance",
			);
		}
		return window.__TAURI_INVOKE__("plugin:window|set_min_size", {
			label: this.label,
			value: size
				? {
						type: size.type,
						data: {
							width: size.width,
							height: size.height,
						},
					}
				: null,
		});
	}
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
	async setMaxSize(size) {
		if (size && size.type !== "Logical" && size.type !== "Physical") {
			throw new Error(
				"the `size` argument must be either a LogicalSize or a PhysicalSize instance",
			);
		}
		return window.__TAURI_INVOKE__("plugin:window|set_max_size", {
			label: this.label,
			value: size
				? {
						type: size.type,
						data: {
							width: size.width,
							height: size.height,
						},
					}
				: null,
		});
	}
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
	async setPosition(position) {
		if (
			!position ||
			(position.type !== "Logical" && position.type !== "Physical")
		) {
			throw new Error(
				"the `position` argument must be either a LogicalPosition or a PhysicalPosition instance",
			);
		}
		return window.__TAURI_INVOKE__("plugin:window|set_position", {
			label: this.label,
			value: {
				type: position.type,
				data: {
					x: position.x,
					y: position.y,
				},
			},
		});
	}
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
	async setFullscreen(fullscreen) {
		return window.__TAURI_INVOKE__("plugin:window|set_fullscreen", {
			label: this.label,
			value: fullscreen,
		});
	}
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
	async setFocus() {
		return window.__TAURI_INVOKE__("plugin:window|set_focus", {
			label: this.label,
		});
	}
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
	async setIcon(icon) {
		return window.__TAURI_INVOKE__("plugin:window|set_icon", {
			label: this.label,
			value: typeof icon === "string" ? icon : Array.from(icon),
		});
	}
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
	async setSkipTaskbar(skip) {
		return window.__TAURI_INVOKE__("plugin:window|set_skip_taskbar", {
			label: this.label,
			value: skip,
		});
	}
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
	async setCursorGrab(grab) {
		return window.__TAURI_INVOKE__("plugin:window|set_cursor_grab", {
			label: this.label,
			value: grab,
		});
	}
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
	async setCursorVisible(visible) {
		return window.__TAURI_INVOKE__("plugin:window|set_cursor_visible", {
			label: this.label,
			value: visible,
		});
	}
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
	async setCursorIcon(icon) {
		return window.__TAURI_INVOKE__("plugin:window|set_cursor_icon", {
			label: this.label,
			value: icon,
		});
	}
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
	async setCursorPosition(position) {
		if (
			!position ||
			(position.type !== "Logical" && position.type !== "Physical")
		) {
			throw new Error(
				"the `position` argument must be either a LogicalPosition or a PhysicalPosition instance",
			);
		}
		return window.__TAURI_INVOKE__("plugin:window|set_cursor_position", {
			label: this.label,
			value: {
				type: position.type,
				data: {
					x: position.x,
					y: position.y,
				},
			},
		});
	}
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
	async setIgnoreCursorEvents(ignore) {
		return window.__TAURI_INVOKE__(
			"plugin:window|set_ignore_cursor_events",
			{
				label: this.label,
				value: ignore,
			},
		);
	}
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
	async startDragging() {
		return window.__TAURI_INVOKE__("plugin:window|start_dragging", {
			label: this.label,
		});
	}
	// Listeners
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
	async onResized(handler) {
		return this.listen(TauriEvent.WINDOW_RESIZED, (e) => {
			e.payload = mapPhysicalSize(e.payload);
			handler(e);
		});
	}
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
	async onMoved(handler) {
		return this.listen(TauriEvent.WINDOW_MOVED, (e) => {
			e.payload = mapPhysicalPosition(e.payload);
			handler(e);
		});
	}
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
	/* eslint-disable @typescript-eslint/promise-function-async */
	async onCloseRequested(handler) {
		return this.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, (event) => {
			const evt = new CloseRequestedEvent(event);
			void Promise.resolve(handler(evt)).then(() => {
				if (!evt.isPreventDefault()) {
					return this.close();
				}
			});
		});
	}
	/* eslint-enable */
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
	async onFocusChanged(handler) {
		const unlistenFocus = await this.listen(
			TauriEvent.WINDOW_FOCUS,
			(event) => {
				handler({ ...event, payload: true });
			},
		);
		const unlistenBlur = await this.listen(
			TauriEvent.WINDOW_BLUR,
			(event) => {
				handler({ ...event, payload: false });
			},
		);
		return () => {
			unlistenFocus();
			unlistenBlur();
		};
	}
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
	async onScaleChanged(handler) {
		return this.listen(TauriEvent.WINDOW_SCALE_FACTOR_CHANGED, handler);
	}
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
	async onMenuClicked(handler) {
		return this.listen(TauriEvent.MENU, handler);
	}
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
	async onFileDropEvent(handler) {
		const unlistenFileDrop = await this.listen(
			TauriEvent.WINDOW_FILE_DROP,
			(event) => {
				handler({
					...event,
					payload: { type: "drop", paths: event.payload },
				});
			},
		);
		const unlistenFileHover = await this.listen(
			TauriEvent.WINDOW_FILE_DROP_HOVER,
			(event) => {
				handler({
					...event,
					payload: { type: "hover", paths: event.payload },
				});
			},
		);
		const unlistenCancel = await this.listen(
			TauriEvent.WINDOW_FILE_DROP_CANCELLED,
			(event) => {
				handler({ ...event, payload: { type: "cancel" } });
			},
		);
		return () => {
			unlistenFileDrop();
			unlistenFileHover();
			unlistenCancel();
		};
	}
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
	async onThemeChanged(handler) {
		return this.listen(TauriEvent.WINDOW_THEME_CHANGED, handler);
	}
}
/**
 * Platform-specific window effects
 *
 * @since 2.0
 */
var Effect;
(function (Effect) {
	/**
	 * A default material appropriate for the view's effectiveAppearance.  **macOS 10.14-**
	 *
	 * @deprecated since macOS 10.14. You should instead choose an appropriate semantic material.
	 */
	Effect["AppearanceBased"] = "appearanceBased";
	/**
	 *  **macOS 10.14-**
	 *
	 * @deprecated since macOS 10.14. Use a semantic material instead.
	 */
	Effect["Light"] = "light";
	/**
	 *  **macOS 10.14-**
	 *
	 * @deprecated since macOS 10.14. Use a semantic material instead.
	 */
	Effect["Dark"] = "dark";
	/**
	 *  **macOS 10.14-**
	 *
	 * @deprecated since macOS 10.14. Use a semantic material instead.
	 */
	Effect["MediumLight"] = "mediumLight";
	/**
	 *  **macOS 10.14-**
	 *
	 * @deprecated since macOS 10.14. Use a semantic material instead.
	 */
	Effect["UltraDark"] = "ultraDark";
	/**
	 *  **macOS 10.10+**
	 */
	Effect["Titlebar"] = "titlebar";
	/**
	 *  **macOS 10.10+**
	 */
	Effect["Selection"] = "selection";
	/**
	 *  **macOS 10.11+**
	 */
	Effect["Menu"] = "menu";
	/**
	 *  **macOS 10.11+**
	 */
	Effect["Popover"] = "popover";
	/**
	 *  **macOS 10.11+**
	 */
	Effect["Sidebar"] = "sidebar";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["HeaderView"] = "headerView";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["Sheet"] = "sheet";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["WindowBackground"] = "windowBackground";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["HudWindow"] = "hudWindow";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["FullScreenUI"] = "fullScreenUI";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["Tooltip"] = "tooltip";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["ContentBackground"] = "contentBackground";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["UnderWindowBackground"] = "underWindowBackground";
	/**
	 *  **macOS 10.14+**
	 */
	Effect["UnderPageBackground"] = "underPageBackground";
	/**
	 *  **Windows 11 Only**
	 */
	Effect["Mica"] = "mica";
	/**
	 * **Windows 7/10/11(22H1) Only**
	 *
	 * ## Notes
	 *
	 * This effect has bad performance when resizing/dragging the window on Windows 11 build 22621.
	 */
	Effect["Blur"] = "blur";
	/**
	 * **Windows 10/11**
	 *
	 * ## Notes
	 *
	 * This effect has bad performance when resizing/dragging the window on Windows 10 v1903+ and Windows 11 build 22000.
	 */
	Effect["Acrylic"] = "acrylic";
})(Effect || (Effect = {}));
/**
 * Window effect state **macOS only**
 *
 * @see https://developer.apple.com/documentation/appkit/nsvisualeffectview/state
 *
 * @since 2.0
 */
var EffectState;
(function (EffectState) {
	/**
	 *  Make window effect state follow the window's active state **macOS only**
	 */
	EffectState["FollowsWindowActiveState"] = "followsWindowActiveState";
	/**
	 *  Make window effect state always active **macOS only**
	 */
	EffectState["Active"] = "active";
	/**
	 *  Make window effect state always inactive **macOS only**
	 */
	EffectState["Inactive"] = "inactive";
})(EffectState || (EffectState = {}));
function mapMonitor(m) {
	return m === null
		? null
		: {
				name: m.name,
				scaleFactor: m.scaleFactor,
				position: mapPhysicalPosition(m.position),
				size: mapPhysicalSize(m.size),
			};
}
function mapPhysicalPosition(m) {
	return new PhysicalPosition(m.x, m.y);
}
function mapPhysicalSize(m) {
	return new PhysicalSize(m.width, m.height);
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
async function currentMonitor() {
	return window
		.__TAURI_INVOKE__("plugin:window|current_monitor")
		.then(mapMonitor);
}
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
async function primaryMonitor() {
	return window
		.__TAURI_INVOKE__("plugin:window|primary_monitor")
		.then(mapMonitor);
}
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
async function availableMonitors() {
	return window
		.__TAURI_INVOKE__("plugin:window|available_monitors")
		.then((ms) => ms.map(mapMonitor));
}

export {
	CloseRequestedEvent,
	Effect,
	EffectState,
	LogicalPosition,
	LogicalSize,
	PhysicalPosition,
	PhysicalSize,
	UserAttentionType,
	Window,
	availableMonitors,
	currentMonitor,
	getAll,
	getCurrent,
	primaryMonitor,
};
//# sourceMappingURL=index.mjs.map
