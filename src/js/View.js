class View {
	_overlay = document.querySelector('.overlay');

	constructor() {
		this._handleOverlay();
	}
	_handleOverlay() {
		const handleObserver = entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const observeVal = +entry.target.dataset.observeVal;

					const width = observeVal ? 100 / observeVal : 0;
					this._overlay.style.width = `${width}%`;
				}
			});
		};

		const observer = new IntersectionObserver(handleObserver, { threshold: 0.8 });
		const elementsToObserve = document.querySelectorAll('[data-observe=""]');
		elementsToObserve.forEach(el => observer.observe(el));
	}
}

export default new View();
