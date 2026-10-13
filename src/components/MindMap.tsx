import React, { useState } from 'react';
import {
  MindMapData,
  MindMapNode,
  MindMapNodeState,
  LanguageMode,
} from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MindMapProps {
  data: MindMapData;
  languageMode: LanguageMode;
  onSelectNode?: (nodeId: string) => void;
  activeNodeId?: string;
}

export const MindMap: React.FC<MindMapProps> = ({
  data,
  languageMode,
  onSelectNode,
  activeNodeId,
}) => {
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(
    data.nodes.find((n) => n.id === activeNodeId) || data.nodes[0] || null
  );

  const getNodeStateStyle = (state: MindMapNodeState) => {
    switch (state) {
      case 'mastered':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800',
          icon: CheckCircle2,
          color: '#10b981',
          label: 'Mastered',
        };
      case 'needs_review':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-950',
          badge: 'bg-rose-100 text-rose-800',
          icon: AlertTriangle,
          color: '#f43f5e',
          label: 'Needs Review',
        };
      case 'learning':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          badge: 'bg-amber-100 text-amber-800',
          icon: TrendingUp,
          color: '#f59e0b',
          label: 'In Learning',
        };
      case 'available':
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-950',
          badge: 'bg-indigo-100 text-indigo-800',
          icon: Sparkles,
          color: '#6366f1',
          label: 'Available',
        };
      case 'not_started':
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          badge: 'bg-slate-100 text-slate-600',
          icon: Lock,
          color: '#94a3b8',
          label: 'Locked',
        };
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Brain className="w-5 h-5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              Concept Mind Map & Dependency Graph
            </h4>
            <p className="text-xs text-slate-400 font-telugu">
              భావనల పటం & అవగాహన పురోగతి
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Learning
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Review
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Next
          </span>
        </div>
      </div>

      {/* Visual Interactive Node Tree */}
      <div className="py-5">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-3 flex-wrap">
          {data.nodes.map((node, idx) => {
            const stateStyle = getNodeStateStyle(node.state);
            const Icon = stateStyle.icon;
            const isSelected = selectedNode?.id === node.id;

            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNode(node);
                    if (onSelectNode) onSelectNode(node.id);
                  }}
                  className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 min-w-[210px] max-w-[260px] group focus:outline-hidden focus:ring-2 focus:ring-amber-400 ${
                    isSelected
                      ? 'ring-2 ring-amber-400 shadow-lg scale-102 bg-white text-slate-900 border-amber-400'
                      : 'bg-slate-800/90 hover:bg-slate-800 text-slate-100 border-slate-700'
                  }`}
                  aria-label={`Concept Node: ${node.labelEn}, Status: ${node.state}, Mastery: ${node.masteryPercent}%`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-slate-900 text-white' : stateStyle.badge
                      }`}
                    >
                      {stateStyle.label}
                    </span>
                    <Icon className="w-4 h-4 text-amber-500" />
                  </div>

                  <p className="font-bold text-xs sm:text-sm leading-snug line-clamp-1">
                    {languageMode === 'te' ? node.labelTe : node.labelEn}
                  </p>
                  {languageMode === 'bilingual' && (
                    <p className="text-[11px] font-telugu text-slate-400 mt-0.5 truncate">
                      {node.labelTe}
                    </p>
                  )}

                  {/* Node Mastery Mini Bar */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Mastery:</span>
                    <span className="font-bold text-amber-400">
                      {node.masteryPercent}%
                    </span>
                  </div>
                </button>

                {/* Edge arrow between sequential nodes */}
                {idx < data.nodes.length - 1 && (
                  <div className="text-slate-600 hidden md:block">
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Accessible Text Alternative Drawer */}
      {selectedNode && (
        <div className="mt-2 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Focused Concept:</strong> {selectedNode.labelEn} (
              {selectedNode.labelTe}) • Mastery: {selectedNode.masteryPercent}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Prerequisite to next learning tier
          </span>
        </div>
      )}
    </div>
  );
};
