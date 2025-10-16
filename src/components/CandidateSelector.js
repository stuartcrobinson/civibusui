import React from 'react';

function CandidateSelector({ candidates, mutedCandidates, onToggleCandidate }) {
  if (!candidates || candidates.length === 0) return null;

  const allMuted = candidates.length > 0 && mutedCandidates.size === candidates.length;
  const someMuted = mutedCandidates.size > 0 && mutedCandidates.size < candidates.length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Candidates to Hide/Display:
        </div>
        {someMuted && (
          <button
            onClick={() => candidates.forEach(c => mutedCandidates.has(c.name) && onToggleCandidate(c.name))}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Show All
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {candidates.map((candidate) => {
          const isMuted = mutedCandidates.has(candidate.name);
          return (
            <button
              key={candidate.name}
              onClick={() => onToggleCandidate(candidate.name)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isMuted 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-50' 
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                }
              `}
            >
              {candidate.name}
              {candidate.party && (
                <span className="ml-1 text-xs opacity-75">({candidate.party})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CandidateSelector;