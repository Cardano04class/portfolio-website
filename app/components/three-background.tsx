"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function ThreeBackground() {
    return (
        <div className="fixed inset-0 -z-10 opacity-40">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars radius={100} depth={50} count={1500} factor={4} fade speed={0.5} />
            </Canvas>
        </div>
    );
}

