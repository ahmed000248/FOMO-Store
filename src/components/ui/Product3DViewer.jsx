/**
 * Product3DViewer Component
 * 
 * Implements a premium Three.js 3D rendering canvas with:
 * - Direct mouse/touch click-drag orbit rotation and wheel zoom support.
 * - Dynamic studio-level multi-source lighting.
 * - Automatic idle slow spin transition with interaction inertia.
 * - Five bespoke high-fidelity procedural streetwear geometries.
 * - Apple-level glassmorphic control dashboard.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RiRefreshLine, RiPlayLine, RiPauseLine,
  RiFullscreenLine, RiFullscreenExitLine, RiPulseLine
} from 'react-icons/ri';
import { getProduct3DMetadata } from '../../services/product3DService';

export default function Product3DViewer({ product }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const productGroupRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const metadata = getProduct3DMetadata(product);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !metadata) return;

    setIsLoading(true);

    // 1. Setup Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // transparent to allow premium CSS dark-indigo gradients

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);
    cameraRef.current = camera;

    // 2. Setup WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 3. Setup Lights (Studio Quality)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Dynamic key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cool neon fill light (Violet)
    const fillLight = new THREE.PointLight(0xa78bfa, 2.2, 15);
    fillLight.position.set(-6, 3, -2);
    scene.add(fillLight);

    // Warm rim light (Orange/Gold)
    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    rimLight.position.set(0, 4, -6);
    scene.add(rimLight);

    // 4. Create Product Group container
    const productGroup = new THREE.Group();
    scene.add(productGroup);
    productGroupRef.current = productGroup;

    // 5. Generate Dynamic High-End Streetwear Procedural Geometries
    const createProceduralModel = () => {
      // Clear previous
      while(productGroup.children.length > 0){
        productGroup.remove(productGroup.children[0]);
      }

      const mainColor = new THREE.Color(metadata.color || '#8b5cf6');
      const rough = metadata.roughness ?? 0.5;
      const metal = metadata.metalness ?? 0.5;

      const bodyMat = new THREE.MeshStandardMaterial({
        color: mainColor,
        roughness: rough,
        metalness: metal,
        bumpScale: 0.05
      });

      const trimMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1f2937'),
        roughness: 0.8,
        metalness: 0.1
      });

      const metallicDetailMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d1d5db'),
        roughness: 0.2,
        metalness: 0.95
      });

      // Ambient Drop Shadow Ring
      const shadowGeo = new THREE.RingGeometry(0.1, 1.4, 32);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = Math.PI / 2;
      shadowMesh.position.y = -1.6;
      scene.add(shadowMesh);

      // Model switchboard
      switch (metadata.type) {
        case 'procedural_tee': {
          // Torso
          const torsoGeo = new THREE.CylinderGeometry(0.7, 0.75, 1.6, 32);
          const torso = new THREE.Mesh(torsoGeo, bodyMat);
          torso.position.y = -0.1;
          torso.castShadow = true;
          productGroup.add(torso);

          // Left Sleeve
          const leftSleeveGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 24);
          const leftSleeve = new THREE.Mesh(leftSleeveGeo, bodyMat);
          leftSleeve.position.set(-0.75, 0.5, 0);
          leftSleeve.rotation.z = Math.PI / 4;
          leftSleeve.castShadow = true;
          productGroup.add(leftSleeve);

          // Right Sleeve
          const rightSleeve = leftSleeve.clone();
          rightSleeve.position.x = 0.75;
          rightSleeve.rotation.z = -Math.PI / 4;
          productGroup.add(rightSleeve);

          // Collar Torus
          const collarGeo = new THREE.TorusGeometry(0.3, 0.05, 16, 32);
          const collar = new THREE.Mesh(collarGeo, trimMat);
          collar.rotation.x = Math.PI / 2;
          collar.position.y = 0.72;
          productGroup.add(collar);

          // Brand Patch Badge
          const badgeGeo = new THREE.BoxGeometry(0.18, 0.18, 0.04);
          const badge = new THREE.Mesh(badgeGeo, metallicDetailMat);
          badge.position.set(-0.25, 0.3, 0.73);
          badge.rotation.y = 0.1;
          productGroup.add(badge);
          break;
        }

        case 'procedural_jacket': {
          // Outer Jacket Torso
          const bodyGeo = new THREE.CylinderGeometry(0.72, 0.78, 1.7, 32);
          const body = new THREE.Mesh(bodyGeo, bodyMat);
          body.position.y = -0.1;
          body.castShadow = true;
          productGroup.add(body);

          // Puffy Sleeves segment left
          const sleeveLeftGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.8, 16);
          const sleeveLeft = new THREE.Mesh(sleeveLeftGeo, bodyMat);
          sleeveLeft.position.set(-0.85, 0.4, 0);
          sleeveLeft.rotation.z = Math.PI / 3.5;
          sleeveLeft.castShadow = true;
          productGroup.add(sleeveLeft);

          // Right sleeve
          const sleeveRight = sleeveLeft.clone();
          sleeveRight.position.x = 0.85;
          sleeveRight.rotation.z = -Math.PI / 3.5;
          productGroup.add(sleeveRight);

          // Zipper Strip
          const zipGeo = new THREE.BoxGeometry(0.04, 1.68, 0.04);
          const zipper = new THREE.Mesh(zipGeo, metallicDetailMat);
          zipper.position.set(0, -0.1, 0.78);
          productGroup.add(zipper);

          // Elastic Hem
          const hemGeo = new THREE.CylinderGeometry(0.76, 0.76, 0.12, 32);
          const hem = new THREE.Mesh(hemGeo, trimMat);
          hem.position.y = -0.92;
          productGroup.add(hem);
          break;
        }

        case 'procedural_cargo': {
          // Hips block
          const hipsGeo = new THREE.BoxGeometry(1.2, 0.6, 0.7);
          const hips = new THREE.Mesh(hipsGeo, bodyMat);
          hips.position.y = 0.4;
          hips.castShadow = true;
          productGroup.add(hips);

          // Left Leg
          const legGeo = new THREE.CylinderGeometry(0.26, 0.22, 1.8, 16);
          const legLeft = new THREE.Mesh(legGeo, bodyMat);
          legLeft.position.set(-0.32, -0.5, 0);
          legLeft.castShadow = true;
          productGroup.add(legLeft);

          // Right Leg
          const legRight = legLeft.clone();
          legRight.position.x = 0.32;
          productGroup.add(legRight);

          // Dynamic Cargo Pocket left
          const pocketGeo = new THREE.BoxGeometry(0.12, 0.35, 0.32);
          const pocketLeft = new THREE.Mesh(pocketGeo, bodyMat);
          pocketLeft.position.set(-0.6, -0.2, 0);
          pocketLeft.castShadow = true;
          productGroup.add(pocketLeft);

          // Cargo Pocket right
          const pocketRight = pocketLeft.clone();
          pocketRight.position.x = 0.6;
          productGroup.add(pocketRight);

          // Silver snap details
          const snapGeo = new THREE.SphereGeometry(0.04, 8, 8);
          const snapLeft = new THREE.Mesh(snapGeo, metallicDetailMat);
          snapLeft.position.set(-0.67, -0.1, 0.1);
          productGroup.add(snapLeft);

          const snapRight = snapLeft.clone();
          snapRight.position.x = 0.67;
          productGroup.add(snapRight);
          break;
        }

        case 'procedural_knit': {
          // Bumpy warm texture
          const knitMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: 0.95,
            metalness: 0.05,
            wireframe: false
          });

          // Cozy main torso
          const bodyGeo = new THREE.SphereGeometry(0.85, 32, 32);
          const body = new THREE.Mesh(bodyGeo, knitMat);
          body.scale.set(1.0, 1.25, 0.85);
          body.position.y = -0.1;
          body.castShadow = true;
          productGroup.add(body);

          // Heavy turtleneck collar
          const neckGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.4, 24);
          const neck = new THREE.Mesh(neckGeo, knitMat);
          neck.position.y = 0.95;
          productGroup.add(neck);

          // Warm sleeves left
          const sleeveLeftGeo = new THREE.SphereGeometry(0.28, 16, 16);
          const sleeveLeft = new THREE.Mesh(sleeveLeftGeo, knitMat);
          sleeveLeft.scale.set(2.2, 0.9, 0.9);
          sleeveLeft.position.set(-0.95, 0.3, 0);
          sleeveLeft.rotation.z = -Math.PI / 6;
          sleeveLeft.castShadow = true;
          productGroup.add(sleeveLeft);

          // Warm sleeves right
          const sleeveRight = sleeveLeft.clone();
          sleeveRight.position.x = 0.95;
          sleeveRight.rotation.z = Math.PI / 6;
          productGroup.add(sleeveRight);
          break;
        }

        case 'procedural_glasses': 
        default: {
          // Cyberpunk futuristic shield sunglasses
          const frameGeo = new THREE.BoxGeometry(1.9, 0.08, 0.08);
          const frames = new THREE.Mesh(frameGeo, trimMat);
          frames.position.set(0, 0.1, 0);
          productGroup.add(frames);

          // Glow neon visor shield
          const visorGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.46, 24, 1, true, 0, Math.PI);
          const visorMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#a78bfa'),
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.9,
            opacity: 0.85,
            transparent: true,
            side: THREE.DoubleSide
          });
          const visor = new THREE.Mesh(visorGeo, visorMat);
          visor.rotation.x = Math.PI / 2;
          visor.position.set(0, -0.1, 0.1);
          productGroup.add(visor);

          // Gold frame side bars (left arm)
          const armGeo = new THREE.BoxGeometry(0.04, 0.04, 1.4);
          const armLeft = new THREE.Mesh(armGeo, metallicDetailMat);
          armLeft.position.set(-0.92, 0.06, -0.6);
          productGroup.add(armLeft);

          // Right arm
          const armRight = armLeft.clone();
          armRight.position.x = 0.92;
          productGroup.add(armRight);
          break;
        }
      }

      setIsLoading(false);
    };

    createProceduralModel();

    // 6. Interactive Orbit Touch/Drag Logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Smooth Orbit state
    let targetRotationX = 0;
    let targetRotationY = 0;
    let zoomLevel = 1.0;

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      targetRotationY += deltaMove.x * 0.007;
      targetRotationX += deltaMove.y * 0.007;

      // Lock vertical rotation axis
      targetRotationX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, targetRotationX));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Zoom on wheel scroll
    const handleWheel = (e) => {
      e.preventDefault();
      zoomLevel += e.deltaY * 0.001;
      zoomLevel = Math.max(0.65, Math.min(1.4, zoomLevel));
      camera.position.z = 5.5 * zoomLevel;
    };

    // Touch support for mobile devices
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };

      targetRotationY += deltaMove.x * 0.009;
      targetRotationX += deltaMove.y * 0.009;
      targetRotationX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, targetRotationX));

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const domContainer = containerRef.current;
    domContainer.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    domContainer.addEventListener('touchstart', handleTouchStart);
    domContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    domContainer.addEventListener('touchend', handleTouchEnd);

    // 7. Animation Loop with inertia and auto rotation
    let animationFrameId;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto rotation when idle or running
      if (isPlaying && !isDragging) {
        targetRotationY += 0.007;
      }

      // Smooth inertia lag transition
      productGroup.rotation.y += (targetRotationY - productGroup.rotation.y) * 0.1;
      productGroup.rotation.x += (targetRotationX - productGroup.rotation.x) * 0.1;

      // Soft breathing hover animation
      if (!isDragging) {
        productGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.07;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Dynamic Resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (domContainer) {
        domContainer.removeEventListener('mousedown', handleMouseDown);
        domContainer.removeEventListener('wheel', handleWheel);
        domContainer.removeEventListener('touchstart', handleTouchStart);
        domContainer.removeEventListener('touchmove', handleTouchMove);
        domContainer.removeEventListener('touchend', handleTouchEnd);
      }

      renderer.dispose();
      // Dispose textures/geometries to clear GPU memory leak
      scene.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      });
    };
  }, [product, isPlaying, metadata]);

  const handleReset = () => {
    if (productGroupRef.current) {
      productGroupRef.current.rotation.set(0, 0, 0);
      productGroupRef.current.position.set(0, 0, 0);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!metadata) return null;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-[2rem] overflow-hidden glass border border-white/5 bg-slate-950/40 transition-all duration-500 ease-out select-none flex items-center justify-center ${
        isFullscreen 
          ? 'fixed inset-4 z-50 shadow-[0_0_150px_rgba(0,0,0,0.9)] bg-slate-950/95' 
          : 'w-full h-[400px] sm:h-[480px] md:h-[550px]'
      }`}
    >
      {/* 3D WEBGL CANVAS */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* GRADIENT SHADOW BACKGROUND OVERLAYS */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="flex items-center gap-2 border border-violet-500/10 px-3 py-1.5 rounded-full bg-violet-950/20 backdrop-blur-md">
          <RiPulseLine size={13} className="text-accent-violet animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase">3D interactive Studio</span>
        </div>
      </div>

      {/* SKELETON LOADING LOADER */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-lg space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-accent-violet animate-spin" />
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">compiling 3D scene...</p>
        </div>
      )}

      {/* FLOATING ACTION GLASS CONTROLS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3.5 px-4.5 py-3 rounded-2xl glass border border-white/10 backdrop-blur-xl bg-slate-950/60 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Pause rotation" : "Play rotation"}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          {isPlaying ? <RiPauseLine size={18} /> : <RiPlayLine size={18} />}
        </button>

        <button
          onClick={handleReset}
          title="Reset View"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <RiRefreshLine size={17} />
        </button>

        <div className="w-[1px] h-5 bg-white/10" />

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          {isFullscreen ? <RiFullscreenExitLine size={18} /> : <RiFullscreenLine size={18} />}
        </button>
      </div>
    </div>
  );
}
