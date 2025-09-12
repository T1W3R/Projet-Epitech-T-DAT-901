import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";

const EditableObject = ({
  children,
  isEditing,
  isSelected,
  transformMode,
  initialPosition,
  onPositionChange,
  onRotationChange,
  onSelect,
}: {
  children: React.ReactNode;
  isEditing: boolean;
  isSelected: boolean;
  transformMode: "translate" | "rotate" | "scale";
  initialPosition: [number, number, number];
  onPositionChange?: (position: [number, number, number]) => void;
  onRotationChange?: (rotation: [number, number, number]) => void;
  onSelect?: () => void;
}) => {
  const meshRef = useRef<THREE.Group>(null);

  // Initialiser la position au premier render
  useEffect(() => {
    if (meshRef.current && !isEditing) {
      meshRef.current.position.set(...initialPosition);
    }
  }, [initialPosition, isEditing]);

  return (
    <>
      <group
        ref={meshRef}
        position={initialPosition}
        onClick={(e) => {
          e.stopPropagation();
          isEditing && onSelect && onSelect();
        }}
      >
        {children}
      </group>
      {isEditing && isSelected && meshRef.current && (
        <TransformControls
          object={meshRef as React.RefObject<THREE.Object3D>}
          mode={transformMode}
          size={0.8}
          onChange={() => {
            if (meshRef.current) {
              const pos = meshRef.current.position;
              const rot = meshRef.current.rotation;

              // Callback pour mettre à jour les coordonnées
              onPositionChange && onPositionChange([pos.x, pos.y, pos.z]);
              onRotationChange && onRotationChange([rot.x, rot.y, rot.z]);
            }
          }}
        />
      )}
    </>
  );
};

export default EditableObject;