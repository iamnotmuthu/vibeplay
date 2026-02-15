import type { PatternResults } from '@/store/types'

function generateClusterPoints(n: number, clusters: number): { x: number; y: number; cluster: number }[] {
  const centers = Array.from({ length: clusters }, () => ({
    cx: 0.15 + Math.random() * 0.7,
    cy: 0.15 + Math.random() * 0.7,
  }))
  return Array.from({ length: n }, () => {
    const c = Math.floor(Math.random() * clusters)
    return {
      x: centers[c].cx + (Math.random() - 0.5) * 0.2,
      y: centers[c].cy + (Math.random() - 0.5) * 0.2,
      cluster: c,
    }
  })
}

const telcoPatterns: PatternResults = {
  clusters: {
    points: generateClusterPoints(300, 4),
    clusterLabels: [
      { id: 0, label: 'Loyal High-Value', description: 'Long tenure, high monthly charges, two-year contracts', count: 2105 },
      { id: 1, label: 'At-Risk New Users', description: 'Short tenure, month-to-month contracts, electronic check payments', count: 1892 },
      { id: 2, label: 'Budget Conscious', description: 'Low monthly charges, basic services, no streaming add-ons', count: 1685 },
      { id: 3, label: 'Service Enthusiasts', description: 'Mid-tenure, high charges, multiple add-on services', count: 1361 },
    ],
  },
  anomalies: {
    points: Array.from({ length: 200 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      isAnomaly: i < 18,
      score: i < 18 ? 0.85 + Math.random() * 0.15 : Math.random() * 0.3,
    })),
    anomalyCount: 187,
    anomalyPercent: 2.7,
  },
  insights: [
    { id: 'pat-1', text: 'Segment "At-Risk New Users" has 73% churn rate — the primary target for retention campaigns. Month-to-month contracts and electronic check payments are strong churn predictors.', type: 'warning' },
    { id: 'pat-2', text: '"Loyal High-Value" customers generate 48% of total revenue. Protecting this segment should be the priority — their churn rate is only 5%.', type: 'success' },
    { id: 'pat-3', text: 'Anomalous records include 12 customers with extremely high charges but very short tenure — possible billing errors or special enterprise accounts.', type: 'info' },
  ],
}

const patternsMap: Record<string, PatternResults> = {
  'telco-churn': telcoPatterns,
  'credit-fraud': {
    clusters: {
      points: generateClusterPoints(300, 3),
      clusterLabels: [
        { id: 0, label: 'Normal Small Transactions', description: 'Typical daily purchases under $100', count: 38500 },
        { id: 1, label: 'High-Value Legitimate', description: 'Large but verified transactions, recurring patterns', count: 10650 },
        { id: 2, label: 'Suspicious Patterns', description: 'Unusual amounts, odd timing, new merchants', count: 850 },
      ],
    },
    anomalies: {
      points: Array.from({ length: 200 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        isAnomaly: i < 15,
        score: i < 15 ? 0.9 + Math.random() * 0.1 : Math.random() * 0.25,
      })),
      anomalyCount: 850,
      anomalyPercent: 1.7,
    },
    insights: [
      { id: 'pat-1', text: 'Fraud transactions cluster heavily in the "Suspicious Patterns" segment with 68% precision. Key signals: unusual time-of-day and transaction amount spikes.', type: 'warning' },
      { id: 'pat-2', text: '99.3% of "Normal Small Transactions" are legitimate. This segment can be fast-tracked in fraud screening to reduce processing latency.', type: 'success' },
      { id: 'pat-3', text: 'Detected a 4-hour window (2am-6am) where fraud probability increases 8x. Time-based features will significantly boost model accuracy.', type: 'info' },
    ],
  },
  'store-demand': {
    clusters: {
      points: generateClusterPoints(300, 4),
      clusterLabels: [
        { id: 0, label: 'Weekday Steady', description: 'Consistent Mon-Fri sales, low variance', count: 18200 },
        { id: 1, label: 'Weekend Peaks', description: 'Sat-Sun sales spikes, higher variance', count: 12800 },
        { id: 2, label: 'Promo Driven', description: 'Sales heavily correlated with promotional periods', count: 8500 },
        { id: 3, label: 'Seasonal Items', description: 'Clear seasonal patterns, holiday-driven demand', count: 5500 },
      ],
    },
    anomalies: {
      points: Array.from({ length: 200 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        isAnomaly: i < 8,
        score: i < 8 ? 0.88 + Math.random() * 0.12 : Math.random() * 0.3,
      })),
      anomalyCount: 89,
      anomalyPercent: 0.2,
    },
    insights: [
      { id: 'pat-1', text: 'Weekend sales are 42% higher on average. Separate forecasting models for weekday vs. weekend will improve prediction accuracy.', type: 'info' },
      { id: 'pat-2', text: 'Promotional campaigns show a 2-day lag effect — demand stays elevated 48 hours after promotion ends. Engineering lag features.', type: 'success' },
      { id: 'pat-3', text: '89 anomalous demand spikes detected, primarily around Black Friday and holiday periods. Adding holiday calendar features.', type: 'warning' },
    ],
  },
  'patient-readmission': {
    clusters: {
      points: generateClusterPoints(300, 4),
      clusterLabels: [
        { id: 0, label: 'Low-Risk Recovery', description: 'Young patients, single diagnosis, short stays', count: 9800 },
        { id: 1, label: 'Chronic Condition', description: 'Multiple diagnoses, frequent visits, medication changes', count: 7200 },
        { id: 2, label: 'Post-Surgical', description: 'Recent procedures, moderate stay length, rehab needed', count: 5100 },
        { id: 3, label: 'Complex Elderly', description: '65+ patients, 3+ comorbidities, extended hospitalization', count: 2900 },
      ],
    },
    anomalies: {
      points: Array.from({ length: 200 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        isAnomaly: i < 14,
        score: i < 14 ? 0.82 + Math.random() * 0.18 : Math.random() * 0.35,
      })),
      anomalyCount: 312,
      anomalyPercent: 1.2,
    },
    insights: [
      { id: 'pat-1', text: '"Complex Elderly" segment has 58% readmission rate — highest across all groups. Targeted post-discharge care programs could reduce this significantly.', type: 'warning' },
      { id: 'pat-2', text: '"Low-Risk Recovery" patients have only 8% readmission rate. Streamlining their discharge process could free resources for higher-risk groups.', type: 'success' },
      { id: 'pat-3', text: '312 anomalous cases include patients readmitted within 48 hours — potential premature discharge situations requiring protocol review.', type: 'info' },
    ],
  },
}

export function getPrecomputedPatterns(datasetId: string): PatternResults {
  return patternsMap[datasetId] || telcoPatterns
}
