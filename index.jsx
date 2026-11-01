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

if (window.KoBarExtensions && window.KoBarExtensions.registerInlineWidget) {
    window.KoBarExtensions.registerInlineWidget('pin-window-to-top', {
        id: 'pin-window-to-top',
        render: () => window.React.createElement(PinWindowWidget)
    });
}
