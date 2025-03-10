import { OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraZoom({
  selectedTarget,
}: {
  selectedTarget: { position: THREE.Vector3; rotation: THREE.Euler } | null;
}) {
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);

  useFrame(({ camera }) => {
    if (selectedTarget && cameraRef.current) {
      camera.position.lerp(selectedTarget.position, 0.1);
      camera.rotation.set(
        THREE.MathUtils.lerp(camera.rotation.x, selectedTarget.rotation.x, 0.1),
        THREE.MathUtils.lerp(camera.rotation.y, selectedTarget.rotation.y, 0.1),
        THREE.MathUtils.lerp(camera.rotation.z, selectedTarget.rotation.z, 0.1)
      );
    } else {
      camera.position.lerp(new THREE.Vector3(50, 50, 50), 0.1);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
    camera.updateProjectionMatrix();
  });

  return (
    <OrthographicCamera
      makeDefault
      ref={cameraRef}
      near={0.1}
      far={500}
      position={[50, 50, 50]}
      zoom={8}
    />
  );
}
