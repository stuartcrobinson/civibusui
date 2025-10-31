import React, { useState, useEffect } from 'react';

// Special candidate links for those without proper State Board IDs
const SPECIAL_CANDIDATE_LINKS = {
  'Chelsea Cook': 'https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/Cook_Chelsea/',
  'Anjanee Bell': 'https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/Bell_Anjanee/',
  'Shanetta Burris': 'https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/Burris_Shanetta/'
};

const DURHAM_CANDIDATE_IMAGES = {
  'Matt Kopac': '/img/kopac.jpeg',
  'Leonardo (Leo) Williams': '/img/leowilliams.jpeg',
  'Diana Medoff': '/img/diana.png',
  'DeDreana Freeman': '/img/dedreana.png',
  'Mark-Anthony Middleton': '/img/MAM.jpeg',
  'Elijah King': '/img/elijah.jpeg',
  'Andrea Cazales': '/img/andrea.jpeg',
  'Anjanee Bell': '/img/anjanee.jpeg',
  'Terry McCann': '/img/terry-mccann.jpeg',
  'Chelsea Cook': '/img/chelseacook.jpeg',
  'Shanetta Burris': '/img/shanetta.jpeg'
};

// Position hierarchy for sorting contests
const POSITION_HIERARCHY = {
  'Mayor': 1,
  'City Council': 2,
  'Council': 2
};

function getPositionSortValue(position) {
  return POSITION_HIERARCHY[position] || 999;
}

function compareContests(a, b) {
  const aPos = getPositionSortValue(a.position);
  const bPos = getPositionSortValue(b.position);
  
  if (aPos !== bPos) {
    return aPos - bPos;
  }
  
  if (a.subregion_value && b.subregion_value) {
    const aNum = parseInt(a.subregion_value.match(/\d+/)?.[0]);
    const bNum = parseInt(b.subregion_value.match(/\d+/)?.[0]);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    
    return a.subregion_value.localeCompare(b.subregion_value);
  }
  
  if (a.subregion_value) return 1;
  if (b.subregion_value) return -1;
  
  return 0;
}

function CandidateFinancialDetails({ topDonors, topExpenditures, topSpendingByRecipient, mutedCandidates, allCandidates }) {
  const [expandedSections, setExpandedSections] = useState({});

  // Initialize all sections as expanded
  useEffect(() => {
    const initialExpanded = {};
    allCandidates.forEach(candidate => {
      if (!mutedCandidates.has(candidate.name)) {
        initialExpanded[`${candidate.name}-donors`] = true;
        initialExpanded[`${candidate.name}-expenditures`] = true;
        initialExpanded[`${candidate.name}-spending`] = true;
      }
    });
    setExpandedSections(initialExpanded);
  }, [allCandidates, mutedCandidates]);

  const toggleSection = (candidateName, section) => {
    const key = `${candidateName}-${section}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSectionExpanded = (candidateName, section) => {
    const key = `${candidateName}-${section}`;
    return expandedSections[key] || false;
  };

  const formatDollars = (val) => {
    if (!val) return '$0';
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Group candidates by contest using candidate data directly
  const candidatesByContest = {};
  
  allCandidates.forEach(candidate => {
    if (mutedCandidates.has(candidate.name)) return;
    
    // Use the candidate's own position/subregion data
    const contestKey = candidate.subregion_value 
      ? `${candidate.position} ${candidate.subregion_value}`
      : candidate.position;
    
    if (!candidatesByContest[contestKey]) {
      candidatesByContest[contestKey] = [];
    }
    candidatesByContest[contestKey].push(candidate);
  });

  const getCandidateDonors = (candidateName) => {
    return topDonors
      .filter(d => d.candidate_name === candidateName && d.donor_name)
      .sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
  };

  const getCandidateExpenditures = (candidateName) => {
    return topExpenditures
      .filter(e => e.candidate_name === candidateName && e.recipient_name)
      .sort((a, b) => (b.amount || 0) - (a.amount || 0));
  };

  const getCandidateSpendingByRecipient = (candidateName) => {
    return topSpendingByRecipient
      .filter(s => s.candidate_name === candidateName && s.recipient_name)
      .sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
  };

  const getCandidateLink = (candidateName) => {
    if (SPECIAL_CANDIDATE_LINKS[candidateName]) {
      return SPECIAL_CANDIDATE_LINKS[candidateName];
    }
    
    const donorRecord = topDonors.find(d => d.candidate_name === candidateName);
    if (donorRecord?.sboe_id && donorRecord?.org_group_id) {
      return `https://cf.ncsbe.gov/CFOrgLkup/DocumentGeneralResult/?SID=${donorRecord.sboe_id}&OGID=${donorRecord.org_group_id}`;
    }
    
    return null;
  };

  // Sort contests using the same hierarchy as bar charts
  const sortedContests = Object.entries(candidatesByContest).map(([contestName, candidates]) => {
    const donorRecord = topDonors.find(d => d.candidate_name === candidates[0].name);
    return {
      contestName,
      candidates,
      position: donorRecord?.position,
      subregion_value: donorRecord?.subregion_value
    };
  }).sort(compareContests);

  return (
    <div className="space-y-8">
      {sortedContests.map(({ contestName, candidates }) => {
        return (
          <div key={contestName}>
            <div className="flex items-center gap-4 mb-4">
              <span className="inline-block text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded">
                {contestName}
              </span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            </div>

            <div className="space-y-6">
              {candidates.map(candidate => {
                const candidateName = candidate.name;
                const donors = getCandidateDonors(candidateName);
                const expenditures = getCandidateExpenditures(candidateName);
                const spendingByRecipient = getCandidateSpendingByRecipient(candidateName);
                const imageUrl = DURHAM_CANDIDATE_IMAGES[candidateName];
                const hasData = donors.length > 0 || expenditures.length > 0 || spendingByRecipient.length > 0;

                return (
                  <div key={candidateName} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    {/* Candidate Header */}
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          alt={candidateName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      {getCandidateLink(candidateName) ? (
                        <a 
                          href={getCandidateLink(candidateName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:underline"
                        >
                          {candidateName}
                        </a>
                      ) : (
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {candidateName}
                        </h3>
                      )}
                    </div>

                    {!hasData ? (
                      <div className="py-8 text-center">
                        <p className="text-sm italic text-gray-500 dark:text-gray-400">
                          data not found
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Top Donors Section */}
                        <div className="mb-4">
                          <button
                            onClick={() => toggleSection(candidateName, 'donors')}
                            className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              Top 10 Donors
                            </span>
                            <svg 
                              className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${
                                isSectionExpanded(candidateName, 'donors') ? 'rotate-180' : ''
                              }`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isSectionExpanded(candidateName, 'donors') && (
                            <div className="mt-2 overflow-x-auto">
                              {donors.length > 0 ? (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Donor</th>
                                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Total</th>
                                      <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Transactions</th>
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Profession</th>
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Employer</th>
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Location</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {donors.map((donor, idx) => (
                                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="py-1.5 px-2 text-gray-900 dark:text-gray-100">{donor.donor_name}</td>
                                        <td className="py-1.5 px-2 text-right font-medium text-gray-900 dark:text-gray-100">
                                          {formatDollars(donor.total_amount)}
                                        </td>
                                        <td className="py-1.5 px-2 text-center text-gray-700 dark:text-gray-300 text-xs">
                                          {donor.donation_count || 1}
                                        </td>
                                        <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300 text-xs">
                                          {donor.profession || '—'}
                                        </td>
                                        <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300 text-xs">
                                          {donor.employer || '—'}
                                        </td>
                                        <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300 text-xs">
                                          {donor.city && donor.state ? `${donor.city}, ${donor.state}` : '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                                  No donor data available
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Top Individual Expenditures Section */}
                        <div className="mb-4">
                          <button
                            onClick={() => toggleSection(candidateName, 'expenditures')}
                            className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              Top 10 Individual Expenditures
                            </span>
                            <svg 
                              className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${
                                isSectionExpanded(candidateName, 'expenditures') ? 'rotate-180' : ''
                              }`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isSectionExpanded(candidateName, 'expenditures') && (
                            <div className="mt-2 overflow-x-auto">
                              {expenditures.length > 0 ? (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Recipient</th>
                                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Purpose</th>
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expenditures.map((exp, idx) => (
                                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="py-1.5 px-2 text-gray-900 dark:text-gray-100">{exp.recipient_name}</td>
                                        <td className="py-1.5 px-2 text-right font-medium text-gray-900 dark:text-gray-100">
                                          {formatDollars(exp.amount)}
                                        </td>
                                        <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300 text-xs">
                                          {exp.purpose || exp.description || '—'}
                                        </td>
                                        <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300 text-xs">
                                          {exp.date ? new Date(exp.date).toLocaleDateString() : '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                                  No expenditure data available
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Top Spending by Recipient Section */}
                        <div>
                          <button
                            onClick={() => toggleSection(candidateName, 'spending')}
                            className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              Top 10 Spending by Recipient
                            </span>
                            <svg 
                              className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${
                                isSectionExpanded(candidateName, 'spending') ? 'rotate-180' : ''
                              }`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isSectionExpanded(candidateName, 'spending') && (
                            <div className="mt-2 overflow-x-auto">
                              {spendingByRecipient.length > 0 ? (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Recipient</th>
                                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Total</th>
                                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Sample Purpose</th>
                                      <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Transactions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {spendingByRecipient.map((spending, idx) => (
                                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="py-1.5 px-2 text-gray-900 dark:text-gray-100">{spending.recipient_name}</td>
                                        <td className="py-1.5 px-2 text-right font-medium text-gray-900 dark:text-gray-100">
                                          {formatDollars(spending.total_amount)}
                                        </td>
                                        <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300 text-xs">
                                          {spending.sample_purpose || '—'}
                                        </td>
                                        <td className="py-1.5 px-2 text-center text-gray-700 dark:text-gray-300 text-xs">
                                          {spending.transaction_count}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                                  No spending data available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CandidateFinancialDetails;