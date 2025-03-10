import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export default function Model() {
  const { scene } = useGLTF("/assets/gltf/ParkScene/Scene.gltf");
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  return <primitive object={scene} scale={1} />;
}
