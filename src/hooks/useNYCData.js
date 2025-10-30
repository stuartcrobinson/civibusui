import { useState, useEffect } from 'react';


// xtxogyphijkktqiedxqi

// xtxogyphijkktqiedxqi


// const NYC_SUPABASE_URL = 'http://127.0.0.1:54321';
const NYC_SUPABASE_URL = 'https://xtxogyphijkktqiedxqi.supabase.co';
const NYC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0eG9neXBoaWpra3RxaWVkeHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODYwNTUsImV4cCI6MjA3NzM2MjA1NX0.pMsMRABkzNu3-Ld-eTGdARu4dBH5f-XplB0ShW8124o';
// const NYC_SUPABASE_URL = 'http://127.0.0.1:54321';
// const NYC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function fetchSupabase(endpoint, extraParams = '') {
    const url = `${NYC_SUPABASE_URL}/rest/v1/${endpoint}?${extraParams}`;

    const response = await fetch(url, {
        headers: {
            'apikey': NYC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${NYC_SUPABASE_ANON_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
}

export function useNYCContestData(officeSlug) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!officeSlug) return;

        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                // Convert slug back to office_sought
                const officeSought = officeSlug
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                const filter = `office_sought=eq.${encodeURIComponent(officeSought)}`;

                const timelineLimit = 'limit=20000';
                console.log('Fetching with filter:', filter, 'and limit:', timelineLimit);
                const [
                    fundraisingTimelineData,
                    expenditureTimelineData,
                    cashOnHandTimelineData,
                    donationsBySizeData,
                    donationsByLocationData,
                    donationsByBoroughData,
                    donationsByRealEstateData,
                    refundsData
                ] = await Promise.all([
                    fetchSupabase('mv_nyc_fundraising_timeline', `${filter}&${timelineLimit}`).then(d => {
                        console.log('Fundraising rows received:', d.length);
                        return d;
                    }),
                    fetchSupabase('mv_nyc_expenditure_timeline', `${filter}&${timelineLimit}`),
                    fetchSupabase('mv_nyc_cash_on_hand_timeline', `${filter}&${timelineLimit}`),
                    fetchSupabase('mv_nyc_donations_by_size', filter),
                    fetchSupabase('mv_nyc_donations_by_location', filter),
                    fetchSupabase('mv_nyc_donations_by_borough', filter),
                    fetchSupabase('mv_nyc_donations_by_realestate', filter),
                    fetchSupabase('mv_nyc_refunds', filter)
                ]);

                setData({
                    fundraisingTimeline: fundraisingTimelineData,
                    expenditureTimeline: expenditureTimelineData,
                    cashOnHandTimeline: cashOnHandTimelineData,
                    donationsBySize: donationsBySizeData,
                    donationsByLocation: donationsByLocationData,
                    donationsByBorough: donationsByBoroughData,
                    donationsByRealEstate: donationsByRealEstateData,
                    refunds: refundsData,
                    officeSought
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [officeSlug]);

    return { data, loading, error };
}

export async function fetchNYCContests() {
    const data = await fetchSupabase('mv_nyc_contests', 'select=*')
    
    // Filter out contests with NULL office_sought
    return data.filter(contest => contest.office_sought);
}