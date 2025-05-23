'use client';

import React, { createContext, useContext, useReducer } from 'react';
import { CreateUrlResponse } from '@/models/url.model';

// UTM Parameters type
export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

// Define types
export type RecentUrl = CreateUrlResponse & {
  shortenedAt: Date;
};

export interface AppState {
  recentUrls: RecentUrl[];
  preferences: {
    defaultDomain?: string;
    showAnalytics: boolean;
    utmPresets: {
      name: string;
      params: UtmParams;
    }[];
  };
}

type Action = 
  | { type: 'ADD_RECENT_URL'; payload: CreateUrlResponse }
  | { type: 'CLEAR_RECENT_URLS' }
  | { type: 'SET_DEFAULT_DOMAIN'; payload: string }
  | { type: 'TOGGLE_ANALYTICS' }
  | { type: 'ADD_UTM_PRESET'; payload: { name: string; params: UtmParams } }
  | { type: 'REMOVE_UTM_PRESET'; payload: string };

// Initial state
const initialState: AppState = {
  recentUrls: [],
  preferences: {
    showAnalytics: true,
    utmPresets: [
      {
        name: 'Facebook Campaign',
        params: {
          source: 'facebook',
          medium: 'social',
          campaign: 'general'
        }
      }
    ]
  }
};

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null
});

// Reducer function
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_RECENT_URL':
      // Add URL to recent list and limit to 10 items
      return {
        ...state,
        recentUrls: [
          {
            ...action.payload,
            shortenedAt: new Date()
          },
          ...state.recentUrls
        ].slice(0, 10)
      };
      
    case 'CLEAR_RECENT_URLS':
      return {
        ...state,
        recentUrls: []
      };
      
    case 'SET_DEFAULT_DOMAIN':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          defaultDomain: action.payload
        }
      };
      
    case 'TOGGLE_ANALYTICS':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          showAnalytics: !state.preferences.showAnalytics
        }
      };
      
    case 'ADD_UTM_PRESET':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          utmPresets: [
            ...state.preferences.utmPresets,
            action.payload
          ]
        }
      };
      
    case 'REMOVE_UTM_PRESET':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          utmPresets: state.preferences.utmPresets.filter(
            preset => preset.name !== action.payload
          )
        }
      };
      
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
