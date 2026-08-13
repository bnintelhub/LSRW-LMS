import { motion } from "framer-motion";

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          className="h-28 rounded-2xl bg-slate-200"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: index * 0.08 }}
        />
      ))}
    </div>
  );
}
