'use client';

import React from 'react';
import { Zap, Loader2 } from 'lucide-react';

const AIModeProgress: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-green-500/20 rounded-full">
            <Zap className="w-12 h-12 text-green-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-green-400">
          ⚡ AI Mode - Automated Generation
        </h2>
        <p className="text-center text-gray-400 mb-8">
          AI is analyzing your prompt and generating an optimized super prompt...
        </p>

        <div className="space-y-4">
          {/* Step 1: Analyzing */}
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
            <span className="text-green-400">
              Analyzing prompt and generating clarifying questions
            </span>
          </div>

          {/* Step 2: Auto-filling */}
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
            <span className="text-green-400">
              Auto-filling context with intelligent answers
            </span>
          </div>

          {/* Step 3: Generating */}
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
            <span className="text-green-400">
              Creating optimized super prompt
            </span>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          This usually takes ~20-30 seconds
        </div>
      </div>
    </div>
  );
};

export default AIModeProgress;
