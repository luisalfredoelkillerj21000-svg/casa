import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Room, PlanData, PlanVariant } from '../types/blueprint';
import { ROOMS, WALLS, FURNITURE, LOT_WIDTH, LOT_DEPTH } from '../data/floorPlanData';
import { Sun, Camera, Maximize, Eye, Layers, Compass, ChevronDown, ChevronUp } from 'lucide-react';

interface Blueprint3DProps {
  selectedRoom: Room | null;
  onSelectRoom: (room: Room | null) => void;
  activeApartmentFilter: 'all' | 'dpto1' | 'dpto2' | 'common';
  planData?: PlanData;
  planVariant?: PlanVariant;
}

export const Blueprint3D: React.FC<Blueprint3DProps> = ({
  selectedRoom,
  onSelectRoom,
  activeApartmentFilter,
  planData,
  planVariant = '2bed',
}) => {
  const currentRooms = planData?.rooms || ROOMS;
  const currentWalls = planData?.walls || WALLS;
  const currentFurniture = planData?.furniture || FURNITURE;

  const mountRef = useRef<HTMLDivElement>(null);
  const [wallHeightMode, setWallHeightMode] = useState<'cutaway' | 'full' | 'glass'>('cutaway');
  const [sunTime, setSunTime] = useState<number>(11); // 11:00 AM default
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'top' | 'front' | 'dpto1' | 'dpto2'>('iso');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const wallsGroupRef = useRef<THREE.Group | null>(null);
  const roomMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Animation frame request callback
  const requestRenderRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a1120'); // Deep architectural slate
    scene.fog = new THREE.FogExp2('#0a1120', 0.025);
    sceneRef.current = scene;

    // Camera (Centered over 8x15 lot: X: 4, Z: 7.5)
    // Note: In 3D, X is width (0 to 8), Y is elevation (0 to 3), Z is depth (0 to 15)
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(16, 18, 24);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.target.set(4, 0.8, 7.5);
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go under the ground
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#f8fafc', '#1e293b', 0.65);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#fff7ed', 1.8);
    sunLight.position.set(14, 22, 10);
    sunLight.castShadow = !isSoftwareGl;
    if (sunLight.castShadow) {
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 60;
      const d = 16;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Ground Plane Outside Lot
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(4, -0.05, 7.5);
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Front Street & Sidewalk (Calle frente a la casa: Z < 0)
    const streetGeo = new THREE.PlaneGeometry(30, 8);
    const streetMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.8,
    });
    const street = new THREE.Mesh(streetGeo, streetMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(4, -0.02, -4);
    street.receiveShadow = !isSoftwareGl;
    scene.add(street);

    // Sidewalk curb
    const curbGeo = new THREE.BoxGeometry(16, 0.15, 1.5);
    const curbMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(4, 0.05, -0.8);
    scene.add(curb);

    // First Floor Slab representation (El primer piso ya está construido)
    const firstFloorGeo = new THREE.BoxGeometry(LOT_WIDTH, 2.6, LOT_DEPTH);
    const firstFloorMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.7,
      metalness: 0.1,
    });
    const firstFloor = new THREE.Mesh(firstFloorGeo, firstFloorMat);
    firstFloor.position.set(LOT_WIDTH / 2, -1.3, LOT_DEPTH / 2);
    firstFloor.receiveShadow = !isSoftwareGl;
    scene.add(firstFloor);

    // Second Floor Concrete Slab (Entrepiso del 2do Piso)
    const slabGeo = new THREE.BoxGeometry(LOT_WIDTH + 0.1, 0.25, LOT_DEPTH + 0.1);
    const slabMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.4,
      metalness: 0.1,
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.set(LOT_WIDTH / 2, 0.125, LOT_DEPTH / 2);
    slab.receiveShadow = !isSoftwareGl;
    scene.add(slab);

    // Room Floors with distinct textures / colors
    currentRooms.forEach((room) => {
      if (room.polygon.length < 3) return;
      const shape = new THREE.Shape();
      room.polygon.forEach((pt, i) => {
        if (i === 0) shape.moveTo(pt.x, pt.y);
        else shape.lineTo(pt.x, pt.y);
      });

      const floorGeo = new THREE.ShapeGeometry(shape);
      let floorColor = '#e2e8f0'; // Default porcelain
      let roughness = 0.3;

      if (room.id.includes('bed')) {
        floorColor = '#d4b996'; // Warm wood laminate
        roughness = 0.5;
      } else if (room.id.includes('bath')) {
        floorColor = '#94a3b8'; // Grey stone tile
        roughness = 0.2;
      } else if (room.id.includes('void')) {
        floorColor = '#64748b'; // Gravel / outdoor tile
        roughness = 0.8;
      } else if (room.id.includes('stairs') || room.id.includes('hall')) {
        floorColor = '#cbd5e1'; // Marble tile
        roughness = 0.3;
      }

      const floorMat = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness,
        metalness: 0.05,
      });

      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = Math.PI / 2; // Lie flat in XZ plane
      floorMesh.position.set(0, 0.255, 0); // Sit right on top of slab
      floorMesh.receiveShadow = !isSoftwareGl;
      scene.add(floorMesh);
      roomMeshesRef.current.set(room.id, floorMesh);
    });

    // Escalera Frontal Derecha 3D
    const stairsGroup = new THREE.Group();
    const stepMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.3, metalness: 0.1 });
    const railingMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.2, metalness: 0.8 });

    // Tramo 1 (X: 5.85 to 6.80)
    for (let i = 0; i < 8; i++) {
      const stepGeo = new THREE.BoxGeometry(0.9, 0.175, 0.32);
      const stepMesh = new THREE.Mesh(stepGeo, stepMat);
      stepMesh.position.set(6.35, -1.3 + (i + 1) * 0.175, 0.3 + i * 0.32);
      stepMesh.castShadow = !isSoftwareGl;
      stepMesh.receiveShadow = !isSoftwareGl;
      stairsGroup.add(stepMesh);
    }
    // Landing
    const landingGeo = new THREE.BoxGeometry(1.95, 0.18, 1.0);
    const landingMesh = new THREE.Mesh(landingGeo, stepMat);
    landingMesh.position.set(6.85, -1.3 + 8 * 0.175, 3.2);
    landingMesh.castShadow = !isSoftwareGl;
    stairsGroup.add(landingMesh);

    // Tramo 2 (X: 6.90 to 7.85) - arriving at 2nd floor level (Y = 0.25)
    for (let i = 0; i < 8; i++) {
      const stepGeo = new THREE.BoxGeometry(0.9, 0.175, 0.32);
      const stepMesh = new THREE.Mesh(stepGeo, stepMat);
      stepMesh.position.set(7.35, 0.1 + (i - 7) * 0.175, 2.7 - i * 0.32);
      stepMesh.castShadow = !isSoftwareGl;
      stepMesh.receiveShadow = !isSoftwareGl;
      stairsGroup.add(stepMesh);
    }

    // Safety Glass Railing around stair opening on 2nd floor (inner boundary at X = 5.85)
    const glassRailingGeo = new THREE.BoxGeometry(0.04, 0.9, 2.8);
    const glassRailingMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
    });
    const railingMesh = new THREE.Mesh(glassRailingGeo, glassRailingMat);
    railingMesh.position.set(5.85, 0.7, 1.8);
    stairsGroup.add(railingMesh);

    // Metal top handrail
    const handrailGeo = new THREE.BoxGeometry(0.08, 0.05, 2.8);
    const handrailMesh = new THREE.Mesh(handrailGeo, railingMat);
    handrailMesh.position.set(5.85, 1.15, 1.8);
    stairsGroup.add(handrailMesh);

    scene.add(stairsGroup);

    // 3D Furniture Procedural Assembly
    const furnitureGroup = new THREE.Group();
    const kitchenMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3 });
    const counterTopMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.15, metalness: 0.1 });
    const vanityMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 });

    const create3DBed = (x: number, z: number, w: number, l: number, rot: number = 0) => {
      const bed = new THREE.Group();
      const baseGeo = new THREE.BoxGeometry(w, 0.35, l);
      const baseMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.175;
      base.castShadow = !isSoftwareGl;
      bed.add(base);

      const matGeo = new THREE.BoxGeometry(w - 0.06, 0.25, l - 0.06);
      const matMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 });
      const mat = new THREE.Mesh(matGeo, matMat);
      mat.position.y = 0.45;
      mat.castShadow = !isSoftwareGl;
      bed.add(mat);

      const headGeo = new THREE.BoxGeometry(w, 0.9, 0.12);
      const headMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 0.45, -l / 2 + 0.06);
      head.castShadow = !isSoftwareGl;
      bed.add(head);

      const pilGeo = new THREE.BoxGeometry(w * 0.38, 0.12, 0.35);
      const pilMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.8 });
      const p1 = new THREE.Mesh(pilGeo, pilMat);
      p1.position.set(-w * 0.22, 0.62, -l / 2 + 0.3);
      const p2 = new THREE.Mesh(pilGeo, pilMat);
      p2.position.set(w * 0.22, 0.62, -l / 2 + 0.3);
      bed.add(p1, p2);

      bed.position.set(x, 0.25, z);
      bed.rotation.y = rot;
      return bed;
    };

    const create3DSofa = (x: number, z: number, w: number, l: number, rot: number = 0) => {
      const sofa = new THREE.Group();
      const sofaMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.8 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, l), sofaMat);
      seat.position.y = 0.2;
      seat.castShadow = !isSoftwareGl;
      sofa.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, l), sofaMat);
      back.position.set(-w / 2 + 0.1, 0.375, 0);
      back.castShadow = !isSoftwareGl;
      sofa.add(back);
      const arm1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, 0.18), sofaMat);
      arm1.position.set(0, 0.3, -l / 2 + 0.09);
      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, 0.18), sofaMat);
      arm2.position.set(0, 0.3, l / 2 - 0.09);
      sofa.add(arm1, arm2);

      sofa.position.set(x, 0.25, z);
      sofa.rotation.y = rot;
      return sofa;
    };

    // Render 3D furniture from currentFurniture data
    currentFurniture.forEach((item) => {
      const rad = (item.rotation * Math.PI) / 180;
      if (item.category === 'bed') {
        furnitureGroup.add(create3DBed(item.position.x, item.position.y, item.width, item.length, rad));
      } else if (item.category === 'sofa') {
        furnitureGroup.add(create3DSofa(item.position.x, item.position.y, item.width, item.length, rad));
      } else if (item.category === 'kitchen') {
        const kBox = new THREE.Mesh(new THREE.BoxGeometry(item.width, 0.9, item.length), kitchenMat);
        kBox.position.set(item.position.x, 0.7, item.position.y);
        kBox.rotation.y = rad;
        kBox.castShadow = !isSoftwareGl;
        furnitureGroup.add(kBox);
      } else if (item.category === 'bathroom') {
        const bBox = new THREE.Mesh(new THREE.BoxGeometry(item.width, 0.8, item.length), vanityMat);
        bBox.position.set(item.position.x, 0.65, item.position.y);
        bBox.rotation.y = rad;
        bBox.castShadow = !isSoftwareGl;
        furnitureGroup.add(bBox);
      } else if (item.category === 'table') {
        const tBox = new THREE.Mesh(new THREE.BoxGeometry(item.width, 0.75, item.length), counterTopMat);
        tBox.position.set(item.position.x, 0.62, item.position.y);
        tBox.rotation.y = rad;
        tBox.castShadow = !isSoftwareGl;
        furnitureGroup.add(tBox);
      }
    });

    scene.add(furnitureGroup);

    // Procedural Walls Mesh Generator function
    const buildWalls = (mode: 'cutaway' | 'full' | 'glass') => {
      if (wallsGroupRef.current) {
        scene.remove(wallsGroupRef.current);
      }

      const wallsGroup = new THREE.Group();
      const wallHeight = mode === 'cutaway' ? 1.2 : 2.6;
      const wallMat =
        mode === 'glass'
          ? new THREE.MeshPhysicalMaterial({
              color: '#38bdf8',
              transparent: true,
              opacity: 0.3,
              roughness: 0.1,
              metalness: 0.1,
              transmission: 0.6,
            })
          : new THREE.MeshStandardMaterial({
              color: mode === 'cutaway' ? '#e2e8f0' : '#cbd5e1',
              roughness: 0.5,
              metalness: 0.05,
            });

      // Wall segments builder helper
      const addWallBox = (x: number, z: number, w: number, d: number) => {
        const geo = new THREE.BoxGeometry(w, wallHeight, d);
        const mesh = new THREE.Mesh(geo, wallMat);
        mesh.position.set(x, 0.25 + wallHeight / 2, z);
        mesh.castShadow = !isSoftwareGl;
        mesh.receiveShadow = !isSoftwareGl;
        wallsGroup.add(mesh);
      };

      currentWalls.forEach((w) => {
        const isH = Math.abs(w.start.y - w.end.y) < 0.05;
        const minX = Math.min(w.start.x, w.end.x);
        const minZ = Math.min(w.start.y, w.end.y);
        const len = isH ? Math.abs(w.end.x - w.start.x) : Math.abs(w.end.y - w.start.y);
        const width = isH ? len : w.thickness;
        const depth = isH ? w.thickness : len;
        const posX = isH ? minX + len / 2 : minX;
        const posZ = isH ? minZ : minZ + len / 2;
        addWallBox(posX, posZ, width, depth);
      });

      scene.add(wallsGroup);
      wallsGroupRef.current = wallsGroup;
    };

    buildWalls(wallHeightMode);

    // Animation / Render on Demand Loop
    let frameId = 0;
    const requestRender = () => {
      frameId = requestAnimationFrame(() => {
        controls.update();
        renderer.render(scene, camera);
      });
    };
    requestRenderRef.current = requestRender;

    controls.addEventListener('change', requestRender);
    requestRender();

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      requestRender();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [planVariant, planData]);

  // Update Wall Height Mode dynamically
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    if (wallsGroupRef.current) {
      scene.remove(wallsGroupRef.current);
    }

    const wallsGroup = new THREE.Group();
    const wallHeight = wallHeightMode === 'cutaway' ? 1.2 : 2.6;
    const wallMat =
      wallHeightMode === 'glass'
        ? new THREE.MeshPhysicalMaterial({
            color: '#38bdf8',
            transparent: true,
            opacity: 0.35,
            roughness: 0.1,
            metalness: 0.1,
          })
        : new THREE.MeshStandardMaterial({
            color: wallHeightMode === 'cutaway' ? '#e2e8f0' : '#cbd5e1',
            roughness: 0.5,
            metalness: 0.05,
          });

    const addWallBox = (x: number, z: number, w: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, wallHeight, d);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, 0.25 + wallHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      wallsGroup.add(mesh);
    };

    currentWalls.forEach((w) => {
      const isH = Math.abs(w.start.y - w.end.y) < 0.05;
      const minX = Math.min(w.start.x, w.end.x);
      const minZ = Math.min(w.start.y, w.end.y);
      const len = isH ? Math.abs(w.end.x - w.start.x) : Math.abs(w.end.y - w.start.y);
      const width = isH ? len : w.thickness;
      const depth = isH ? w.thickness : len;
      const posX = isH ? minX + len / 2 : minX;
      const posZ = isH ? minZ : minZ + len / 2;
      addWallBox(posX, posZ, width, depth);
    });

    scene.add(wallsGroup);
    wallsGroupRef.current = wallsGroup;
    requestRenderRef.current();
  }, [wallHeightMode, currentWalls]);

  // Update Sunlight Position according to sunTime slider
  useEffect(() => {
    if (!sunLightRef.current) return;
    const light = sunLightRef.current;
    // Map hour 8 to 18 (8am to 6pm) to sun trajectory in sky
    // Solar noon is at 12
    const sunAngle = ((sunTime - 8) / 10) * Math.PI; // 0 to PI
    const radius = 26;
    const x = 4 + Math.cos(sunAngle) * radius;
    const y = Math.sin(sunAngle) * radius + 5;
    const z = 7.5 + Math.sin(sunAngle * 0.5) * 6;

    light.position.set(x, y, z);
    // Warm sunrise/sunset color vs cool noon color
    if (sunTime < 10 || sunTime > 16) {
      light.color.set('#fed7aa'); // Warm amber
      light.intensity = 1.4;
    } else {
      light.color.set('#ffffff'); // Bright daylight
      light.intensity = 1.9;
    }

    requestRenderRef.current();
  }, [sunTime]);

  // Camera presets
  const handleCameraPreset = (preset: 'iso' | 'top' | 'front' | 'dpto1' | 'dpto2') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    setCameraPreset(preset);

    if (preset === 'iso') {
      camera.position.set(16, 18, 24);
      controls.target.set(4, 0.8, 7.5);
    } else if (preset === 'top') {
      camera.position.set(4, 25, 7.51); // slight offset to prevent gimbal lock
      controls.target.set(4, 0, 7.5);
    } else if (preset === 'front') {
      camera.position.set(4, 3, -12);
      controls.target.set(4, 1.5, 4);
    } else if (preset === 'dpto1') {
      camera.position.set(4.5, 6, 0.5);
      controls.target.set(4.5, 0.8, 3.5);
    } else if (preset === 'dpto2') {
      camera.position.set(4, 8, 17);
      controls.target.set(4, 0.8, 11);
    }

    controls.update();
    requestRenderRef.current();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* Three.js Canvas Container (Isolated ref) */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Spec Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-medium pointer-events-none">
        <span className="text-sky-400 font-mono">Modelo 3D Interactivo</span>
        <span className="text-slate-500">·</span>
        <span>Lote 8.00m x 15.00m</span>
        <span className="text-slate-500">·</span>
        <span className="text-emerald-400">Escalera Frontal Derecha</span>
      </div>

      {/* Unified Bottom Control Dock (Zero Viewport Occlusion, Collapsible) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 w-full max-w-3xl px-4 pointer-events-auto ${
          isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Collapse Bar */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-t-lg border-t border-x border-slate-700/60 text-xs font-medium shadow-md transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Mostrar Controles 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Modo Cine (Ocultar)</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Card */}
        <div className="bg-slate-900/95 backdrop-none border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs text-slate-300 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Camera Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider mr-1">Vistas:</span>
              <button
                onClick={() => handleCameraPreset('iso')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  cameraPreset === 'iso' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Isométrica
              </button>
              <button
                onClick={() => handleCameraPreset('top')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  cameraPreset === 'top' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Planta (Cenital)
              </button>
              <button
                onClick={() => handleCameraPreset('front')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  cameraPreset === 'front' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Fachada
              </button>
              <button
                onClick={() => handleCameraPreset('dpto1')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  cameraPreset === 'dpto1' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Dpto 1
              </button>
              <button
                onClick={() => handleCameraPreset('dpto2')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  cameraPreset === 'dpto2' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Dpto 2
              </button>
            </div>

            {/* Wall Cutaway Mode */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider mr-1">Muros:</span>
              <button
                onClick={() => setWallHeightMode('cutaway')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  wallHeightMode === 'cutaway' ? 'bg-white text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Corte 1.2m
              </button>
              <button
                onClick={() => setWallHeightMode('full')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  wallHeightMode === 'full' ? 'bg-white text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Completo 2.6m
              </button>
              <button
                onClick={() => setWallHeightMode('glass')}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  wallHeightMode === 'glass' ? 'bg-white text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Cristal
              </button>
            </div>
          </div>

          {/* Sunlight / Time of Day Simulation Slider */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              Simulación Solar: <strong className="text-amber-400 font-mono">{sunTime}:00 hrs</strong>
            </span>
            <input
              type="range"
              min="8"
              max="18"
              step="1"
              value={sunTime}
              onChange={(e) => setSunTime(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              {sunTime <= 10 ? 'Mañana' : sunTime <= 14 ? 'Mediodía' : 'Tarde'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
