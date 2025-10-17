import React from 'react';
import Header from './Header';
import Footer from './Footer';

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Methodology
        </h1>
        
        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          {/* Overview */}
          <section>
            <p className="text-lg mb-4">
              Civibus compiles and analyzes campaign finance data from North Carolina's 
              municipal elections using reports filed with state and county election boards. 
              This page explains our data sources, collection methods, and analytical approaches.
            </p>
          </section>

          {/* Data Sources */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Data Sources
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
              Primary Sources
            </h3>
            <p className="mb-4">
              We rely primarily on electronic campaign finance reports filed with the 
              North Carolina State Board of Elections (NCSBE). These reports are filed 
              periodically by candidate committees according to{' '}
              <a 
                href="https://www.ncsbe.gov/campaign-finance/reporting-schedules/municipal-election-reporting-schedule"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                mandatory reporting schedules
              </a>.
            </p>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="font-semibold mb-2">Key Data Systems:</p>
              <ul className="space-y-2 text-sm">
                <li>
                  • <a 
                      href="https://cf.ncsbe.gov/CFOrgLkup"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                    NCSBE Campaign Finance Organization Lookup
                  </a> - Electronic filings database
                </li>
                <li>
                  • <a 
                      href="https://cf.ncsbe.gov/CFDocLkup"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                    NCSBE Campaign Finance Document Lookup
                  </a> - PDF filing repository
                </li>
                <li>
                  • <a 
                      href="https://www.ncsbe.gov/results-data/candidate-lists"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                    NCSBE Candidate Lists
                  </a> - Official candidate information
                </li>
                <li>
                  • County Board of Elections FTP servers (e.g.,{' '}
                  <a 
                      href="https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                    Durham County
                  </a>) - PDF filings for county-only candidates
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
              Manual Tabulation
            </h3>
            <p className="mb-4">
              Some candidates file only PDF reports with their county boards rather than 
              electronic reports with the state. Occasionally, we manually extract and 
              tabulate data from PDF forms.
            </p>
            <p className="mb-4">
              <strong>Important:</strong> Manual tabulation is performed only at the specific 
              request of journalists working on stories. It is not part of our standard data 
              collection process for all races. This ensures our limited resources support 
              active reporting needs.
            </p>
          </section>

          {/* Data Collection Process */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Data Collection Process
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  1. Candidate Identification
                </h3>
                <p>
                  We identify candidates from official NCSBE candidate lists and match them 
                  to their campaign committees using State Board IDs and committee names.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  2. Report Retrieval
                </h3>
                <p>
                  We systematically download available campaign finance reports for each 
                  identified committee.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  3. Data Structuring
                </h3>
                <p>
                  Raw filing data is structured into standardized formats covering:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Committee information (name, candidate, registration details)</li>
                  <li>Receipts (contributions, dates, donor information)</li>
                  <li>Expenditures (payments, dates, recipient information, purposes)</li>
                  <li>Cash on hand figures</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  4. Data Enhancement
                </h3>
                <p>
                  We enrich the raw data by:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Categorizing donor locations (in-city, in-state, out-of-state)</li>
                  <li>Classifying contribution sizes into standard brackets</li>
                  <li>Identifying industry affiliations based on donor employment information</li>
                  <li>Calculating cumulative totals and timelines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Industry Classification */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Industry Classification
            </h2>
            <p className="mb-4">
              We categorize donors by industry based on employer and occupation information 
              provided in campaign finance reports. Our classification system was developed 
              specifically for North Carolina municipal races, focusing on industries with 
              significant presence in local politics.
            </p>
            <p className="mb-4">
              Currently, our primary industry analysis focuses on real estate-affiliated 
              donors (including developers, real estate professionals, construction companies, 
              and related businesses). This reflects real estate's prominent role in local 
              development and zoning decisions.
            </p>
          </section>
{/* Data Coverage */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Data Coverage
            </h2>
            <p className="mb-4">
              We compile and present campaign finance reports filed according to the{' '}
              <a 
                href="https://www.ncsbe.gov/campaign-finance/reporting-schedules/municipal-election-reporting-schedule"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                municipal election reporting schedule
              </a>. Our database reflects the reports that have been filed with the state.
            </p>
            <p>
              North Carolina campaign finance law includes a{' '}
              <a 
                href="https://www.ncsbe.gov/campaign-finance/penalties"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                penalty schedule
              </a> for late or missing filings.
            </p>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Limitations & Considerations
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Data Completeness
                </h3>
                <p>
                  Our data reflects what candidates have filed. Missing or late 
                  reports result in gaps in our coverage.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Self-Reported Information
                </h3>
                <p>
                  Donor occupation and employer information is self-reported on contribution 
                  forms. We present this data as candidates have reported it.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Timing
                </h3>
                <p>
                  Our data is current as of the most recent filings we've processed. The 
                  "Last updated" date on each race page indicates when we last refreshed that 
                  race's data.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  PDF Tabulation Accuracy
                </h3>
                <p>
                  When manually tabulating PDF reports, we take care to transcribe accurately, 
                  but human error is possible. We prioritize electronic data sources specifically 
                  to minimize this risk.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MethodologyPage;