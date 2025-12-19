
import React from 'react';
import AcademySection from './AcademySection';

/**
 * Legacy wrapper for the Foundations tab.
 * The core logic has been moved to AcademySection for a more integrated learning path.
 */
const FoundationsSection: React.FC = () => {
  return <AcademySection />;
};

export default FoundationsSection;
