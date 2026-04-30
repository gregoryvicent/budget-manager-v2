"use client";

import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
      <Image src="/mubu_icon_03.png" alt="Mubu" width={80} height={80} className="mb-6" />
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        Sin conexión
      </h1>
      <p className="mt-4 max-w-md text-gray-400">
        Parece que no tienes conexión a internet. Verifica tu conexión e intenta
        de nuevo.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-500 transition-colors min-h-[44px] min-w-[44px]"
      >
        Reintentar
      </button>
    </div>
  );
}
