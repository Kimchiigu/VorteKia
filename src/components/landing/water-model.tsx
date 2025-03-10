import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export default function WaterModel() {
  const { scene } = useGLTF("/assets/gltf/WaterJapan/WaterJapan.gltf");
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = false;
      obj.receiveShadow = true;
    }
  });
  return <primitive object={scene} scale={1} position={[-70, -5, 10]} />;
}
