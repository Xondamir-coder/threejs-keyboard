import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons';
import GUI from 'lil-gui';
import * as utils from './utils';
import modelUrl from '../assets/keyboard.glb?url';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class Three {
	_canvas = document.querySelector('.canvas');
	_scene = new THREE.Scene();
	_clock = new THREE.Clock();
	_time = {
		elapsed: 0,
		delta: 16,
		previous: Date.now(),
	};

	constructor() {
		this._setGUI();
		this._setLoaders();
		this._setMaterials();
		this._setCamera();
		this._setRenderer();
		this._setModel();
		this._setController();

		this._tick();
		this.addHandlerResize();
	}
	_setCamera() {
		this._camera = new THREE.PerspectiveCamera(
			75,
			utils.sizes.width / utils.sizes.height,
			0.1,
			100
		);
		this._camera.position.y = 2.5;
		this._camera.position.z = 3.2;
		this._scene.add(this._camera);
	}
	_setRenderer() {
		this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas, antialias: true });
		this._renderer.setSize(utils.sizes.width, utils.sizes.height);
		this._renderer.setPixelRatio(utils.pixelRatio);
		this._renderer.setClearColor(0x000000, 0);
	}
	_setModel() {
		this._loaders.gltfLoader.load(modelUrl, gltf => {
			this._model = gltf.scene;

			// Find objs
			const letters = this._model.children.filter(child => child.name.startsWith('letter'));
			const keys = this._model.children.filter(child => child.name.startsWith('key'));
			const keysQE = keys.filter(
				key => key.name.slice(-1) === 'q' || key.name.slice(-1) === 'e'
			);
			const keysWASD = keys.filter(
				key =>
					key.name.includes('w') ||
					key.name.includes('a') ||
					key.name.includes('s') ||
					key.name.includes('d')
			);
			const board = this._model.children.find(child => child.name === 'board');

			letters.forEach(letter => (letter.material = this._materials.letter));
			board.material = this._materials.board;
			keysQE.forEach(letter => (letter.material = this._materials.qe));
			keysWASD.forEach(letter => (letter.material = this._materials.wasd));

			this._model.scale.set(0.6, 0.6, 0.6);

			this._model.position.x = 0.7;

			this._model.rotation.y = Math.PI * 0.2;

			this._scene.add(this._model);

			this._handleModelOnScroll();
		});
	}
	_setController() {
		this._controller = new OrbitControls(this._camera, this._canvas);
		this._controller.enableDamping = true;
		this._controller.enableZoom = false;
		this._controller.enablePan = false;
		this._controller.enableRotate = false;
	}
	_setLoaders() {
		this._loaders = {};
		this._loaders.gltfLoader = new GLTFLoader();
	}
	_setMaterials() {
		this._materials = {};
		this._materials.letter = new THREE.MeshBasicMaterial({ color: 0x000000 });
		this._materials.board = new THREE.MeshBasicMaterial({
			color: this._debugObject.boardColor,
		});
		this._materials.qe = new THREE.MeshBasicMaterial({ color: this._debugObject.qeColor });
		this._materials.wasd = new THREE.MeshBasicMaterial({ color: this._debugObject.wasdColor });
	}
	_setGUI() {
		this._debugObject = {
			boardColor: '#1c1c1c',
			qeColor: '#b0b0b0',
			wasdColor: '#fff',
			colors: {
				qe: ['#fff', 'orange', 'yellow', '#b0b0b0'],
				wasd: ['purple', 'cyan', 'gren', '#fff'],
			},
		};

		this._gui = new GUI();
		this._gui
			.addColor(this._debugObject, 'boardColor')
			.onChange(() => this._materials.board.color.set(this._debugObject.boardColor));
		this._gui
			.addColor(this._debugObject, 'qeColor')
			.onChange(() => this._materials.qe.color.set(this._debugObject.qeColor));
		this._gui
			.addColor(this._debugObject, 'wasdColor')
			.onChange(() => this._materials.wasd.color.set(this._debugObject.wasdColor));

		// Hide
		// this._gui.hide();
	}
	_tick() {
		this._renderer.render(this._scene, this._camera);
		this._controller.update();
		requestAnimationFrame(this._tick.bind(this));
	}
	addHandlerResize() {
		window.addEventListener('resize', this._resize.bind(this));
	}
	_handleModelOnScroll() {
		const rotateKeyboard = gsap.to(this._model.rotation, {
			y: Math.PI * 2 + this._model.rotation.y,
			x: 0,
			z: 0,
			duration: 10,
			repeat: -1,
			ease: 'none',
		});

		// Part 1
		gsap.timeline({
			scrollTrigger: {
				trigger: '#part-1',
				start: 'top 60%',
				end: 'bottom bottom',
				scrub: true,
				// markers: true,
				onEnter: () => {
					rotateKeyboard.pause();

					gsap.to(this._model.rotation, {
						y: -Math.PI / 8,
						x: -Math.PI / 30,
						duration: 1,
					});
				},
				onLeaveBack: () => {
					rotateKeyboard.progress(0.8).resume();
				},
			},
		})
			.to(this._model.scale, {
				x: 0.9,
				y: 0.9,
				z: 0.9,
			})
			.to(this._model.position, { x: -2 }, 0);

		// Part 2
		gsap.timeline({
			scrollTrigger: {
				trigger: '#part-2',
				start: 'top 60%',
				end: 'bottom bottom',
				scrub: true,
				// markers: true,
			},
		})
			.to(this._model.position, { x: 1.2 }, 0)
			.to(this._model.rotation, { x: 0, y: -Math.PI / 4 }, 0)
			.to(
				this._model.scale,
				{
					x: 0.5,
					y: 0.5,
					z: 0.5,
				},
				0
			);

		// Rotate on part 2
		let curColor = 1;

		gsap.to(this._model.rotation, {
			y: 2 * Math.PI + this._model.rotation.y,
			repeat: 3,
			duration: 1,
			onStart: () => {
				this._debugObject.wasdColor = this._debugObject.colors.wasd[0];
				this._materials.wasd.color.set(new THREE.Color(this._debugObject.wasdColor));

				this._debugObject.qeColor = this._debugObject.colors.qe[0];
				this._materials.qe.color.set(new THREE.Color(this._debugObject.qeColor));
			},
			onRepeat: () => {
				this._debugObject.wasdColor = this._debugObject.colors.wasd[curColor];
				this._debugObject.qeColor = this._debugObject.colors.qe[curColor];

				this._materials.wasd.color.set(new THREE.Color(this._debugObject.wasdColor));
				this._materials.qe.color.set(new THREE.Color(this._debugObject.qeColor));

				curColor++;
			},
			onComplete: () => {
				curColor = 3;
				this._debugObject.wasdColor = this._debugObject.colors.wasd[curColor];
				this._debugObject.qeColor = this._debugObject.colors.qe[curColor];

				this._materials.wasd.color.set(new THREE.Color(this._debugObject.wasdColor));
				this._materials.qe.color.set(new THREE.Color(this._debugObject.qeColor));

				curColor = 1;

				gsap.to(this._model.rotation, {
					y: this._model.rotation.y - Math.PI / 2.5,
					duration: 0.5,
				});
			},
			scrollTrigger: {
				trigger: '#part-2',
				start: 'center center',
				end: 'bottom center',
				toggleActions: 'restart play none none',
				markers: true,
			},
		});

		// Part 3
		gsap.timeline({
			scrollTrigger: {
				trigger: '#part-3',
				start: 'top 40%',
				end: 'bottom bottom',
				scrub: true,
				// markers: true,
			},
		})
			.to(this._model.position, { x: 0, y: 0 }, 0)
			.to(this._model.scale, { x: 0.4, y: 0.4, z: 0.4 }, 0);
	}
	_resize() {
		utils.resize();

		this._camera.aspect = utils.sizes.width / utils.sizes.height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(utils.sizes.width, utils.sizes.height);
		this._renderer.setPixelRatio(utils.pixelRatio);
	}
}

export default new Three();
