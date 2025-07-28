import React from 'react';

const TestPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, React is working!</p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800">✅ React is rendering correctly</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 