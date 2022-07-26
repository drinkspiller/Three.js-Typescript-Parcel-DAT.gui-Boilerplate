import GUI from 'lil-gui';
import * as THREE from 'three';
import {Box3} from 'three';
import {CSG} from 'three-csgmesh/src/client/CSGMesh';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {Font, FontLoader} from 'three/examples/jsm/loaders/FontLoader';
import honeycombTextureImage from 'url:../assets/hex-square_texture.jpg';
import honey from 'url:../assets/honey03.jpg';

const logoYellow = 0xffd01a;
const fontFile = './Roboto_Condensed_Bold.json';
const blackMaterial = new THREE.MeshPhysicalMaterial({
  color: 'black',
  roughness: 0,
  metalness: .25,
  clearcoat: .7,
  clearcoatRoughness: .25,
  reflectivity: 0,
});
const whiteMaterial = new THREE.MeshPhysicalMaterial({
  color: 'white',
  roughness: 0,
  metalness: .25,
  clearcoat: .7,
  clearcoatRoughness: .25,
  reflectivity: 0,
});
const yellowMaterial = new THREE.MeshPhysicalMaterial({
  color: logoYellow,
  roughness: .5,
  metalness: 0,
  clearcoat: .2,
  clearcoatRoughness: .25,
  reflectivity: 0,
});

export class Logo extends THREE.Group {
  private barSep: THREE.Mesh;
  private outerHex: THREE.Mesh;
  private fontLoader = new FontLoader();
  private font: Font;
  private innerHex: THREE.Mesh;
  private giordanoInner: THREE.Group = new THREE.Group();
  private giordanoOuter: THREE.Group = new THREE.Group();
  private skyeInner: THREE.Group = new THREE.Group();
  private skyeOuter: THREE.Group = new THREE.Group();

  gui: GUI|null;


  constructor(gui?: GUI) {
    super();
    this.gui = gui ? gui : null;
    this.init();
  }

  async init() {
    this.makeHexes();
    this.makeBarSep();
    this.font = await this.loadFont();
    this.makeSkye();
    this.makeGiordano();
  }

  loadFont(): Promise<Font> {
    return new Promise((resolve) => {
      this.fontLoader.load(fontFile, (font) => {
        resolve(font);
      });
    });
  }

  makeHexes() {
    const hexGeometry = new THREE.CylinderBufferGeometry(1, 1, .2, 6);
    hexGeometry.rotateX(THREE.MathUtils.degToRad(90));

    this.outerHex = new THREE.Mesh(hexGeometry, yellowMaterial);
    this.innerHex = new THREE.Mesh(hexGeometry, blackMaterial);

    this.outerHex.castShadow = true;
    this.innerHex.receiveShadow = true;

    // Scale the part to cut out so it extends beyond the original it will cut
    // from.
    this.innerHex.scale.set(.85, .85, 1.5);
    this.innerHex.updateMatrix();

    const blackOuterHexCsg = CSG.fromMesh(this.outerHex);
    const yellowInnerHexCsg = CSG.fromMesh(this.innerHex);

    this.outerHex = CSG.toMesh(
        blackOuterHexCsg.subtract(yellowInnerHexCsg), new THREE.Matrix4(),
        (this.outerHex.material as THREE.MeshPhysicalMaterial));
    this.innerHex.scale.z = .15;
    this.innerHex.position.z = -.08;
    this.innerHex.updateMatrix();


    this.add(this.outerHex, this.innerHex);
  }

  makeBarSep() {
    this.barSep = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1.3, .03, .03),
        yellowMaterial,
    );
    this.barSep.position.z = .15;
    this.add(this.barSep);
  }

  makeSkye() {
    const skye = 'SKYE';

    const textOptions = {
      font: this.font,
      size: .36,
      height: .1,
      curveSegments: 20,
      bevelEnabled: false,
    };

    let letterOffset = 0;
    const letterSpacing = .055;
    let i = 0;
    for (const letter of skye) {
      const geometry = new TextGeometry(letter, textOptions);
      const letterMeshInner = new THREE.Mesh(geometry, whiteMaterial);
      const letterMeshOuter = new THREE.Mesh(geometry, blackMaterial);
      const innerLetterSize = new THREE.Vector3();
      letterMeshInner.geometry.computeBoundingBox();
      letterMeshInner.geometry.boundingBox?.getSize(innerLetterSize);
      letterMeshInner.position.x = letterOffset + letterSpacing * i;

      letterMeshOuter.scale.set(1.1, 1.1, .3);
      const outerLetterBoundingBox =
          new Box3().setFromObject(letterMeshOuter);
      const outerLetterSize = new THREE.Vector3();
      outerLetterBoundingBox.getSize(outerLetterSize);
      const widthDelta: number = outerLetterSize.x - innerLetterSize.x;
      const heightDelta: number = outerLetterSize.y - innerLetterSize.y;
      letterMeshOuter.position.x =
          letterMeshInner.position.x - (widthDelta / 2);
      letterMeshOuter.position.y =
          letterMeshInner.position.y - (heightDelta / 2);
      letterMeshOuter.position.z += .02;

      letterOffset += innerLetterSize.x;
      i++;

      this.skyeInner.add(letterMeshInner);
      this.skyeOuter.add(letterMeshOuter);
    }

    const skyeInnerBoundingBox = new THREE.Box3().setFromObject(this.skyeInner);
    const center = new THREE.Vector3();
    skyeInnerBoundingBox.getCenter(center);
    this.skyeInner.translateX(-center.x);

    const skyeOuterBoundingBox =
        new THREE.Box3().setFromObject(this.skyeOuter);
    skyeOuterBoundingBox.getCenter(center);
    this.skyeOuter.translateX(-center.x);

    this.skyeInner.position.z = .1;
    this.skyeOuter.position.z = .1;
    this.skyeInner.position.y = .05;
    this.skyeOuter.position.y = .05;


    this.add(this.skyeInner, this.skyeOuter);
  }

  makeGiordano() {
    const giordano = 'GIORDANO';

    const textOptions = {
      font: this.font,
      size: .14,
      height: .1,
      curveSegments: 20,
      bevelEnabled: false,
    };

    let letterOffset = 0;
    const letterSpacing = .055;
    let i = 0;
    for (const letter of giordano) {
      const geometry = new TextGeometry(letter, textOptions);
      const letterMeshInner = new THREE.Mesh(geometry, whiteMaterial);
      const letterMeshOuter = new THREE.Mesh(geometry, blackMaterial);
      const innerLetterSize = new THREE.Vector3();
      letterMeshInner.geometry.computeBoundingBox();
      letterMeshInner.geometry.boundingBox?.getSize(innerLetterSize);
      letterMeshInner.position.x = letterOffset + letterSpacing * i;

      letterMeshOuter.scale.set(1.1, 1.1, .3);
      const outerLetterBoundingBox =
          new Box3().setFromObject(letterMeshOuter);
      const outerLetterSize = new THREE.Vector3();
      outerLetterBoundingBox.getSize(outerLetterSize);
      const widthDelta: number = outerLetterSize.x - innerLetterSize.x;
      const heightDelta: number = outerLetterSize.y - innerLetterSize.y;
      letterMeshOuter.position.x =
          letterMeshInner.position.x - (widthDelta / 2);
      letterMeshOuter.position.y =
          letterMeshInner.position.y - (heightDelta / 2);
      letterMeshOuter.position.z += .02;

      letterOffset += innerLetterSize.x;
      i++;

      this.giordanoInner.add(letterMeshInner);
      this.giordanoOuter.add(letterMeshOuter);
    }

    const giordanoInnerBoundingBox =
        new THREE.Box3().setFromObject(this.giordanoInner);
    const center = new THREE.Vector3();
    giordanoInnerBoundingBox.getCenter(center);
    this.giordanoInner.translateX(-center.x);

    const giordanoOuterBoundingBox =
        new THREE.Box3().setFromObject(this.giordanoOuter);
    giordanoOuterBoundingBox.getCenter(center);
    this.giordanoOuter.translateX(-center.x);

    this.giordanoInner.position.z = .1;
    this.giordanoOuter.position.z = .1;
    this.giordanoInner.position.y = -.2;
    this.giordanoOuter.position.y = -.2;


    this.add(this.giordanoInner, this.giordanoOuter);
  }
}
