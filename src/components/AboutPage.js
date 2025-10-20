import React from 'react';
import Header from './Header';
import Footer from './Footer';

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          About Civibus
        </h1>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          {/* Mission Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Our Mission
            </h2>
            <p className="mb-4">
              Civibus makes North Carolina campaign finance data accessible and understandable.
              We believe local politics shapes our communities in profound ways, yet critical
              information about campaign funding often remains buried in scattered forms and
              databases.
            </p>
            <p className="mb-4">
              While national campaign finance receives significant attention, local races often
              lack the same scrutiny, even though these are the elections where decisions about
              schools, housing, public safety, and infrastructure are made. By structuring and
              analyzing campaign finance data from North Carolina's municipal and county elections,
              we aim to empower voters, journalists, and researchers with the transparency tools
              they need to understand who funds local campaigns.
            </p>
          </section>

          {/* What We Do Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              What We Do
            </h2>
            <p className="mb-4">
              We compile campaign finance reports filed with the North Carolina State Board of
              Elections and county boards, then present this data through interactive
              visualizations and detailed analyses. Our platform tracks:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Fundraising timelines and totals</li>
              <li>Donor locations and contribution sizes</li>
              <li>Campaign expenditures and spending patterns</li>
              <li>Industry affiliations of major donors</li>
              <li>Filing compliance and reporting deadlines</li>
            </ul>
            <p>
              We focus particularly on supporting journalists covering local races, providing
              them with structured data and analysis tools to enhance their reporting.
            </p>
          </section>

          {/* Values Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Our Values
            </h2>
            <p className="mb-4">
              <strong>Compliance matters.</strong> We believe candidates have a responsibility
              to file complete, accurate, and timely campaign finance reports. Through our work,
              we've documented instances where reporting requirements aren't met—and where
              penalties aren't enforced. Effective governance requires timely disclosure.
            </p>
            <p className="mb-4">
              <strong>Shared responsibility.</strong> Making campaign finance work isn't just
              the government's job. It requires effort from candidates, voters, elected officials,
              and civic organizations. Civibus is our contribution to that collective effort.
            </p>
            <p>
              <strong>Usability over availability.</strong> Public data should be publicly useful.
              We transform raw filings into formats that make it easy for citizens and journalists
              to understand the influence of money and interest groups in local politics.
            </p>
          </section>

          {/* Team Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Who We Are
            </h2>
            <p className="mb-4">
              Civibus was founded by Stuart Robinson, a Durham resident who has lived in North Carolina since 2002. The organization arose from watching money play an increasingly prominent role in Durham elections and recognizing the need for better tools to understand these financial dynamics in local races. Stuart holds a B.S. in Economics from Duke University and has previously worked as a software engineer, research science analyst, and touring musician.
            </p>
            <p className="mb-4">
              Bobby Madamanchi, a lecturer at the University of Michigan School of Information, serves on the board. Bobby holds a Ph.D. in Cancer Biology from Vanderbilt University and focuses his work on democratizing data and broadening access to computational tools. He is also an active union member and advocate for educational equity.
            </p>
            <p className="text-sm italic">
              Civibus is currently in formation and pursuing 501(c)(3) nonprofit status.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AboutPage;