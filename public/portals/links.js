// A click the browser will open in a new tab or window: leave it alone.
export const isNewTabClick = (e) => e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
