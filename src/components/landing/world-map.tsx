import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useEffect } from "react";
import CameraZoom from "./camera-zoom";
import Model from "./map-model";
import WaterModel from "./water-model";
import HoverTarget from "./hover-target";
import HoverTooltip from "./hover-tooltip";
import InfoCard from "./info-card";

export default function WorldMap() {
  const [hovered, setHovered] = useState<{
    name: string;
    screenPosition: [number, number];
  } | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
  } | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<{
    name: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedTarget(null);
        setSelectedInfo(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Canvas shadows onPointerMissed={() => setHovered(null)}>
        <CameraZoom selectedTarget={selectedTarget} />
        <ambientLight intensity={1} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Model />
        <WaterModel />
        <HoverTarget
          setHovered={setHovered}
          setSelectedTarget={setSelectedTarget}
          setSelectedInfo={setSelectedInfo}
          size={2}
        />
        <OrbitControls enableRotate={false} />
      </Canvas>
      <HoverTooltip hovered={hovered} />
      {selectedInfo && (
        <InfoCard info={selectedInfo} onClose={() => setSelectedInfo(null)} />
      )}
    </>
  );
}
