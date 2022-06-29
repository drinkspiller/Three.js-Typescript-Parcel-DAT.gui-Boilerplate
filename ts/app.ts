import {fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

export class App {
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000);
  private cube: THREE.Mesh;
  private renderer: THREE.Renderer = new THREE.WebGLRenderer();
  private controls: OrbitControls =
    new OrbitControls(this.camera, this.renderer.domElement);
  private scene: THREE.Scene = new THREE.Scene();
  // @ts-ignore Used to avoid lint error "Only a void function can be called
  // with the 'new' keyword." since the types bundled with package specify it
  // returns type `Stats` instead of `void`.
  private stats: Stats = new Stats();
  private static _singleton: App = new this();

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

  init() {
    this.camera.position.z = 2;
    document.body.appendChild(this.stats.dom);

    const geometry: THREE.BufferGeometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    fromEvent(window, 'resize')
        .pipe(debounceTime(75))
        .subscribe(() => this.updateResizedWindow());

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

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
