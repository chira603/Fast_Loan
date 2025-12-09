import React from 'react';

const Loading = ({ size = 'medium', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`spinner mx-auto ${sizeClasses[size]}`}></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <div className={`spinner ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Loading;
