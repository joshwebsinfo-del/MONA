import React, { useState, useEffect } from 'react';
import { Sparkles, Download, RefreshCw, ZoomIn, FileCode, Check, Eye } from 'lucide-react';

interface AcademicIllustrationProps {
  concept: string;
  context: string;
  messageId: string;
}

export function AcademicIllustration({ concept, context, messageId }: AcademicIllustrationProps) {
  const [svgStr, setSvgStr] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewCode, setViewCode] = useState<boolean>(false);

  const fetchIllustration = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/research/generate-illustration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept,
          context: context.slice(0, 500), // restrict length for fast context
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an unstable response code');
      }

      const data = await response.json();
      if (data.svg) {
        setSvgStr(data.svg);
      } else {
        throw new Error('Valid vector markup was missing in response');
      }
    } catch (err: any) {
      console.error('Failed to auto-create illustration:', err);
      setError('Context illustration mapping fell back to standard academic schematic.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIllustration();
  }, [concept, messageId]);

  const handleDownloadSVG = () => {
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic-illustration-${concept.replaceAll(' ', '-').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySVG = () => {
    navigator.clipboard.writeText(svgStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id={`ill-box-${messageId}`}
      className="mt-4 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 relative transition-all duration-300 shadow-sm hover:shadow-md"
    >
      {/* Visual Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="p-1 bgColor bg-slate-950 text-white rounded-lg">
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">AI RESEARCH COMPANION DIAGRAM</span>
            <span className="text-[11px] font-bold text-slate-800 tracking-tight lowercase first-letter:uppercase truncate max-w-[200px] md:max-w-xs">{concept}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={fetchIllustration}
            disabled={loading}
            className="p-1 px-1.5 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center space-x-0.5 transition"
            title="Re-draw layout vector schema"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {svgStr && !loading && (
            <>
              <button 
                onClick={() => setZoomed(!zoomed)}
                className={`p-1 px-1.5 hover:bg-slate-200 rounded text-[10px] font-bold flex items-center space-x-0.5 transition ${zoomed ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'text-slate-600'}`}
                title="Toggle enlarged zoom overview"
              >
                <ZoomIn className="w-3 h-3" />
                <span className="hidden sm:inline">Zoom</span>
              </button>

              <button 
                onClick={() => setViewCode(!viewCode)}
                className={`p-1 px-1.5 hover:bg-slate-200 rounded text-[10px] font-bold flex items-center space-x-0.5 transition ${viewCode ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'text-slate-600'}`}
                title="View plain SVG XML code"
              >
                {viewCode ? <Eye className="w-3 h-3" /> : <FileCode className="w-3 h-3" />}
                <span className="hidden sm:inline">{viewCode ? 'Diagram' : 'Code'}</span>
              </button>

              <button 
                onClick={handleDownloadSVG}
                className="p-1 px-1.5 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center space-x-0.5 transition"
                title="Download SVG vector"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Primary Display Pane */}
      <div className={`transition-all duration-300 relative ${zoomed ? 'max-h-[700px] h-auto p-4 md:p-8 bg-slate-900' : 'max-h-[380px] h-[320px] p-2 bg-white'}`}>
        
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/95 p-6 text-center">
            {/* Scientific Blueprint Draft Skeleton */}
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4" />
            
            {/* Pulsing labels */}
            <div className="space-y-1 animate-pulse">
              <h5 className="text-[11.5px] font-bold text-slate-800 uppercase tracking-widest">DRAFTING CONCEPT BLUEPRINT SCHEMA</h5>
              <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto">
                Synthesizing vector paths, nodes, and relational pathways representing "{concept}"...
              </p>
            </div>
            
            {/* Background mockup drawing math overlay */}
            <div className="absolute inset-2 border border-dashed border-slate-200 rounded-lg opacity-40 pointer-events-none flex items-center justify-center font-mono text-[8px] text-slate-300 select-none">
              <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                <span>f(x) = ∫ E·dA</span>
                <span>λ_max = b/T</span>
                <span>H(x) = -∑ p log(p)</span>
                <span>V = R·I</span>
                <span>Δp Δx ≥ ℏ/2</span>
                <span>F = m·a</span>
                <span>e^(iπ) + 1 = 0</span>
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
            <span className="text-xs font-bold text-red-500 block mb-1">ILLUSTRATOR ENGINE BINDING INCIDENT</span>
            <p className="text-[10px] text-slate-500 max-w-sm mb-3">{error}</p>
            <button 
              onClick={fetchIllustration}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 border border-slate-200 rounded-lg transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && svgStr && (
          <div className="w-full h-full flex items-center justify-center overflow-auto">
            {viewCode ? (
              <div className="w-full h-full text-left font-mono text-[10px] text-slate-300 p-4 bg-slate-950 overflow-auto rounded-lg select-all relative">
                <button 
                  onClick={handleCopySVG}
                  className="absolute right-2 top-2 p-1 px-2 rounded bg-slate-800 text-white font-sans text-[10px] font-semibold hover:bg-slate-700 flex items-center space-x-1 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                  <span>{copied ? 'Copied XML!' : 'Copy Code'}</span>
                </button>
                <pre>{svgStr}</pre>
              </div>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgStr }}
              />
            )}
          </div>
        )}
      </div>

      {zoomed && (
        <div className="bg-slate-950 text-[10px] font-mono text-slate-400 px-4 py-1.5 flex justify-between items-center">
          <span>HIGH FIDELITY EXPANDED PRESENTATION LAYER</span>
          <button 
            onClick={() => setZoomed(false)}
            className="text-white font-extrabold hover:underline"
          >
            [Close Zoom]
          </button>
        </div>
      )}
    </div>
  );
}
