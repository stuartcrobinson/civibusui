// /Users/stuart/repos/civibusui/src/hooks/useCityData.js

import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://sobzobykotnsltnyhohl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYnpvYnlrb3Ruc2x0bnlob2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Mzc3NDgsImV4cCI6MjA3NjAxMzc0OH0.00GejbNtz40QLe8uqXAdoUicRhzxW8OGwtY1CQbQN8g';

async function fetchSupabase(endpoint, geoName) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}?geo_name=eq.${encodeURIComponent(geoName)}`;

    const response = await fetch(url, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
}

export function useCityData(geoName) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!geoName) return;

        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const [locationData, locationDataCount, sizeData, timelineData, fundraisingTimelineData, expenditureTimelineData, cashOnHandTimelineData, realestateData, realestateDataCount, topDonors, topExpenditures, topSpendingByRecipient, totalDonationsData, totalDonationsWithSelfData, allCandidatesData] = await Promise.all([
                    fetchSupabase('v_location_data', geoName),
                    fetchSupabase('v_location_data_count', geoName),
                    fetchSupabase('v_size_data', geoName),
                    fetchSupabase('v_timeline_data', geoName),
                    fetchSupabase('v_fundraising_timeline', geoName),
                    fetchSupabase('v_expenditure_timeline', geoName),
                    fetchSupabase('v_cash_on_hand_timeline', geoName),
                    fetchSupabase('v_realestate_data', geoName),
                    fetchSupabase('v_realestate_data_count', geoName),
                    fetchSupabase('v_top_donors', geoName),
                    fetchSupabase('v_top_expenditures', geoName),
                    fetchSupabase('v_top_spending_by_recipient', geoName),
                    fetchSupabase('v_total_donations', geoName),
                    fetchSupabase('v_total_donations_with_self', geoName),
                    fetchSupabase('v_total_donations', geoName)
                ]);

                // Get last updated date from timeline data
                const lastUpdated = timelineData.length > 0
                    ? new Date(Math.max(...timelineData.map(d => new Date(d.week_start)))).toLocaleDateString()
                    : 'Unknown';

                // Durham candidate allowlist - only show these candidates
                const DURHAM_ALLOWED_CANDIDATES = [
                    'Anjanee Bell',
                    'Chelsea Cook',
                    'DeDreana Freeman',
                    'Diana Medoff',
                    'Leonardo (Leo) Williams',
                    'Mark-Anthony Middleton',
                    'Matt Kopac',
                    'Shanetta Burris'
                ];

                // Filter function to apply allowlist for Durham
                const filterDurhamCandidates = (data) => {
                    if (!data || geoName.toUpperCase() !== 'DURHAM') return data;
                    return data.filter(row => DURHAM_ALLOWED_CANDIDATES.includes(row.candidate_name));
                };

                setData({
                    location: filterDurhamCandidates(locationData),
                    locationCount: filterDurhamCandidates(locationDataCount),
                    size: filterDurhamCandidates(sizeData),
                    timeline: filterDurhamCandidates(timelineData),
                    fundraisingTimeline: filterDurhamCandidates(fundraisingTimelineData),
                    expenditureTimeline: filterDurhamCandidates(expenditureTimelineData),
                    cashOnHandTimeline: filterDurhamCandidates(cashOnHandTimelineData),
                    realestate: filterDurhamCandidates(realestateData),
                    realestateCount: filterDurhamCandidates(realestateDataCount),
                    topDonors: filterDurhamCandidates(topDonors),
                    topExpenditures: filterDurhamCandidates(topExpenditures),
                    topSpendingByRecipient: filterDurhamCandidates(topSpendingByRecipient),
                    totalDonations: filterDurhamCandidates(totalDonationsData),
                    totalDonationsWithSelf: filterDurhamCandidates(totalDonationsWithSelfData),
                    allCandidates: filterDurhamCandidates(allCandidatesData),
                    lastUpdated
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [geoName]);

    return { data, loading, error };
}

export async function fetchCities() {
    const url = `${SUPABASE_URL}/rest/v1/v_cities?select=*`;

    const response = await fetch(url, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }

    return response.json();
}