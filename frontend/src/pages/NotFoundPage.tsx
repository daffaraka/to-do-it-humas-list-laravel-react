import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
      <div className="bg-bgSecondary border border-borderBase p-12 rounded-3xl shadow-2xl flex flex-col items-center max-w-lg w-full">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-6xl font-bold text-textPrimary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-textSecondary mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-textSecondary/80 mb-8 max-w-sm">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link 
          to="/" 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
        >
          <Home size={20} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
