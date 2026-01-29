
import React from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  tag?: string;
}

export interface Partner {
  id: string;
  name: string;
  code: string; // 统一社会信用代码
  riskLevel: 'low' | 'medium' | 'high';
  rating: string; // A, B, C...
  status: 'active' | 'suspended' | 'pending';
  collabCount: number;
  lastUpdated: string;
  legalRep?: string;
  regCapital?: string;
  address?: string;
  history?: { id: string; name: string; date: string; type: string }[];
  alerts?: { id: string; title: string; date: string; severity: 'high' | 'medium' }[];
  tags?: string[];
}

export type MenuState = {
  activeId: string;
  expandedIds: string[];
};

export interface DashboardStat {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}
