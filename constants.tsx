import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Search, 
  Zap, 
  CheckCircle, 
  Gavel, 
  GraduationCap, 
  BookOpen, 
  PieChart, 
  ShieldAlert, 
  Settings
} from 'lucide-react';
import { MenuItem } from './types';

export const MENU_DATA: MenuItem[] = [
  {
    id: 'viz',
    label: '数据可视化中心',
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { id: 'viz-overview', label: '系统概览仪表盘' },
      { id: 'viz-compliance-summary', label: '合规风险汇总报表' },
      { id: 'viz-tender-analysis', label: '招投标风险分析报表' },
      { id: 'viz-contract-perf', label: '合同履约情况报表' },
      { id: 'viz-legal-stats', label: '诉讼案件统计报表' },
    ],
  },
  {
    id: 'contract',
    label: '合同智能管理',
    icon: <FileText className="w-5 h-5" />,
    children: [
      { id: 'contract-lib', label: '合同库与模板管理' },
      { id: 'contract-approval', label: '合同智能审批', tag: 'AI' },
      { id: 'contract-monitor', label: '合同履约监控与预警' },
      { id: 'contract-risk', label: '合同修改与风险管理' },
    ],
  },
  {
    id: 'tender',
    label: '招标采购合规监控',
    icon: <Search className="w-5 h-5" />,
    children: [
      { id: 'tender-flaw', label: '标书审查-标书瑕疵识别', tag: 'AI' },
      { id: 'tender-compare', label: '标书审查-投标文件比对', tag: 'AI' },
      { id: 'tender-audit-person', label: '中标合同与人员审查' },
      { id: 'tender-audit-check', label: '验收回款与招采审计' },
    ],
  },
  {
    id: 'investment',
    label: '投融资合规管理',
    icon: <Zap className="w-5 h-5" />,
    children: [
      { id: 'partners-mgmt', label: '合作伙伴管理' },
      { id: 'investment-risk', label: '投融资合规风险评估' },
    ],
  },
  {
    id: 'compliance-review',
    label: '合规审查与决策支持',
    icon: <CheckCircle className="w-5 h-5" />,
    children: [
      { id: 'comp-review-list', label: '合规风险清单与管控' },
      { id: 'comp-review-qa', label: '智能合规问答', tag: 'AI' },
      { id: 'comp-review-report', label: '合规风险报告' },
    ],
  },
  {
    id: 'legal-case',
    label: '法律案件纠纷全流程管理',
    icon: <Gavel className="w-5 h-5" />,
    children: [
      { id: 'legal-case-ledger', label: '案件上报与台账' },
      { id: 'legal-case-strategy', label: '案件办理与策略支持' },
      { id: 'legal-case-supervision', label: '案件监督与统计' },
    ],
  },
  {
    id: 'training',
    label: '合规培训与文化建设',
    icon: <GraduationCap className="w-5 h-5" />,
    children: [
      { id: 'training-online', label: '线上合规培训' },
      { id: 'training-exam', label: '合规考核与达标管理' },
      { id: 'training-culture', label: '合规文化宣传' },
    ],
  },
  {
    id: 'knowledge-base',
    label: '合规知识库',
    icon: <BookOpen className="w-5 h-5" />,
    children: [
      { id: 'kb-laws', label: '法律法规库' },
      { id: 'kb-rules', label: '合规制度库' },
      { id: 'kb-cases', label: '合规案例库' },
    ],
  },
  {
    id: 'audit',
    label: '合规审计与整改跟踪',
    icon: <PieChart className="w-5 h-5" />,
    children: [
      { id: 'audit-check', label: '定期 / 不定期合规检查' },
      { id: 'audit-tracking', label: '问题整改跟踪与验证' },
      { id: 'audit-investigation', label: '违规调查与问责建议' },
    ],
  },
  {
    id: 'risk-ai',
    label: '合规风险智能识别与预警',
    icon: <ShieldAlert className="w-5 h-5" />,
    children: [
      { id: 'risk-ai-alert', label: '合规风险预警' },
      { id: 'risk-ai-collect', label: '风险信息收集与管理' },
      { id: 'risk-ai-map', label: '风险地图与图谱' },
    ],
  },
  {
    id: 'system',
    label: '系统管理',
    icon: <Settings className="w-5 h-5" />,
    children: [
      { id: 'sys-roles', label: '角色权限配置' },
      { id: 'sys-users', label: '用户管理' },
      { id: 'sys-config', label: '系统参数设置' },
    ],
  },
];