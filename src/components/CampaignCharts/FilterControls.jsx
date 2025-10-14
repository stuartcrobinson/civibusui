import React from 'react';

// Reusable Filter Controls Component
export default function FilterControls({
    data,
    activeFilter,
    hoveredFilter,
    onFilterClick,
    onFilterHover,
    isInactive = false
}) {
    const POSITION_ORDER = ['mayor', 'city council'];

    const filterStructure = { positions: {} };
    data.forEach(item => {
        const pos = item.position || 'Other';
        if (!filterStructure.positions[pos]) {
            filterStructure.positions[pos] = { subregions: new Set() };
        }
        if (item.subregion_value) {
            filterStructure.positions[pos].subregions.add(item.subregion_value);
        }
    });

    const sortedPositions = Object.keys(filterStructure.positions).sort((a, b) => {
        const indexA = POSITION_ORDER.indexOf(a.toLowerCase());
        const indexB = POSITION_ORDER.indexOf(b.toLowerCase());

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });
    console.log('FilterControls sortedPositions:', sortedPositions);
    const filterOptions = [{ id: 'all', label: 'All', type: 'all' }];
    sortedPositions.forEach(position => {
        const posData = filterStructure.positions[position];
        filterOptions.push({ id: position, label: position, type: 'position' });
        if (posData.subregions.size > 0) {
            Array.from(posData.subregions).sort().forEach(subregion => {
                filterOptions.push({
                    id: `${position}:${subregion}`,
                    label: subregion,
                    type: 'subregion',
                    parentPosition: position
                });
            });
        }
    });

    return (
        <div className="flex flex-wrap gap-2 items-baseline">
            {filterOptions.map((filter, idx) => {
                const isActive = activeFilter === filter.id;
                const isHovered = hoveredFilter === filter.id;
                const shouldShowSeparator = filter.type === 'subregion' &&
                    idx > 0 &&
                    filterOptions[idx - 1].type === 'position';

                return (
                    <React.Fragment key={filter.id}>
                        {shouldShowSeparator && (
                            <span className="text-gray-400 dark:text-gray-600 mx-1">(</span>
                        )}
                        <button
                            onClick={() => onFilterClick(filter.id)}
                            onMouseEnter={() => onFilterHover && onFilterHover(filter.id)}
                            onMouseLeave={() => onFilterHover && onFilterHover(null)}
                            className={`
                px-2 py-1 rounded transition-all duration-200 cursor-pointer
                ${isActive
                                    ? 'font-bold text-gray-900 dark:text-gray-100'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }
                ${!isActive && !isHovered ? 'opacity-70' : 'opacity-100'}
                ${isInactive ? 'opacity-40' : ''}
              `}
                        >
                            {filter.label}
                        </button>
                        {filter.type === 'subregion' &&
                            idx < filterOptions.length - 1 &&
                            filterOptions[idx + 1].parentPosition === filter.parentPosition && (
                                <span className="text-gray-400 dark:text-gray-600">,</span>
                            )}
                        {filter.type === 'subregion' &&
                            idx < filterOptions.length - 1 &&
                            filterOptions[idx + 1].parentPosition !== filter.parentPosition && (
                                <span className="text-gray-400 dark:text-gray-600 mx-1">)</span>
                            )}
                        {filter.type === 'subregion' &&
                            idx === filterOptions.length - 1 && (
                                <span className="text-gray-400 dark:text-gray-600 mx-1">)</span>
                            )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}