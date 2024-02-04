export const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
export let pixelRatio = Math.min(window.devicePixelRatio, 2);
export const resize = () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	pixelRatio = Math.min(window.devicePixelRatio, 2);
};
