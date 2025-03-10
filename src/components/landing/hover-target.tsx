import { useState } from "react";
import * as THREE from "three";

const hoverTargets: {
  name: string;
  position: [number, number, number];
  zoomPosition: [number, number, number];
  zoomRotation: [number, number, number];
}[] = [
  {
    name: "Restaurant",
    position: [50, 20, 21],
    zoomPosition: [50, 30, 21],
    zoomRotation: [-Math.PI / 4, Math.PI / 6, 0],
  },
  {
    name: "Customer",
    position: [0, 20, 0],
    zoomPosition: [0, 30, 10],
    zoomRotation: [-Math.PI / 6, 0, 0],
  },
  {
    name: "Staff",
    position: [-10, 20, -40],
    zoomPosition: [-10, 30, -30],
    zoomRotation: [-Math.PI / 6, -Math.PI / 8, 0],
  },
  {
    name: "Ride",
    position: [40, 35, -30],
    zoomPosition: [30, 50, -20],
    zoomRotation: [-Math.PI / 3, Math.PI / 5, 0],
  },
  {
    name: "Store",
    position: [-35, 20, 31],
    zoomPosition: [-35, 35, 40],
    zoomRotation: [-Math.PI / 5, -Math.PI / 4, 0],
  },
];

export default function HoverTarget({
  setHovered,
  setSelectedTarget,
  setSelectedInfo,
  size = 2,
}: {
  setHovered: React.Dispatch<
    React.SetStateAction<{
      name: string;
      screenPosition: [number, number];
    } | null>
  >;
  setSelectedTarget: React.Dispatch<
    React.SetStateAction<{
      position: THREE.Vector3;
      rotation: THREE.Euler;
    } | null>
  >;
  setSelectedInfo: React.Dispatch<
    React.SetStateAction<{ name: string; description: string } | null>
  >;
  size?: number;
}) {
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  return (
    <group>
      {hoverTargets.map((target, index) => {
        const targetPosition = new THREE.Vector3(...target.position);
        const zoomPosition = new THREE.Vector3(...target.zoomPosition);
        const zoomRotation = new THREE.Euler(...target.zoomRotation);

        return (
          <mesh
            key={index}
            position={targetPosition}
            onPointerEnter={(event) => {
              event.stopPropagation();
              setHovered({
                name: target.name,
                screenPosition: [event.clientX, event.clientY],
              });
              setHoveredObject(target.name);
            }}
            onPointerLeave={() => {
              setHovered(null);
              setHoveredObject(null);
            }}
            onClick={() => {
              setSelectedTarget({
                position: zoomPosition,
                rotation: zoomRotation,
              });
              setSelectedInfo({
                name: target.name,
                description: `This is the ${target.name} area in the park.`,
              });
            }}
            name={target.name}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
              color={hoveredObject === target.name ? "blue" : "red"}
              emissive={hoveredObject === target.name ? "blue" : "black"}
            />
          </mesh>
        );
      })}
    </group>
  );
}
