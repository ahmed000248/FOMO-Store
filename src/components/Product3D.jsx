import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getProduct3DMetadata } from '../services/product3DService';

// ── PROCEDURAL APPAREL OVERLAY SHADERS & GEOMETRIES ─────────────────────────
// Drapes physical-looking designer garments directly over the mannequin torso.
function ApparelOverlay({ metadata }) {
  if (!metadata) return null;

  const garmentColor = metadata.color || '#2d3748';
  const rough = metadata.roughness ?? 0.8;
  const metal = metadata.metalness ?? 0.1;

  // Garment main fabric material
  const fabricMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(garmentColor),
    roughness: rough,
    metalness: metal,
    side: THREE.DoubleSide
  });

  // Contrasting trim material
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1f2937'),
    roughness: 0.85,
    metalness: 0.05
  });

  // Polished chrome detailing
  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f3f4f6'),
    roughness: 0.15,
    metalness: 0.95
  });

  switch (metadata.type) {
    case 'procedural_tee':
      return (
        <group>
          {/* T-Shirt Torso wrapping the chest */}
          <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.23, 0.175, 0.68, 32]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Elegant crew neck collar */}
          <mesh castShadow position={[0, 1.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.09, 0.02, 16, 32]} />
            <primitive object={trimMaterial} attach="material" />
          </mesh>

          {/* Left sleeve sleeve cap */}
          <mesh castShadow position={[-0.24, 1.25, 0]} rotation={[0, 0, Math.PI / 4.5]}>
            <cylinderGeometry args={[0.075, 0.075, 0.28, 24]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Right sleeve sleeve cap */}
          <mesh castShadow position={[0.24, 1.25, 0]} rotation={[0, 0, -Math.PI / 4.5]}>
            <cylinderGeometry args={[0.075, 0.075, 0.28, 24]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Premium silver streetwear metal badge */}
          <mesh castShadow position={[-0.09, 1.15, 0.185]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.01]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
        </group>
      );

    case 'procedural_jacket':
      return (
        <group>
          {/* Puffy Jacket chest outline */}
          <mesh castShadow receiveShadow position={[0, 1.04, 0]}>
            <cylinderGeometry args={[0.25, 0.19, 0.70, 32]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Puffy left sleeve */}
          <mesh castShadow position={[-0.26, 1.20, 0]} rotation={[0, 0, Math.PI / 3.8]}>
            <cylinderGeometry args={[0.095, 0.075, 0.38, 16]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Puffy right sleeve */}
          <mesh castShadow position={[0.26, 1.20, 0]} rotation={[0, 0, -Math.PI / 3.8]}>
            <cylinderGeometry args={[0.095, 0.075, 0.38, 16]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Heavy elastic bottom waist hem */}
          <mesh castShadow position={[0, 0.70, 0]}>
            <cylinderGeometry args={[0.192, 0.192, 0.06, 32]} />
            <primitive object={trimMaterial} attach="material" />
          </mesh>

          {/* Metallic golden zipper down center */}
          <mesh castShadow position={[0, 1.04, 0.20]}>
            <boxGeometry args={[0.012, 0.69, 0.015]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
        </group>
      );

    case 'procedural_cargo':
      return (
        <group>
          {/* Waist segment */}
          <mesh castShadow position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.175, 0.165, 0.18, 32]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Left leg wrapping lower rod */}
          <mesh castShadow position={[-0.10, 0.12, 0]}>
            <cylinderGeometry args={[0.09, 0.075, 0.85, 16]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Right leg wrapping lower rod */}
          <mesh castShadow position={[0.10, 0.12, 0]}>
            <cylinderGeometry args={[0.09, 0.075, 0.85, 16]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Left leg cargo utility pocket */}
          <mesh castShadow position={[-0.20, 0.20, 0]} rotation={[0, -0.2, 0]}>
            <boxGeometry args={[0.04, 0.18, 0.11]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Right leg cargo utility pocket */}
          <mesh castShadow position={[0.20, 0.20, 0]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[0.04, 0.18, 0.11]} />
            <primitive object={fabricMaterial} attach="material" />
          </mesh>

          {/* Silver metallic snaps */}
          <mesh castShadow position={[-0.225, 0.23, 0.04]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
          <mesh castShadow position={[0.225, 0.23, 0.04]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
        </group>
      );

    case 'procedural_knit':
      return (
        <group>
          {/* Textured cozy knit sweater torso */}
          <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.245, 0.185, 0.69, 32]} />
            <meshStandardMaterial
              color={garmentColor}
              roughness={0.95}
              metalness={0.02}
              bumpScale={0.08}
            />
          </mesh>

          {/* Heavy double ribbed turtleneck collar */}
          <mesh castShadow position={[0, 1.40, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.12, 24]} />
            <meshStandardMaterial color={garmentColor} roughness={0.95} />
          </mesh>

          {/* Chunky sleeves left */}
          <mesh castShadow position={[-0.25, 1.23, 0]} rotation={[0, 0, Math.PI / 4.2]}>
            <cylinderGeometry args={[0.085, 0.07, 0.36, 16]} />
            <meshStandardMaterial color={garmentColor} roughness={0.95} />
          </mesh>

          {/* Chunky sleeves right */}
          <mesh castShadow position={[0.25, 1.23, 0]} rotation={[0, 0, -Math.PI / 4.2]}>
            <cylinderGeometry args={[0.085, 0.07, 0.36, 16]} />
            <meshStandardMaterial color={garmentColor} roughness={0.95} />
          </mesh>
        </group>
      );

    case 'procedural_glasses':
      return (
        <group>
          {/* Frameless cyberpunk visor styled perfectly onto the head cap */}
          <mesh castShadow position={[0, 1.54, 0.08]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.22, 0.05, 0.06]} />
            <meshPhysicalMaterial
              color="#a78bfa"
              roughness={0.05}
              metalness={0.1}
              transmission={0.95}
              opacity={0.85}
              transparent={true}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Cyberpunk gold support frame arms */}
          <mesh castShadow position={[-0.115, 1.54, 0.02]}>
            <boxGeometry args={[0.01, 0.02, 0.12]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
          <mesh castShadow position={[0.115, 1.54, 0.02]}>
            <boxGeometry args={[0.01, 0.02, 0.12]} />
            <primitive object={chromeMaterial} attach="material" />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}

// ── PROCEDURAL MANNEQUIN BASE ───────────────────────────────────────────────
function ProceduralMannequin({ metadata }) {
  return (
    <group position={[0, -0.8, 0]}>
      {/* Heavy circular metal studio base */}
      <mesh castShadow receiveShadow position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.3, 0.32, 0.05, 32]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} color="#d1d5db" />
      </mesh>

      {/* Sleek vertical chrome rod */}
      <mesh castShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 16]} />
        <meshStandardMaterial metalness={0.95} roughness={0.05} color="#e5e7eb" />
      </mesh>

      {/* Stylized hips/waist joint */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.25, 32]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} color="#f9fafb" />
      </mesh>

      {/* Ceramic chest/torso (acts as solid mannequin hanger) */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.65, 32]} />
        <meshStandardMaterial roughness={0.2} metalness={0.05} color="#ffffff" />
      </mesh>

      {/* Left shoulder cap joint */}
      <mesh castShadow position={[-0.24, 1.3, 0]}>
        <sphereGeometry args={[0.065, 32, 32]} />
        <meshStandardMaterial roughness={0.25} metalness={0.8} color="#e5e7eb" />
      </mesh>

      {/* Right shoulder cap joint */}
      <mesh castShadow position={[0.24, 1.3, 0]}>
        <sphereGeometry args={[0.065, 32, 32]} />
        <meshStandardMaterial roughness={0.25} metalness={0.8} color="#e5e7eb" />
      </mesh>

      {/* Elegant neck base joint */}
      <mesh castShadow position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.12, 16]} />
        <meshStandardMaterial roughness={0.3} metalness={0.8} color="#e5e7eb" />
      </mesh>

      {/* Abstract stylized head cap */}
      <mesh castShadow position={[0, 1.54, 0]}>
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshStandardMaterial roughness={0.2} metalness={0.05} color="#ffffff" />
      </mesh>

      {/* ── DESIGNER APPAREL GARMENT RENDERED DYNAMICALLY ───────────────────── */}
      <ApparelOverlay metadata={metadata} />
    </group>
  );
}

// ── GLB MANNEQUIN MODEL WITH DYNAMIC APPAREL OVERLAY ────────────────────────
function MannequinModel({ url, metadata, onError }) {
  try {
    const { scene } = useGLTF(url);

    useEffect(() => {
      if (scene) {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.25;
              child.material.metalness = 0.1;
              if (child.material.color) {
                child.material.color.set('#ffffff');
              }
            }
          }
        });
      }
    }, [scene]);

    return (
      <group>
        <primitive 
          object={scene} 
          scale={0.9} 
          position={[0, -1, 0]} 
        />
        {/* Render apparel overlay in sync coordinate space of GLB mannequin */}
        <group position={[0, -1, 0]}>
          <ApparelOverlay metadata={metadata} />
        </group>
      </group>
    );
  } catch (err) {
    if (onError) onError();
    return null;
  }
}

// ── MODEL CONTAINER SWITCHBOARD ─────────────────────────────────────────────
function ModelContainer({ hasError, setHasError, metadata }) {
  const modelUrl = '/model/mannequin.glb';

  if (hasError) {
    return <ProceduralMannequin metadata={metadata} />;
  }

  return (
    <Suspense fallback={<ProceduralMannequin metadata={metadata} />}>
      <MannequinModel 
        url={modelUrl} 
        metadata={metadata}
        onError={() => setHasError(true)} 
      />
    </Suspense>
  );
}

// ── AUTO ROTATION SYSTEM ────────────────────────────────────────────────────
function AutoRotatingGroup({ children }) {
  const groupRef = React.useRef();

  React.useEffect(() => {
    let animationFrameId;
    const animate = () => {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.006;
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <group ref={groupRef}>{children}</group>;
}

// ── MAIN PRODUCT3D EXPORT ───────────────────────────────────────────────────
export default function Product3D({ product }) {
  const [hasError, setHasError] = useState(false);
  const metadata = getProduct3DMetadata(product);

  useEffect(() => {
    fetch('/model/mannequin.glb', { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) setHasError(true);
      })
      .catch(() => setHasError(true));
  }, []);

  return (
    <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-xl flex items-center justify-center">
      
      {/* Premium ambient studio backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 pointer-events-none" />
      
      <Canvas
        shadows
        camera={{ position: [0, 0.35, 2.6], fov: 40 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#ffffff']} />

        {/* 💡 PERFECT LUXURY LIGHTING */}
        <ambientLight intensity={0.7} />
        
        {/* Soft, beautiful main lighting */}
        <directionalLight
          castShadow
          position={[5, 8, 5]}
          intensity={1.3}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />

        {/* Dynamic fill light */}
        <directionalLight
          position={[-5, 4, -2]}
          intensity={0.65}
          color="#f3f4f6"
        />

        {/* Studio spotlight */}
        <pointLight
          position={[0, 6, -5]}
          intensity={1.2}
          color="#ffffff"
        />

        {/* Premium environment reflections */}
        <Environment preset="studio" />

        <Center>
          <AutoRotatingGroup>
            <ModelContainer hasError={hasError} setHasError={setHasError} metadata={metadata} />
          </AutoRotatingGroup>
        </Center>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.8}
          maxDistance={3.8}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.75}
          makeDefault
        />
      </Canvas>

      {/* Dynamic Clothing Status Badge overlay */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 border border-slate-100 shadow-md backdrop-blur-sm pointer-events-none select-none text-[9px] uppercase tracking-widest font-bold text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
        Draped: {metadata?.name || 'Streetwear Fit'}
      </div>
    </div>
  );
}
