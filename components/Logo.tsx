import { Layers } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-black dark:bg-white p-1 rounded-md">
        <Layers className="text-white dark:text-black w-6 h-6" />
      </div>
      <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">OPUS</span>
    </div>
  );
}
