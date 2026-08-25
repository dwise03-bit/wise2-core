import React, { useState } from 'react';

interface Asset {
  id: string;
  name: string;
  brand: string;
  type: 'logo' | 'reference' | 'approved' | 'template';
  thumbnail?: string;
}

export function AssetLibraryBrowser() {
  const [selectedBrand, setSelectedBrand] = useState('wise2-core');

  const assets: Asset[] = [
    {
      id: '1',
      name: 'WISE² Core Logo',
      brand: 'wise2-core',
      type: 'logo',
    },
    {
      id: '2',
      name: 'HVAC Reference - Diagnostic UI',
      brand: 'wise2-hvac',
      type: 'reference',
    },
    {
      id: '3',
      name: 'Defense Team Training Template',
      brand: 'wise-defense',
      type: 'template',
    },
    {
      id: '4',
      name: 'HVAC Commercial - Approved Frame',
      brand: 'wise2-hvac',
      type: 'approved',
    },
  ];

  const brands = ['wise2-core', 'wise2-hvac', 'wise-defense', 'wise2-soundlab'];
  const filtered = assets.filter((a) => a.brand === selectedBrand);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <span className="text-2xl">🎨</span>
          Asset Library
        </h2>

        {/* Brand Filter */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-3">Filter by Brand</p>
          <div className="flex gap-2 flex-wrap">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedBrand === brand
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {brand === 'wise2-core' && '⚙️ WISE² Core'}
                {brand === 'wise2-hvac' && '❄️ WISE² HVAC'}
                {brand === 'wise-defense' && '🛡️ WISE Defense'}
                {brand === 'wise2-soundlab' && '🎵 SoundLab'}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.length > 0 ? (
            filtered.map((asset) => (
              <div
                key={asset.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors cursor-pointer hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-900 rounded mb-3 flex items-center justify-center border border-slate-600">
                  <span className="text-3xl">
                    {asset.type === 'logo' && '📌'}
                    {asset.type === 'reference' && '🖼️'}
                    {asset.type === 'approved' && '✅'}
                    {asset.type === 'template' && '📋'}
                  </span>
                </div>

                <h3 className="font-medium text-slate-100 text-sm mb-1 line-clamp-2">
                  {asset.name}
                </h3>

                <div className="flex items-center justify-between mt-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      asset.type === 'logo'
                        ? 'bg-purple-500/20 text-purple-300'
                        : asset.type === 'reference'
                          ? 'bg-blue-500/20 text-blue-300'
                          : asset.type === 'approved'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {asset.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-400">
              <p>No assets found for this brand</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <span className="text-2xl">📤</span>
          Upload New Asset
        </h3>

        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-slate-300 font-medium">Drag and drop files here</p>
          <p className="text-slate-500 text-sm">or click to select</p>
        </div>
      </div>
    </div>
  );
}
