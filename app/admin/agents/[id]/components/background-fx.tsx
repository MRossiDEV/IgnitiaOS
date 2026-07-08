"use client";

import { motion } from "framer-motion";

export function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29371a_1px,transparent_1px),linear-gradient(to_bottom,#1f29371a_1px,transparent_1px)] bg-[size:36px_36px]" />

      <motion.div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#2D6BFF33] blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-0 top-40 h-80 w-80 rounded-full bg-[#5BC0FF22] blur-3xl"
        animate={{ x: [0, -35, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {Array.from({ length: 20 }).map((_, idx) => (
        <motion.span
          key={idx}
          className="absolute h-1 w-1 rounded-full bg-cyan-300/70"
          style={{
            left: `${(idx * 11) % 100}%`,
            top: `${(idx * 17) % 100}%`,
          }}
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3 + (idx % 5), repeat: Infinity, delay: idx * 0.1 }}
        />
      ))}
    </div>
  );
}

export default BackgroundFX;
