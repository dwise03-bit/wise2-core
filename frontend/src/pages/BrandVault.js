import React from "react";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { Vault, FileAudio, Image, FileText, Download } from "lucide-react";
import { toast } from "sonner";

const ASSETS = [
  { id: 1, name: "Urban_Grind_Master.wav", type: "audio", size: "48.2 MB", icon: FileAudio },
  { id: 2, name: "Brand_Logo_Pack.zip", type: "image", size: "12.6 MB", icon: Image },
  { id: 3, name: "Anthem_Lyrics.pdf", type: "doc", size: "220 KB", icon: FileText },
  { id: 4, name: "Royal_Cuisine_Jingle.mp3", type: "audio", size: "6.1 MB", icon: FileAudio },
  { id: 5, name: "Cover_Art_4K.png", type: "image", size: "9.8 MB", icon: Image },
  { id: 6, name: "Stems_Bundle.zip", type: "audio", size: "312 MB", icon: FileAudio },
];

const COLORS = { audio: "text-neon-cyan", image: "text-fuchsia-400", doc: "text-green-400" };

export default function BrandVault() {
  return (
    <PageScaffold icon={Vault} title="Brand Vault" sub="Assets & Deliverables — your creative library"
      actions={<button onClick={() => toast.success("Upload started")} className="btn-neon rounded-lg px-4 py-2 text-sm">Upload Asset</button>}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ASSETS.map((a) => (
          <Card key={a.id} className="flex items-center gap-3" data-testid="vault-asset">
            <div className="w-12 h-12 rounded-lg bg-[#0a1120] border border-[#1a2942] flex items-center justify-center">
              <a.icon className={`w-6 h-6 ${COLORS[a.type]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{a.name}</div>
              <div className="text-[11px] text-slate-500">{a.size}</div>
            </div>
            <button onClick={() => toast(`Downloading ${a.name}`)} className="text-slate-500 hover:text-neon-cyan"><Download className="w-4 h-4" /></button>
          </Card>
        ))}
      </div>
    </PageScaffold>
  );
}
