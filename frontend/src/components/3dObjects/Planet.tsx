import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

type PlanetProps = ThreeElements["mesh"] & {
  textureUrl?: string;
  name: string;
  onClick?: (name: string) => void;
};

const Planet = ({ textureUrl, name, onClick, ...props }: PlanetProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const randomBaseColor = useMemo(() => {
    const hue = Math.random();
    const saturation = 0.6 + Math.random() * 0.3; // 0.6 - 0.9
    const lightness = 0.4 + Math.random() * 0.2; // 0.4 - 0.6
    const color = new THREE.Color().setHSL(hue, saturation, lightness);
    return `#${color.getHexString()}`;
  }, []);

  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }
    let isMounted = true;
    const loader = new THREE.TextureLoader();

    // Résolution de l'URL:
    // - Si c'est un chemin absolu (public/), on l'utilise tel quel
    // - Sinon, on le résout par rapport au module (src/assets/...)
    const resolvedUrl = textureUrl.startsWith("/")
      ? textureUrl
      : new URL(textureUrl, import.meta.url).href;

    loader.load(
      resolvedUrl,
      (tex) => {
        if (!isMounted) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setTexture(tex);
      },
      undefined,
      () => {
        if (!isMounted) return;
        // Échec du chargement: fallback couleur
        setTexture(null);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [textureUrl]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2; // Rotation
    }
  });

  return (
    <mesh
      {...props}
      ref={ref}
      scale={hovered ? 1.2 : 1}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(name);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        map={texture || undefined}
        color={hovered ? "#44f" : randomBaseColor}
        emissive={hovered ? "#224" : "black"}
      />
    </mesh>
  );
};

export type { PlanetProps };
export default Planet;
