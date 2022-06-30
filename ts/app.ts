import {GUI} from 'dat.gui';
import {fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

export class App {
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  private cube: THREE.Mesh;
  private directionalLight = new THREE.DirectionalLight();
  private gui: GUI;
  private renderer: THREE.Renderer = new THREE.WebGLRenderer();
  private orbitControls: OrbitControls =
    new OrbitControls(this.camera, this.renderer.domElement);
  private queryString = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, property) => searchParams.get(<string>property),
  });
  private scene: THREE.Scene = new THREE.Scene();
  // @ts-ignore Used to avoid lint error "Only a void function can be called
  // with the 'new' keyword." since the types bundled with package specify it
  // returns type `Stats` instead of `void`.
  private stats: Stats = new Stats();
  private static _singleton: App = new this();
  isDev: boolean;

  static get app() {
    return this._singleton;
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.render();
    this.stats.update();
  }

  configureCamera() {
    this.camera.fov = 75;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.y = 4;
    this.camera.position.z = 4;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.updateProjectionMatrix();

    const cameraPositionFolder = this.gui.addFolder('Camera Position');
    cameraPositionFolder.open();
    cameraPositionFolder.add(this.camera.position, 'x', 1, 50).listen();
    cameraPositionFolder.add(this.camera.position, 'y', 1, 50).listen();
    cameraPositionFolder.add(this.camera.position, 'z', 1, 50).listen();
  }

  configureDev() {
    if (this.queryString['dev']) {
      this.isDev = true;
    }

    this.gui = new GUI();
    document.body.appendChild(this.stats.dom);

    const gridHelper = new THREE.GridHelper(5, undefined, 'yellow', 'gray');
    this.scene.add(gridHelper);

    this.orbitControls.addEventListener('change', () => this.render());
  }

  configureEventListeners() {
    fromEvent(window, 'resize')
        .pipe(debounceTime(75))
        .subscribe(() => this.updateResizedWindow());
  }

  configureLights() {
    this.directionalLight.color = new THREE.Color(0xffffff);
    this.directionalLight.intensity = 1;
    this.directionalLight.position.set(2, 2, 2);

    this.scene.add(this.directionalLight);

    const directionalLightHelper =
        new THREE.DirectionalLightHelper(this.directionalLight, 1);
    this.scene.add(directionalLightHelper);

    const directionalLightFolder = this.gui.addFolder('Directionalal Light');
    directionalLightFolder.add(this.directionalLight.position, 'x', 1, 50)
        .listen();
    directionalLightFolder.add(this.directionalLight.position, 'y', 1, 50)
        .listen();
    directionalLightFolder.add(this.directionalLight.position, 'z', 1, 50)
        .listen();
    directionalLightFolder.add(this.directionalLight, 'intensity', .25, 5, .01)
        .listen();
    directionalLightFolder.open();
  }

  configureMesh() {
    const geometry: THREE.BufferGeometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  }

  configureRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  init() {
    this.configureDev();
    this.configureCamera();
    this.configureMesh();
    this.configureLights();
    this.configureRenderer();
    this.configureEventListeners();

    this.animate();
  }


  updateResizedWindow() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
