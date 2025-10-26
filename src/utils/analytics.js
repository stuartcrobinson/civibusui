import ReactGA from 'react-ga4';

const MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

// export const initGA = () => {
//   if (MEASUREMENT_ID) {
//     ReactGA.initialize(MEASUREMENT_ID);
//   } else {
//     console.warn('GA Measurement ID not found in environment variables');
//   }
// };

// export const initGA = () => {
//   if (MEASUREMENT_ID && window.location.hostname !== 'localhost') {
//     ReactGA.initialize(MEASUREMENT_ID);
//   }
// };

const isOwnDevice = () => {
  if (window.location.hostname === 'localhost') return true;

// To mark your devices:
// Open console on your laptop and run:
// localStorage.setItem('ga_exclude_dev', 'true')
// to check:
// localStorage.getItem('ga_exclude_dev')
 

  const devFlag = localStorage.getItem('ga_exclude_dev');
  return devFlag === 'true';
};

export const initGA = () => {
  if (MEASUREMENT_ID && !isOwnDevice()) {
    ReactGA.initialize(MEASUREMENT_ID);
  }
};


export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
};

