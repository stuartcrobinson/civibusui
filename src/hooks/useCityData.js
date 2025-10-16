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
                const [locationData, sizeData, timelineData, expenditureTimelineData, cashOnHandTimelineData, realestateData, topDonors, topExpenditures, topSpendingByRecipient] = await Promise.all([
                    fetchSupabase('v_location_data', geoName),
                    fetchSupabase('v_size_data', geoName),
                    fetchSupabase('v_timeline_data', geoName),
                    fetchSupabase('v_expenditure_timeline', geoName),
                    fetchSupabase('v_cash_on_hand_timeline', geoName),
                    fetchSupabase('v_realestate_data', geoName),
                    fetchSupabase('v_top_donors', geoName),
                    fetchSupabase('v_top_expenditures', geoName),
                    fetchSupabase('v_top_spending_by_recipient', geoName)
                ]);

                // Get last updated date from timeline data
                const lastUpdated = timelineData.length > 0
                    ? new Date(Math.max(...timelineData.map(d => new Date(d.week_start)))).toLocaleDateString()
                    : 'Unknown';

                setData({
                    location: locationData,
                    size: sizeData,
                    timeline: timelineData,
                    expenditureTimeline: expenditureTimelineData,
                    cashOnHandTimeline: cashOnHandTimelineData,
                    realestate: realestateData,
                    topDonors: topDonors,
                    topExpenditures: topExpenditures,
                    topSpendingByRecipient: topSpendingByRecipient,
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