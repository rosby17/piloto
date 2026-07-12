"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Play, Settings, Type, Image as ImageIcon, 
  Mic, UserSquare2, Layers, ZoomIn, Maximize, 
  Wand2, Save, Download, Zap, Mic2, Upload, Plus,
  MonitorSmartphone, Shapes, Video, Music, Loader2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AvatarStudio() {
  const router = useRouter();
  
  // State
  const [scriptText, setScriptText] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("Foot Haiti");
  const [selectedVoice, setSelectedVoice] = useState("Foot Haiti (Français)");
  const [selectedEngine, setSelectedEngine] = useState("rogen1");
  const [inputType, setInputType] = useState<"text" | "audio" | "record">("text");
  const [aspectRatio, setAspectRatio] = useState<"landscape" | "portrait">("landscape");
  const [scenes, setScenes] = useState([{ id: 1, text: "" }]);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    try {
      // Pour le moment on appelle notre fausse API qui simule le délai
      const res = await fetch("/api/generate", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        setGeneratedVideoUrl(data.video_url);
      } else {
        toast.error("Erreur: " + data.error);
      }
    } catch (err) {
      toast.error("Une erreur est survenue.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Resizable columns state
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(320);
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  const startResizingLeft = useCallback(() => {
    isResizingLeft.current = true;
  }, []);

  const startResizingRight = useCallback(() => {
    isResizingRight.current = true;
  }, []);

  const stopResizing = useCallback(() => {
    isResizingLeft.current = false;
    isResizingRight.current = false;
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizingLeft.current) {
      setLeftWidth(Math.max(250, Math.min(600, mouseMoveEvent.clientX)));
    } else if (isResizingRight.current) {
      // Right width is calculated from the right edge
      const newWidth = document.body.clientWidth - mouseMoveEvent.clientX - 64; // 64 is the far-right icon bar width
      setRightWidth(Math.max(250, Math.min(600, newWidth)));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="flex flex-col h-screen bg-[#0E0E10] text-gray-200 font-sans overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-white/10 bg-[#18181B] flex items-center justify-between px-4 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div className="h-5 w-[1px] bg-white/10" />
                <h1 className="text-sm font-medium flex items-center gap-2">
                    <span className="text-gray-400">Projets / </span> 
                    <span>Nouvelle Vidéo Rogen</span>
                </h1>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-5 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</>
                    ) : (
                        <><Wand2 className="w-4 h-4" /> Générer</>
                    )}
                </button>
            </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
            
            {/* Left Sidebar - Script & Scenes */}
            <aside 
                style={{ width: leftWidth }}
                className="bg-[#121214] flex flex-col shrink-0 relative z-10 h-full"
            >
                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4 shrink-0">
                    <button 
                        onClick={() => setInputType("text")}
                        className={`text-sm font-medium pb-3 pt-4 border-b-2 transition-colors ${inputType === "text" ? "border-indigo-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                    >
                        Text Script
                    </button>
                    <button 
                        onClick={() => setInputType("audio")}
                        className={`text-sm font-medium pb-3 pt-4 border-b-2 transition-colors ${inputType === "audio" ? "border-indigo-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                    >
                        Audio
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                    {inputType === "text" && scenes.map((scene, index) => (
                        <div key={scene.id} className="bg-[#18181B] rounded-xl border border-white/5 overflow-hidden flex flex-col">
                            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-white/5">
                                <span className="text-xs font-semibold text-gray-400">Scène {index + 1}</span>
                            </div>
                            <textarea 
                                className="w-full h-32 bg-transparent resize-none outline-none text-gray-300 placeholder-gray-600 text-sm leading-relaxed p-3"
                                placeholder="Tapez le texte de votre script ici..."
                                value={scene.text || scriptText}
                                onChange={(e) => {
                                    setScriptText(e.target.value);
                                    const newScenes = [...scenes];
                                    newScenes[index].text = e.target.value;
                                    setScenes(newScenes);
                                }}
                            />
                        </div>
                    ))}

                    {inputType === "audio" && (
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-sm text-gray-400">
                                <Upload className="w-5 h-5" /> Importer un fichier Audio
                            </button>
                            <button className="flex items-center justify-center gap-2 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm text-gray-300">
                                <Mic2 className="w-5 h-5 text-rose-400" /> Enregistrer votre voix
                            </button>
                        </div>
                    )}

                    {inputType === "text" && (
                        <button 
                            onClick={() => setScenes([...scenes, { id: scenes.length + 1, text: "" }])}
                            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/10 hover:border-white/30 text-xs font-medium text-gray-400 hover:text-white transition-colors mt-2"
                        >
                            <Plus className="w-4 h-4" /> Ajouter une scène
                        </button>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 text-xs text-gray-500 flex justify-between bg-[#0E0E10] shrink-0">
                    <span>{scriptText.length} caractères</span>
                    <span>~ {Math.ceil(scriptText.length / 15)} secondes</span>
                </div>

                {/* Left Resizer Handle */}
                <div 
                    onMouseDown={startResizingLeft}
                    className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500/50 transition-colors z-20"
                />
            </aside>

            {/* Center - Preview */}
            <main className="flex-1 bg-[#0E0E10] flex flex-col relative overflow-hidden border-x border-white/10 z-0">
                {/* Format Toggle */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-[#18181B] rounded-lg border border-white/10 p-1 flex items-center gap-1 shadow-xl">
                    <button 
                        onClick={() => setAspectRatio("landscape")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${aspectRatio === "landscape" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <MonitorSmartphone className="w-4 h-4 rotate-90" /> Paysage
                    </button>
                    <button 
                        onClick={() => setAspectRatio("portrait")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${aspectRatio === "portrait" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <MonitorSmartphone className="w-4 h-4" /> Portrait
                    </button>
                </div>

                <div className="flex-1 p-8 pt-20 flex items-center justify-center overflow-hidden">
                    <motion.div 
                        layout
                        className={`relative bg-[#18181B] rounded-xl border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center group ${aspectRatio === "landscape" ? "w-full max-w-4xl aspect-video" : "h-[90%] aspect-[9/16]"}`}
                    >
                        {isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                                <p className="text-sm font-medium text-white animate-pulse">L'IA génère votre vidéo...</p>
                                <p className="text-xs text-gray-500 mt-2">Cela peut prendre quelques minutes</p>
                            </div>
                        ) : generatedVideoUrl ? (
                            <video 
                                src={generatedVideoUrl} 
                                controls 
                                autoPlay
                                className="w-full h-full object-contain bg-black z-10" 
                            />
                        ) : (
                            <>
                                {/* Fake Video Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20" />
                                
                                {/* Mock Avatar Image */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 flex items-end justify-center">
                                     <div className="w-full h-full bg-[url('/avatar.png')] bg-contain bg-bottom bg-no-repeat opacity-90" style={{ maskImage: 'linear-gradient(to top, black 50%, transparent)', WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent)' }} />
                                </div>

                                {/* Bottom controls */}
                                <div className="absolute bottom-4 left-4 right-4 h-12 bg-black/60 backdrop-blur-lg rounded-xl border border-white/10 flex items-center px-4 justify-between">
                                     <div className="flex items-center gap-3">
                                        <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                                            <Play className="w-3 h-3 ml-0.5 fill-current" />
                                        </button>
                                        <div className="text-xs font-mono text-gray-300">00:00 / 00:{(Math.max(1, Math.ceil(scriptText.length / 15))).toString().padStart(2, '0')}</div>
                                     </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Right Sidebar - Settings */}
            <aside 
                style={{ width: rightWidth }}
                className="bg-[#121214] flex flex-col shrink-0 relative z-10 h-full border-r border-white/10"
            >
                {/* Right Resizer Handle */}
                <div 
                    onMouseDown={startResizingRight}
                    className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500/50 transition-colors z-20 -ml-[0.75px]"
                />

                 <div className="h-14 border-b border-white/10 flex items-center px-4 sticky top-0 bg-[#121214] z-10 shrink-0">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <Settings className="w-4 h-4 text-gray-300" /> Avatar & Voice
                    </h2>
                </div>

                <div className="p-5 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* AVATAR SELECTION */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avatar</h3>
                        <button className="w-full p-3 bg-[#18181B] rounded-xl border border-white/10 hover:border-indigo-500/50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[url('/avatar.png')] bg-cover bg-top border border-white/10" />
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-200">{selectedAvatar}</p>
                                    <p className="text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors">Changer d'avatar</p>
                                </div>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-gray-500 rotate-180 group-hover:text-white transition-colors" />
                        </button>
                    </section>

                    {/* VOICE SELECTION */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Voix</h3>
                        <button className="w-full p-3 bg-[#18181B] rounded-xl border border-white/10 hover:border-indigo-500/50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                    <Play className="w-3 h-3 ml-0.5 fill-current" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-200">{selectedVoice}</p>
                                    <p className="text-xs text-gray-500">Masculin • Dynamique</p>
                                </div>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-gray-500 rotate-180 group-hover:text-white transition-colors" />
                        </button>
                    </section>

                    {/* MOTION ENGINE */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Motion Engine</h3>
                        <div className="space-y-2">
                            <div 
                                onClick={() => setSelectedEngine('rogen1')}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedEngine === 'rogen1' ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-[#18181B] border-white/10 hover:border-white/30'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedEngine === 'rogen1' ? 'border-indigo-400' : 'border-gray-600'}`}>
                                        {selectedEngine === 'rogen1' && <div className="w-2 h-2 bg-indigo-400 rounded-full" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">Rogen Engine</p>
                                        <p className="text-xs text-gray-500">Rapide • Visage précis</p>
                                    </div>
                                </div>
                            </div>

                            <div 
                                onClick={() => setSelectedEngine('rogen2')}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedEngine === 'rogen2' ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-[#18181B] border-white/10 hover:border-white/30'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedEngine === 'rogen2' ? 'border-indigo-400' : 'border-gray-600'}`}>
                                        {selectedEngine === 'rogen2' && <div className="w-2 h-2 bg-indigo-400 rounded-full" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">Motion Engine</p>
                                        <p className="text-xs text-gray-500">Mains & Corps entier</p>
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded bg-gradient-to-r from-rose-500/20 to-indigo-500/20 text-indigo-300 font-medium">Pro</span>
                            </div>
                        </div>
                    </section>

                    {/* BACKGROUND */}
                    <section className="space-y-3 pt-4 border-t border-white/10">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avatar Background</h3>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2.5 flex flex-col items-center gap-1 bg-[#18181B] hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-[10px] text-gray-400">Custom</span>
                            </button>
                            <button className="flex-1 py-2.5 flex flex-col items-center gap-1 bg-[#18181B] hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                                <div className="w-4 h-4 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2rV7928GhgYGBgYEAAgwAAdEAg95nI36AAAAAElFTkSuQmCC')] opacity-50" />
                                <span className="text-[10px] text-gray-400">Détourer</span>
                            </button>
                            <button className="flex-1 py-2.5 flex flex-col items-center gap-1 bg-[#18181B] hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                                <div className="w-4 h-4 bg-indigo-500 rounded-sm" />
                                <span className="text-[10px] text-gray-400">Couleur</span>
                            </button>
                        </div>
                    </section>
                    
                    {/* LAYOUT */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout</h3>
                        <div className="flex gap-2 p-1 bg-[#18181B] border border-white/10 rounded-lg">
                            <button className="flex-1 py-1.5 text-xs font-medium bg-white/10 rounded-md text-white">Original</button>
                            <button className="flex-1 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors">Cercle</button>
                        </div>
                    </section>
                </div>
            </aside>

            {/* Far Right 4th Column (Icon Bar) */}
            <aside className="w-16 bg-[#18181B] flex flex-col items-center py-4 shrink-0 h-full border-l border-black/50 z-20">
                <div className="flex flex-col gap-4 w-full px-2">
                    <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <UserSquare2 className="w-5 h-5" />
                        <span className="text-[9px] font-medium">Avatar</span>
                    </button>
                    <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Type className="w-5 h-5" />
                        <span className="text-[9px] font-medium">Text</span>
                    </button>
                    <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Shapes className="w-5 h-5" />
                        <span className="text-[9px] font-medium">Elements</span>
                    </button>
                    <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Music className="w-5 h-5" />
                        <span className="text-[9px] font-medium">Audio</span>
                    </button>
                    <div className="w-full h-[1px] bg-white/10 my-1" />
                    <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Upload className="w-5 h-5" />
                        <span className="text-[9px] font-medium">Assets</span>
                    </button>
                </div>
            </aside>

        </div>
    </div>
  );
}
