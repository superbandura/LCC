import React from 'react';

export const LocationIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const MenuIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const EditIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l12.232-12.232z" />
  </svg>
);

export const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);


export const UsaFlagIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-full h-full rounded-sm shadow-md">
    <rect width="60" height="30" fill="#B22234"/>
    <rect width="60" height="3" y="3" fill="#FFFFFF"/>
    <rect width="60" height="3" y="9" fill="#FFFFFF"/>
    <rect width="60" height="3" y="15" fill="#FFFFFF"/>
    <rect width="60" height="3" y="21" fill="#FFFFFF"/>
    <rect width="60" height="3" y="27" fill="#FFFFFF"/>
    <rect width="28" height="18" fill="#3C3B6E"/>
  </svg>
);

export const ChinaFlagIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" className="w-full h-full rounded-sm shadow-md">
    <rect fill="#EE1C25" width="600" height="400"/>
    <g fill="#FF0">
      <path d="M100 100l30.9 95.1-80.9-58.7h100l-80.9 58.7z"/>
      <path transform="translate(200 50) scale(.5) rotate(23.04)" d="M0-100l30.9 95.1-80.9-58.7h100l-80.9 58.7z"/>
      <path transform="translate(250 100) scale(.5) rotate(45.65)" d="M0-100l30.9 95.1-80.9-58.7h100l-80.9 58.7z"/>
      <path transform="translate(250 150) scale(.5) rotate(69.95)" d="M0-100l30.9 95.1-80.9-58.7h100l-80.9 58.7z"/>
      <path transform="translate(200 200) scale(.5) rotate(-22.25)" d="M0-100l30.9 95.1-80.9-58.7h100l-80.9 58.7z"/>
    </g>
  </svg>
);

export const DestroyedIcon: React.FC<{ color?: string }> = ({ color = '#DC2626' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
    <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.6)" stroke={color} strokeWidth="2"/>
    <path d="M7 7L17 17M17 7L7 17" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
);