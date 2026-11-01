const { useState, useEffect } = window.React;

// Canlı hosts load Material Symbols Rounded; older hosts fall back to Outlined.
const ICON_FONT = { fontFamily: "'Material Symbols Rounded', 'Material Symbols Outlined'", fontVariationSettings: "'FILL' 0, 'wght' 400" };

const TooltipButton = ({ children, className, style, onClick, onDoubleClick, title }) => {
    const internalRef = window.React.useRef(null);
    const [visible, setVisible] = window.React.useState(false);
    const [pos, setPos] = window.React.useState({ x: 0, y: 0, edgePosition: 'left' });

    const handleMouseEnter = () => {
        if (internalRef.current) {
            const rect = internalRef.current.getBoundingClientRect();
            const edgePosition = window.useAppStore?.getState().edgePosition || 'left';
            const x = edgePosition === 'left' ? rect.left - 8 : rect.right + 8;
            const y = rect.top + rect.height / 2;
            setPos({ x, y, edgePosition });
        }
        setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);

    return (
        <>
            <button
                ref={internalRef}
                className={`group relative flex items-center justify-center outline-none ${className || ''}`}
                style={style}
                onClick={(e) => {
                    setVisible(false);
                    if (onClick) onClick(e);
                }}
                onDoubleClick={onDoubleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </button>
            {visible && title && window.ReactDOM && window.ReactDOM.createPortal(
                <div
                    className="fixed pointer-events-none whitespace-nowrap border py-1.5 px-3 text-xs font-semibold text-primary"
                    style={{
                        zIndex: 999999,
                        backgroundColor: 'var(--kb-bg-surface, var(--theme-bg-base))',
                        borderColor: 'var(--kb-stroke-subtle, var(--theme-border))',
                        borderRadius: 'var(--kb-radius-md, 12px)',
                        boxShadow: 'var(--kb-shadow-e3, 0 4px 12px rgba(0,0,0,0.3))',
                        top: pos.y,
                        left: pos.edgePosition === 'left' ? pos.x - 4 : pos.x,
                        transform: pos.edgePosition === 'left' ? 'translate(-100%, -50%)' : 'translate(0%, -50%)',
                    }}
                >
                    {title}
                </div>,
                document.body
            )}
        </>
    );
};

const PinWindowWidget = () => {
    const [isTargetingMode, setIsTargetingMode] = useState(false);
    const [pinnedWindowHwnd, setPinnedWindowHwnd] = useState(null);

    useEffect(() => {
        let cleanupChanged = () => {};
        if (window.api && window.api.onPinnedWindowChanged) {
            cleanupChanged = window.api.onPinnedWindowChanged((hwnd) => {
                setPinnedWindowHwnd(hwnd);
            });
        }
        
        let cleanupTargeting = () => {};
        if (window.api && window.api.onPinTargetingComplete) {
            cleanupTargeting = window.api.onPinTargetingComplete(() => {
                setIsTargetingMode(false);
            });
        }

        return () => {
            cleanupChanged();
            cleanupTargeting();
        };
    }, []);

    const handleClick = (e) => {
        if (e.currentTarget._skipClick) return;

        if (pinnedWindowHwnd) {
            if (window.api && window.api.unpinCurrentWindow) {
                window.api.unpinCurrentWindow();
            }
            return;
        }

        if (!isTargetingMode) {
            setIsTargetingMode(true);
            if (window.api && window.api.enterPinTargetingMode) {
                window.api.enterPinTargetingMode();
            }
        } else {
            setIsTargetingMode(false);
        }
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        const target = e.currentTarget;
        target._skipClick = true;
        setTimeout(() => target._skipClick = false, 300);

        setIsTargetingMode(false);
        if (window.api && window.api.unpinAll) {
            window.api.unpinAll();
        }
    };

    // R2-01: no fill, glow or ring behind the icon in any state; the state shows in the icon and the tooltip only.
    const btnClass = 'flex items-center justify-center transition-colors text-slate-400 hover:text-white hover:bg-white/10';
    const btnStyle = { width: 'var(--kb-bar-item, 36px)', height: 'var(--kb-bar-item, 36px)', borderRadius: 'var(--kb-radius-md, 12px)' };
    const iconName = pinnedWindowHwnd ? 'bookmark_remove' : 'push_pin';
    const tooltip = pinnedWindowHwnd ? 'Unpin Window' : 'Pin to Top';

    return (
        <TooltipButton
            title={tooltip}
            className={btnClass}
            style={btnStyle}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
        >
            <span className="material-symbols-outlined" style={{ fontSize: 'var(--kb-bar-icon, 20px)', ...ICON_FONT }}>{iconName}</span>
        </TooltipButton>
    );
};

// ---------------------------------------------------------------------------------------------------------------------
// Canli: sidebar button + panel (KoBar with the bar tile API). Old hosts keep the inline widget above, unchanged.
// The panel only presents the same host calls as the inline widget: enterPinTargetingMode, unpinCurrentWindow, unpinAll,
// onPinnedWindowChanged, onPinTargetingComplete (+ the host's get/setPinBorderStyle).
// ---------------------------------------------------------------------------------------------------------------------

const BTN_ID = 'pin-window-to-top';
const PANEL_ID = 'pin-window-to-top-panel';

const STRINGS = {
    en: {
        title: 'Pin to top', close: 'Close',
        subIdle: 'No window pinned', subPinned: 'One window pinned', subWaiting: 'Waiting for your click',
        heroIdle: 'Keep a window above the rest', heroIdleDesc: 'Pick any open window and it stays on top until you unpin it.',
        heroWaiting: 'Click the window to pin', heroWaitingDesc: 'Switch to the window you want. KoBar pins it as soon as it is in front.',
        heroPinned: 'Window pinned', heroPinnedDesc: 'It stays above other windows and has a coloured border.',
        pick: 'Pick a window', waiting: 'Waiting for a click', stopWaiting: 'Stop waiting', unpin: 'Unpin window', unpinAll: 'Unpin all',
        border: 'Border', borderDesc: 'Drawn around the pinned window.', colour: 'Border colour', width: 'Width', custom: 'Custom colour',
        tipIdle: 'Pin to top', tipPinned: 'Pin to top: a window is pinned', tipWaiting: 'Pin to top: click the window to pin',
        cyan: 'Cyan', green: 'Green', magenta: 'Magenta', amber: 'Amber', red: 'Red', white: 'White'
    },
    tr: {
        title: 'Üstte tut', close: 'Kapat',
        subIdle: 'Sabitlenmiş pencere yok', subPinned: 'Bir pencere sabit', subWaiting: 'Tıklamanız bekleniyor',
        heroIdle: 'Bir pencereyi hep üstte tut', heroIdleDesc: 'Açık bir pencere seçin; siz kaldırana kadar üstte kalır.',
        heroWaiting: 'Sabitlenecek pencereye tıklayın', heroWaitingDesc: 'İstediğiniz pencereye geçin. Öne gelir gelmez KoBar onu sabitler.',
        heroPinned: 'Pencere sabit', heroPinnedDesc: 'Diğer pencerelerin üstünde kalır ve renkli bir çerçevesi olur.',
        pick: 'Pencere seç', waiting: 'Tıklama bekleniyor', stopWaiting: 'Beklemeyi bırak', unpin: 'Sabitlemeyi kaldır', unpinAll: 'Hepsini kaldır',
        border: 'Çerçeve', borderDesc: 'Sabitlenen pencerenin çevresine çizilir.', colour: 'Çerçeve rengi', width: 'Kalınlık', custom: 'Özel renk',
        tipIdle: 'Üstte tut', tipPinned: 'Üstte tut: bir pencere sabit', tipWaiting: 'Üstte tut: sabitlenecek pencereye tıklayın',
        cyan: 'Camgöbeği', green: 'Yeşil', magenta: 'Eflatun', amber: 'Kehribar', red: 'Kırmızı', white: 'Beyaz'
    }
};
const tr = (key) => {
    const lang = (window.useAppStore && window.useAppStore.getState && window.useAppStore.getState().language) || 'en';
    return (STRINGS[lang] || STRINGS.en)[key] || STRINGS.en[key] || key;
};

// Plain module state shared by the bar tile and the panel (lives as long as the bar).
const pinState = { targeting: false, hwnd: null, style: { color: '#00E5FF', width: 2 } };
const pinListeners = new Set();
const pinSet = (patch) => {
    Object.assign(pinState, patch);
    pinListeners.forEach((l) => l());
};
const usePinState = () => {
    const [, force] = useState(0);
    useEffect(() => {
        const l = () => force((n) => n + 1);
        pinListeners.add(l);
        return () => { pinListeners.delete(l); };
    }, []);
    return pinState;
};

const SWATCHES = [
    { key: 'cyan', color: '#00E5FF' }, { key: 'green', color: '#39FF14' }, { key: 'magenta', color: '#FF2BD6' },
    { key: 'amber', color: '#FFB300' }, { key: 'red', color: '#FF4D4D' }, { key: 'white', color: '#FFFFFF' }
];
const WIDTHS = [1, 2, 3, 4];

const startTargeting = () => {
    if (pinState.hwnd || pinState.targeting) return;
    pinSet({ targeting: true });
    if (window.api && window.api.enterPinTargetingMode) window.api.enterPinTargetingMode();
};
const stopWaiting = () => pinSet({ targeting: false });
const unpinWindow = () => {
    if (window.api && window.api.unpinCurrentWindow) window.api.unpinCurrentWindow();
};
const unpinEverything = () => {
    pinSet({ targeting: false });
    if (window.api && window.api.unpinAll) window.api.unpinAll();
};
const applyBorderStyle = (next) => {
    const prev = pinState.style;
    pinSet({ style: next });
    try {
        const res = window.api && window.api.setPinBorderStyle && window.api.setPinBorderStyle(next);
        if (res && typeof res.then === 'function') {
            res.then((r) => { if (r && r.success === false) pinSet({ style: prev }); }).catch(() => pinSet({ style: prev }));
        }
    } catch (e) { pinSet({ style: prev }); }
};

// --- Bar item (label template; a dot while a window is pinned) ---
const pushBarState = () => {
    const ext = window.KoBarExtensions;
    if (!ext || typeof ext.setBarItemState !== 'function') return;
    try {
        const pinned = !!pinState.hwnd;
        ext.setBarItemState(BTN_ID, {
            label: pinned ? tr('tipPinned') : pinState.targeting ? tr('tipWaiting') : tr('tipIdle'),
            badge: pinned ? 'dot' : 0,
            tone: pinState.targeting ? 'attention' : 'default'
        });
    } catch (e) { /* tile API is optional */ }
};

const startTileSubscriptions = () => {
    if (window.api && window.api.onPinnedWindowChanged) {
        window.api.onPinnedWindowChanged((hwnd) => pinSet({ hwnd: hwnd || null, targeting: false }));
    }
    if (window.api && window.api.onPinTargetingComplete) {
        window.api.onPinTargetingComplete(() => pinSet({ targeting: false }));
    }
    pinListeners.add(pushBarState);
    if (window.useAppStore && window.useAppStore.subscribe) {
        window.useAppStore.subscribe((s, prev) => { if (s.language !== prev.language) pushBarState(); });
    }
    pushBarState();
};

// --- Panel ---
const T = {
    shell: 'var(--kb-bg-shell, var(--theme-bg-dark, #161922))',
    surface: 'var(--kb-bg-surface, var(--theme-bg-base, #1d212b))',
    inset: 'var(--kb-bg-inset, rgba(0,0,0,.25))',
    container: 'var(--kb-bg-container, rgba(255,255,255,.1))',
    onContainer: 'var(--kb-on-container, #fff)',
    accent: 'var(--kb-accent, var(--theme-accent, #7c9cff))',
    accentText: 'var(--kb-accent-text, var(--kb-accent, #7c9cff))',
    onAccent: 'var(--kb-on-accent, #fff)',
    fg1: 'var(--kb-fg-1, #fff)', fg2: 'var(--kb-fg-2, #aab)',
    stroke: 'var(--kb-stroke-subtle, rgba(255,255,255,.12))'
};
const Icon = ({ name, size = 20, fill = 0, style }) => (
    <span className="material-symbols-outlined" aria-hidden="true" style={{ ...ICON_FONT, fontSize: size, fontVariationSettings: `'FILL' ${fill}, 'wght' 400`, lineHeight: 1, ...style }}>{name}</span>
);

const PANEL_CSS = `
.pwt-panel button { font-family: inherit; cursor: pointer; border: 0; }
.pwt-panel button:focus-visible, .pwt-panel label:focus-within { outline: 2px solid var(--kb-accent, #7c9cff); outline-offset: 2px; }
.pwt-panel button:disabled { cursor: default; }
`;

const pillBtn = (variant) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, width: '100%', borderRadius: 999,
    fontSize: 15, fontWeight: 600,
    ...(variant === 'filled' ? { background: T.accent, color: T.onAccent } : { background: T.container, color: T.onContainer })
});

const PinPanel = ({ onClose, anchorRect }) => {
    const pin = usePinState();
    const popupRef = window.React.useRef(null);
    const primaryRef = window.React.useRef(null);
    window.useAppStore((s) => s.language);
    const edgePosition = window.useAppStore((s) => s.edgePosition);
    const orientation = window.useAppStore((s) => s.orientation);
    const screenBounds = window.useAppStore((s) => s.screenBounds);
    const sidebarPosition = window.useAppStore((s) => s.sidebarPosition);
    const smart = window.useAppStore((s) => s.isPopupSmartPositioning);

    // The host owns the border file; read it once when the panel opens.
    useEffect(() => {
        let alive = true;
        try {
            const p = window.api && window.api.getPinBorderStyle && window.api.getPinBorderStyle();
            if (p && typeof p.then === 'function') {
                p.then((st) => {
                    if (alive && st && typeof st.color === 'string' && Number.isInteger(st.width)) pinSet({ style: { color: st.color.toUpperCase(), width: st.width } });
                }).catch(() => {});
            }
        } catch (e) { /* host without border style */ }
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    useEffect(() => {
        const h = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onClose]);

    useEffect(() => { if (primaryRef.current) primaryRef.current.focus({ preventScroll: true }); }, [pin.hwnd, pin.targeting]);

    const W = 320;
    const H = 560;
    const place = (offX, offY) => {
        const sbX = ((screenBounds && screenBounds.x) || 0) - window.screenX;
        const sbY = ((screenBounds && screenBounds.y) || 0) - window.screenY;
        if (orientation === 'horizontal') {
            const sw = (screenBounds && screenBounds.width) || 1200;
            const left = (anchorRect.left - offX) + (anchorRect.width / 2) - (W / 2);
            return Math.min(Math.max(left, sbX - offX + 20), sbX + (sw - offX) - W - 20);
        }
        const sh = (screenBounds && screenBounds.height) || 800;
        const top = (anchorRect.top - offY) - 20 + (anchorRect.height / 2) - (H / 2);
        return Math.min(Math.max(top, sbY - offY + 20), sbY + (sh - offY) - H - 20);
    };
    const smartRef = window.React.useRef(smart);
    useEffect(() => { smartRef.current = smart; }, [smart]);
    useEffect(() => {
        const onDrag = (e) => {
            if (!popupRef.current || !anchorRect || !smartRef.current) return;
            const v = place(e.detail.x, e.detail.y);
            if (orientation === 'horizontal') popupRef.current.style.left = `${v}px`;
            else popupRef.current.style.top = `${v}px`;
        };
        document.addEventListener('kobar-drag', onDrag);
        return () => document.removeEventListener('kobar-drag', onDrag);
    }, [anchorRect, screenBounds, orientation]);

    const popupStyle = () => {
        if (!anchorRect) return { display: 'none' };
        const style = { position: 'absolute', zIndex: 99999 };
        const offX = sidebarPosition ? sidebarPosition.x : 0;
        const offY = sidebarPosition ? sidebarPosition.y : 0;
        if (orientation === 'horizontal') {
            if (!smart) { style.left = '50%'; style.transform = 'translateX(-50%)'; } else style.left = place(offX, offY);
            if (edgePosition === 'top') { style.top = '100%'; style.marginTop = '12px'; } else { style.bottom = '100%'; style.marginBottom = '12px'; }
        } else {
            if (!smart) { style.top = '50%'; style.transform = 'translateY(-50%)'; } else style.top = place(offX, offY);
            if (edgePosition === 'left') { style.left = '100%'; style.marginLeft = '12px'; } else { style.right = '100%'; style.marginRight = '12px'; }
        }
        return style;
    };

    const pinned = !!pin.hwnd;
    const waiting = !pinned && pin.targeting;
    const sub = pinned ? tr('subPinned') : waiting ? tr('subWaiting') : tr('subIdle');
    const hero = pinned ? [tr('heroPinned'), tr('heroPinnedDesc'), 'push_pin'] : waiting ? [tr('heroWaiting'), tr('heroWaitingDesc'), 'ads_click'] : [tr('heroIdle'), tr('heroIdleDesc'), 'push_pin'];
    const isPreset = SWATCHES.some((s) => s.color === pin.style.color);

    return (
        <div ref={popupRef} className="pwt-panel pointer-events-auto flex flex-col no-drag-region" style={{
            ...popupStyle(), boxSizing: 'border-box', width: W, padding: 20, gap: 16, borderRadius: 32, background: T.shell,
            border: `1px solid ${T.stroke}`, boxShadow: 'var(--kb-shadow-e3, 0 12px 32px rgba(0,0,0,.45))', color: T.fg1
        }}>
            <style>{PANEL_CSS}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 16, background: T.container, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="push_pin" size={24} fill={1} style={{ color: T.accentText }} />
                </div>
                <div className="drag-region" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--kb-font-display, inherit)', fontSize: 19, fontWeight: 600, lineHeight: '24px' }}>{tr('title')}</div>
                    <div style={{ fontSize: 12, lineHeight: '16px', color: T.fg2 }}>{sub}</div>
                </div>
                <button type="button" onClick={onClose} aria-label={tr('close')} title={tr('close')} style={{ width: 36, height: 36, borderRadius: 18, background: T.container, color: T.onContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="close" />
                </button>
            </div>

            <div style={{ background: T.surface, borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 24, background: T.container, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: pinned ? `inset 0 0 0 ${pin.style.width}px ${pin.style.color}` : 'none' }}>
                    <Icon name={hero[2]} size={32} fill={pinned ? 1 : 0} style={{ color: T.accentText }} />
                </div>
                <div style={{ fontFamily: 'var(--kb-font-display, inherit)', fontSize: 17, fontWeight: 600 }}>{hero[0]}</div>
                <div style={{ fontSize: 13, color: T.fg2, lineHeight: '20px', marginBottom: 16 }}>{hero[1]}</div>
                {pinned ? (
                    <button ref={primaryRef} type="button" onClick={unpinWindow} style={pillBtn('filled')}>
                        <Icon name="keep_off" />{tr('unpin')}
                    </button>
                ) : waiting ? (
                    <>
                        <button type="button" disabled style={{ ...pillBtn('tonal'), opacity: 0.8 }}>
                            <Icon name="ads_click" />{tr('waiting')}
                        </button>
                        <button ref={primaryRef} type="button" onClick={stopWaiting} style={{ height: 36, padding: '0 16px', borderRadius: 999, background: 'transparent', color: T.fg2, fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                            {tr('stopWaiting')}
                        </button>
                    </>
                ) : (
                    <button ref={primaryRef} type="button" onClick={startTargeting} style={pillBtn('filled')}>
                        <Icon name="ads_click" />{tr('pick')}
                    </button>
                )}
            </div>

            <div style={{ background: T.surface, borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{tr('border')}</div>
                        <div style={{ fontSize: 12, color: T.fg2 }}>{tr('borderDesc')}</div>
                    </div>
                    <div aria-hidden="true" style={{ width: 56, height: 40, borderRadius: 8, background: T.inset, boxSizing: 'border-box', border: `${pin.style.width}px solid ${pin.style.color}` }} />
                </div>
                <div role="radiogroup" aria-label={tr('colour')} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {SWATCHES.map((s) => {
                        const on = s.color === pin.style.color;
                        return (
                            <button key={s.key} type="button" role="radio" aria-checked={on} aria-label={tr(s.key)} title={tr(s.key)}
                                onClick={() => applyBorderStyle({ color: s.color, width: pin.style.width })}
                                style={{ width: 40, height: 40, borderRadius: 20, padding: 4, boxSizing: 'border-box', background: 'transparent', boxShadow: `inset 0 0 0 2px ${on ? T.fg1 : 'transparent'}`, display: 'flex' }}>
                                <span style={{ flex: 1, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.25)' }}>
                                    {on && <Icon name="check" size={16} style={{ color: '#101218' }} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div role="radiogroup" aria-label={tr('width')} style={{ flex: 1, display: 'flex', gap: 4, padding: 4, borderRadius: 16, background: T.inset }}>
                        {WIDTHS.map((w) => {
                            const on = w === pin.style.width;
                            return (
                                <button key={w} type="button" role="radio" aria-checked={on} onClick={() => applyBorderStyle({ color: pin.style.color, width: w })}
                                    style={{ flex: 1, height: 36, borderRadius: 12, fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', background: on ? T.container : 'transparent', color: on ? T.onContainer : T.fg2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    {on && <Icon name="check" size={16} style={{ color: T.accentText }} />}{w}
                                </button>
                            );
                        })}
                    </div>
                    <label title={tr('custom')} style={{ position: 'relative', width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: isPreset ? T.container : pin.style.color, color: isPreset ? T.onContainer : '#101218', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Icon name="palette" />
                        <input type="color" aria-label={tr('custom')} value={pin.style.color.toLowerCase()}
                            onChange={(e) => applyBorderStyle({ color: e.target.value.toUpperCase(), width: pin.style.width })}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    </label>
                </div>
            </div>

            <button type="button" onClick={unpinEverything} style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 16px', borderRadius: 999, background: 'transparent', color: T.fg2, fontSize: 13, fontWeight: 600 }}>
                <Icon name="layers_clear" size={18} />{tr('unpinAll')}
            </button>
        </div>
    );
};

const HAS_TILE_API = !!window.KoBarExtensions && typeof window.KoBarExtensions.setBarItemState === 'function' && typeof window.KoBarExtensions.registerSidebarButton === 'function';

if (HAS_TILE_API) {
    // Same id as the inline widget, so a saved bar position is kept.
    window.KoBarExtensions.registerSidebarButton({
        id: BTN_ID,
        icon: 'push_pin',
        label: tr('title'),
        onClick: (e, anchorRect) => {
            const st = window.useAppStore.getState();
            const isOpen = st.activeExtensionPanelId === PANEL_ID;
            if (st.closeAllUtilityPopups) st.closeAllUtilityPopups();
            if (isOpen) window.useAppStore.setState({ activeExtensionPanelId: null, activeExtensionAnchorRect: null });
            else window.useAppStore.setState({ activeExtensionPanelId: PANEL_ID, activeExtensionAnchorRect: anchorRect });
        }
    });
    window.KoBarExtensions.registerPanel(PANEL_ID, {
        id: PANEL_ID,
        render: (props) => window.React.createElement(PinPanel, props)
    });
    startTileSubscriptions();
} else if (window.KoBarExtensions && window.KoBarExtensions.registerInlineWidget) {
    window.KoBarExtensions.registerInlineWidget('pin-window-to-top', {
        id: 'pin-window-to-top',
        render: () => window.React.createElement(PinWindowWidget)
    });
}
