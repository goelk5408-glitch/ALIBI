"use client";
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
