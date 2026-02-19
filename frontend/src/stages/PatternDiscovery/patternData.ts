import type { PatternResults } from '@/store/types'

const patternsMap: Record<string, PatternResults> = {
  'telco-churn': {
    totalRecords: 7043,
    sufficient: [
      {
        id: 0,
        label: 'Month-to-Month Churners',
        description: 'Short-tenure customers on month-to-month contracts paying via electronic check — highest churn risk segment.',
        count: 3875,
        keySignals: ['Contract=Month-to-month', 'PaymentMethod=Electronic check', 'tenure < 12mo', 'MonthlyCharges > $65'],
      },
      {
        id: 1,
        label: 'Loyal Long-Term Customers',
        description: 'Two-year contract holders with autopay and 3+ years tenure — lowest churn rate, high lifetime value.',
        count: 2105,
        keySignals: ['Contract=Two year', 'tenure > 36mo', 'AutoPay=Yes', 'TechSupport=Yes'],
      },
      {
        id: 2,
        label: 'Budget DSL Users',
        description: 'Low-charge DSL subscribers with no streaming or security add-ons — moderate churn driven by competitor pricing.',
        count: 1041,
        keySignals: ['InternetService=DSL', 'MonthlyCharges < $30', 'StreamingTV=No', 'OnlineSecurity=No'],
      },
    ],
    insufficient: [
      {
        id: 3,
        label: 'Senior No-Dependents Niche',
        description: 'Senior citizens with no partner or dependents — limited samples make reliable prediction difficult.',
        count: 389,
        keySignals: ['SeniorCitizen=1', 'Partner=No', 'Dependents=No'],
      },
      {
        id: 4,
        label: 'No-Phone Internet Only',
        description: 'Internet-only subscribers with no phone line — edge case with ambiguous churn signals.',
        count: 209,
        keySignals: ['PhoneService=No', 'MultipleLines=No phone service', 'InternetService!=None'],
      },
    ],
    helpMe: [
      {
        id: 5,
        label: 'Mid-Tenure Switchers',
        description: 'Customers with 12–24 months tenure showing mixed signals — some upgrading, some preparing to leave. Cohort behaviour is inconsistent.',
        count: 312,
        keySignals: ['tenure in [12,24]', 'Contract changed recently', 'Mixed PaymentMethod', 'MonthlyCharges fluctuating'],
      },
    ],
    insights: [
      { id: 'pat-1', text: '"Month-to-Month Churners" (3,875 records) has 73% churn rate and sufficient data for high-confidence modelling. This is the primary retention campaign target.', type: 'warning' },
      { id: 'pat-2', text: '"Loyal Long-Term Customers" have only 5% churn — protecting this segment should be the retention priority. 2,105 records give strong confidence.', type: 'success' },
      { id: 'pat-3', text: 'Two insufficient and one ambiguous pattern flagged. Limited and mixed samples will reduce model confidence for these cohorts without additional data.', type: 'info' },
    ],
  },

  'credit-fraud': {
    totalRecords: 50000,
    sufficient: [
      {
        id: 0,
        label: 'Standard Low-Value Transactions',
        description: 'Typical daily purchases under $100 — clear legitimate pattern with consistent velocity and merchant diversity.',
        count: 38500,
        keySignals: ['Amount < $100', 'Normal hours (8am-10pm)', 'Recurring merchant', 'V14 > -5'],
      },
      {
        id: 1,
        label: 'High-Value Verified Purchases',
        description: 'Large legitimate transactions with consistent account history — detectable via repeated merchant + daytime patterns.',
        count: 10650,
        keySignals: ['Amount > $500', 'V17 in normal range', 'Daytime (9am-6pm)', 'Established account'],
      },
      {
        id: 2,
        label: 'Fraud Ring Signatures',
        description: 'Off-hours transactions with anomalous PCA features (V14, V17) in known fraud cluster ranges.',
        count: 850,
        keySignals: ['V14 < -8', 'V17 < -5', 'Off-hours (2am-6am)', 'Amount spike vs. history'],
      },
    ],
    insufficient: [
      {
        id: 3,
        label: 'Ultra-High Value Anomalies',
        description: 'Transactions over $5,000 with unusual PCA signatures — too few samples to distinguish fraud from legitimate.',
        count: 186,
        keySignals: ['Amount > $5,000', 'V12 < -15', 'New merchant', 'Single occurrence'],
      },
      {
        id: 4,
        label: 'Cross-Feature Extreme Cases',
        description: 'Rare combinations of multiple extreme PCA values — model confidence is low without additional examples.',
        count: 94,
        keySignals: ['V12 < -15', 'V14 < -15', 'V10 < -10', 'Compound anomaly'],
      },
    ],
    helpMe: [
      {
        id: 5,
        label: 'Mixed-Signal Mid-Value Transactions',
        description: '$200–$500 transactions with partially anomalous PCA values — not clearly fraudulent or legitimate. Borderline feature ranges make confident scoring impossible.',
        count: 447,
        keySignals: ['Amount in [$200,$500]', 'V10 mixed signal', 'Borderline V14 range', 'Irregular but not extreme'],
      },
    ],
    insights: [
      { id: 'pat-1', text: '"Fraud Ring Signatures" pattern (850 records) has 68% fraud precision and sufficient data for detection. Key signal: V14 < -8 with off-hours timing.', type: 'warning' },
      { id: 'pat-2', text: '"Standard Low-Value Transactions" (38,500 records) can be fast-tracked in fraud screening with 99.3% legitimate confidence — reducing processing latency.', type: 'success' },
      { id: 'pat-3', text: 'Two ultra-rare patterns flagged for augmentation. One ambiguous mid-value pattern needs additional labelled data to achieve reliable scoring.', type: 'info' },
    ],
  },

  'store-demand': {
    totalRecords: 45000,
    sufficient: [
      {
        id: 0,
        label: 'Weekday Standard Demand',
        description: 'Monday–Friday baseline sales across core store clusters with low variance and consistent velocity.',
        count: 32175,
        keySignals: ['dayofweek in [0,4]', 'onpromotion=False', 'store_cluster=A/B', 'Normal oil price'],
      },
      {
        id: 1,
        label: 'Promotional Sales Spikes',
        description: 'Promotion-active periods with clear demand uplift — strong enough signal for promotion-specific sub-model.',
        count: 11200,
        keySignals: ['onpromotion=True', '2-day lag effect', 'High-traffic stores', 'Transaction count > avg'],
      },
      {
        id: 2,
        label: 'Holiday Season Surge',
        description: 'November–December elevated demand driven by seasonal categories and increased footfall.',
        count: 7560,
        keySignals: ['month in [11,12]', 'Holiday items category', 'Weekday modifier', 'Store type A'],
      },
    ],
    insufficient: [
      {
        id: 3,
        label: 'Remote Region Stores',
        description: 'Low-traffic stores in outlying regions with fewer than 5 weeks of historical data.',
        count: 445,
        keySignals: ['city=Remote region', 'Weekly transactions < 50', 'High missingness', 'No promotion history'],
      },
      {
        id: 4,
        label: 'High Oil-Price Demand Sensitivity',
        description: 'Demand periods correlated with Brent crude above $90 — rare macro event with insufficient examples.',
        count: 310,
        keySignals: ['dcoilwtico > 90', 'Transportation-sensitive SKUs', 'Infrequent occurrence'],
      },
    ],
    helpMe: [
      {
        id: 5,
        label: 'Holiday Transfer Days',
        description: 'Days marked as "transferred" holidays show demand patterns that shift unpredictably — neither standard weekday nor full holiday behaviour.',
        count: 380,
        keySignals: ['transferred=True', 'Holiday label active', 'Demand variance high', 'Pattern unclear'],
      },
    ],
    insights: [
      { id: 'pat-1', text: '"Weekday Standard Demand" (32,175 records) provides robust baseline. Separating weekday vs. weekend models will reduce MAPE by an estimated 12%.', type: 'info' },
      { id: 'pat-2', text: '"Promotional Sales Spikes" pattern has a confirmed 2-day lag effect. Engineering lag features for this segment will significantly improve forecast accuracy.', type: 'success' },
      { id: 'pat-3', text: 'Remote region stores and high oil-price periods flagged for augmentation. Transferred holiday days are ambiguous — additional labelling is needed for reliable forecasting.', type: 'warning' },
    ],
  },

  'patient-readmission': {
    totalRecords: 25000,
    sufficient: [
      {
        id: 0,
        label: 'Standard Recovery Path',
        description: 'Patients aged 30–65 with a single diagnosis and 3–7 day hospital stay — well-documented and predictable readmission risk.',
        count: 9800,
        keySignals: ['age=[30-60]', 'time_in_hospital in [3,7]', 'num_diagnoses=1', 'Standard discharge'],
      },
      {
        id: 1,
        label: 'Chronic Condition Patients',
        description: 'Patients with 2+ comorbidities, multiple medications, and prior hospital visits — high readmission risk cluster.',
        count: 7200,
        keySignals: ['num_diagnoses >= 2', 'num_medications in [10,20]', 'Prior admit', 'diabetesMed=Yes'],
      },
      {
        id: 2,
        label: 'Post-Surgical Rehabilitation',
        description: 'Patients following surgical procedures requiring 7–14 day stays and post-discharge rehabilitation referral.',
        count: 5100,
        keySignals: ['Surgical procedure', 'time_in_hospital in [7,14]', 'Rehab referral=Yes', 'Physical therapy'],
      },
    ],
    insufficient: [
      {
        id: 3,
        label: 'Centenarian Patients',
        description: 'Patients aged 90+, often with extreme comorbidity loads — too few cases for reliable prediction.',
        count: 312,
        keySignals: ['age=[90-100]', 'Extreme comorbidities', 'Long-term care', 'Polypharmacy'],
      },
      {
        id: 4,
        label: 'Complex Polypharmacy Cases',
        description: 'Patients on more than 25 simultaneous medications — rare presentation with unpredictable outcomes.',
        count: 284,
        keySignals: ['num_medications > 25', 'Multiple drug interactions', 'Specialist-only care'],
      },
    ],
    helpMe: [
      {
        id: 5,
        label: 'Mixed Rare Diagnosis Cluster',
        description: 'Patients with uncommon primary diagnosis codes (diag_1 in rare ICD groups) alongside multiple comorbidities — feature interactions are contradictory and sufficiency is unclear.',
        count: 520,
        keySignals: ['diag_1 in rare code groups', 'num_diagnoses >= 3', 'Mixed readmission history', 'Unclear risk signal'],
      },
    ],
    insights: [
      { id: 'pat-1', text: '"Chronic Condition Patients" (7,200 records) has 58% readmission rate — the highest across all groups. Targeted post-discharge care plans can reduce this significantly.', type: 'warning' },
      { id: 'pat-2', text: '"Standard Recovery Path" (9,800 records) has only 8% readmission rate. Streamlining their discharge process could free resources for higher-risk groups.', type: 'success' },
      { id: 'pat-3', text: 'Centenarian and polypharmacy patterns need augmentation. Rare mixed-diagnosis cluster is ambiguous — contradictory feature interactions require additional clinical annotation.', type: 'info' },
    ],
  },

  'employee-attrition': {
    totalRecords: 14999,
    sufficient: [
      {
        id: 0,
        label: 'Overtime Burnout Segment',
        description: 'Employees with consistent overtime, low job satisfaction (≤2), and fewer than 3 years tenure — highest attrition risk.',
        count: 5269,
        keySignals: ['OverTime=Yes', 'JobSatisfaction <= 2', 'YearsAtCompany < 3', 'WorkLifeBalance=Bad'],
      },
      {
        id: 1,
        label: 'Stable High-Satisfaction Employees',
        description: 'Long-tenure employees with good satisfaction, stock options, and no overtime — minimal attrition risk.',
        count: 5800,
        keySignals: ['JobSatisfaction >= 3', 'YearsAtCompany >= 5', 'OverTime=No', 'StockOptionLevel >= 1'],
      },
      {
        id: 2,
        label: 'Early-Career Flight Risk',
        description: 'Short-tenure employees with long commute and no recent promotion — exploring external opportunities.',
        count: 3800,
        keySignals: ['YearsAtCompany < 3', 'DistanceFromHome > 20mi', 'YearsSinceLastPromotion >= 2', 'Age < 30'],
      },
    ],
    insufficient: [
      {
        id: 3,
        label: 'Senior HR Role Niche',
        description: 'HR professionals at Band 5+ with uncommon role-compensation combinations — insufficient samples.',
        count: 325,
        keySignals: ['JobRole=Human Resources', 'JobLevel >= 4', 'Niche compensation band'],
      },
      {
        id: 4,
        label: 'Max-Stock Low-Pay Paradox',
        description: 'Employees with maximum stock options but below-median salary — rare pattern with ambiguous retention signals.',
        count: 218,
        keySignals: ['StockOptionLevel=3', 'MonthlyIncome < median', 'Long tenure but dissatisfied'],
      },
    ],
    helpMe: [
      {
        id: 5,
        label: 'Promoted-but-Dissatisfied Segment',
        description: 'Employees recently promoted (within 1 year) but showing low environment satisfaction — contradictory signals make attrition prediction unreliable for this group.',
        count: 412,
        keySignals: ['YearsSinceLastPromotion <= 1', 'EnvironmentSatisfaction <= 2', 'OverTime mixed', 'Ambiguous signal'],
      },
    ],
    insights: [
      { id: 'pat-1', text: '"Overtime Burnout Segment" (5,269 records) has 71% attrition rate — primary intervention target. Overtime reduction and compensation review are the highest-impact levers.', type: 'warning' },
      { id: 'pat-2', text: '"Stable High-Satisfaction" employees (5,800 records) have only 4% attrition. Protecting this segment should be the HR retention priority.', type: 'success' },
      { id: 'pat-3', text: 'Two niche HR patterns flagged for augmentation. The promoted-but-dissatisfied segment shows contradictory signals — additional engagement survey data would resolve the ambiguity.', type: 'info' },
    ],
  },

  'energy-consumption': {
    totalRecords: 35040,
    sufficient: [
      {
        id: 0,
        label: 'Weekday Morning Peak',
        description: '7–10am weekday demand window with consistent occupancy-driven load patterns across all seasons.',
        count: 8760,
        keySignals: ['hour in [7,10]', 'dayofweek in [0,4]', 'temperature in [5,30]', 'occupancy > 0.6'],
      },
      {
        id: 1,
        label: 'Evening Residential Surge',
        description: '5–9pm demand peak driven by residential zones — consistent in summer and winter, smaller in spring/autumn.',
        count: 8760,
        keySignals: ['hour in [17,21]', 'zone=residential', 'HVAC active', 'occupancy > 0.8'],
      },
      {
        id: 2,
        label: 'Off-Peak Baseline State',
        description: 'Overnight low-demand steady state — highly predictable and consistent across all seasons and days.',
        count: 13140,
        keySignals: ['hour in [23,6]', 'occupancy < 0.1', 'Baseline HVAC', 'temperature in [0,25]'],
      },
    ],
    insufficient: [
      {
        id: 3,
        label: 'Extreme Cold Snap Events',
        description: 'Maximum heating demand during temperatures below -5°C — occurs fewer than 12 times per year.',
        count: 380,
        keySignals: ['temperature < -5°C', 'HVAC at maximum', 'Heating dominant load', 'Rare event'],
      },
      {
        id: 4,
        label: 'Demand Response Activations',
        description: 'Grid-level demand response signals requiring immediate load shedding — rare critical peak events.',
        count: 420,
        keySignals: ['demand_response_active=True', 'Grid stress > 95%', 'Load shedding', 'Irregular pattern'],
      },
    ],
    helpMe: [
      {
        id: 5,
        label: 'Spring/Autumn Transitional Hours',
        description: 'Shoulder-season demand (15–20°C) where neither heating nor cooling dominates — load patterns are inconsistent and vary unpredictably by building type.',
        count: 1840,
        keySignals: ['temperature in [15,20]', 'Mixed HVAC state', 'Season=spring/autumn', 'High variance'],
      },
    ],
    insights: [
      { id: 'pat-1', text: 'Three peak patterns identified with 30,660 combined records — strong foundation for dual-peak forecasting. Weekend demand shifts 2 hours later vs. weekdays.', type: 'info' },
      { id: 'pat-2', text: '"Off-Peak Baseline" (13,140 records) is the most predictable pattern — a simple autoregressive model achieves < 2% MAPE for overnight hours.', type: 'success' },
      { id: 'pat-3', text: 'Extreme weather and demand-response events flagged for augmentation. Transitional shoulder-season hours are ambiguous — inconsistent building responses require additional sub-metering data.', type: 'warning' },
    ],
  },

  'insurance-claims': {
    totalRecords: 40000,
    sufficient: [
      {
        id: 0,
        label: 'Standard Verified Claims',
        description: 'Typical claims with police reports, witnesses, established policyholders of 1–3 years — strong legitimate signal.',
        count: 28000,
        keySignals: ['police_report=Yes', 'witnesses >= 1', 'policy_tenure in [1,3]yr', 'Clean claim history'],
      },
      {
        id: 1,
        label: 'High-Value Legitimate Claims',
        description: 'Major damage claims from long-standing policyholders verified through authorised repair networks.',
        count: 8500,
        keySignals: ['incident_severity=Major Damage', 'policy_tenure > 3yr', 'Authorised body shop', 'No prior fraud flag'],
      },
      {
        id: 2,
        label: 'Suspicious New Policy Claims',
        description: 'Claims filed within 6 months of policy start — elevated fraud rate via specific repair networks.',
        count: 2200,
        keySignals: ['policy_tenure < 6mo', 'witnesses=0', 'Non-authorised repairer', 'Repeat claimant network'],
      },
    ],
    insufficient: [
      {
        id: 3,
        label: 'Parked Vehicle Incidents',
        description: 'No at-fault driver, parked vehicle damage — edge case with ambiguous fraud vs. legitimate signals.',
        count: 390,
        keySignals: ['incident_type=Parked Car', 'No at-fault party', 'No witnesses', 'Unclear liability'],
      },
      {
        id: 4,
        label: 'Multi-Injury No-Witness Cases',
        description: 'Multiple bodily injuries with zero witnesses — rare profile that requires more data for confident scoring.',
        count: 276,
        keySignals: ['bodily_injuries=2', 'witnesses=0', 'High claim amount', 'No police report'],
      },
    ],
    helpMe: [
      {
        id: 5,
        label: 'Hobby-Related Anomalies',
        description: 'Claims where policyholder hobbies (e.g. racing, skydiving) partially overlap with incident context — risk signals are contradictory and cohort labelling is disputed.',
        count: 480,
        keySignals: ['insured_hobbies=high-risk', 'Incident context mixed', 'Ambiguous fraud label', 'Borderline claim amount'],
      },
    ],
    insights: [
      { id: 'pat-1', text: '"Suspicious New Policy Claims" (2,200 records) has 84% fraud rate — the highest-precision fraud target. Shared repair networks are the strongest detection signal.', type: 'warning' },
      { id: 'pat-2', text: '"Standard Verified Claims" (28,000 records) can be auto-approved at 97% confidence — significantly reducing investigation backlog.', type: 'success' },
      { id: 'pat-3', text: 'Parked vehicle and multi-injury patterns need augmentation. Hobby-related anomalies show contradictory fraud signals — additional investigator annotations required.', type: 'info' },
    ],
  },

  'predictive-maintenance': {
    totalRecords: 50000,
    sufficient: [
      {
        id: 0,
        label: 'Normal Operating State',
        description: 'Machines running within all nominal sensor bounds — vibration, temperature, and pressure within healthy thresholds. Clear no-failure signal.',
        count: 34500,
        keySignals: ['vibration < 4.5mm/s', 'temperature in [60,85]°C', 'pressure in [5,12]bar', 'cycle_count < threshold'],
      },
      {
        id: 1,
        label: 'Pre-Failure Degradation Cluster',
        description: 'Machines exhibiting rising vibration and temperature trends over 48 hours before recorded failure — strong precursor pattern.',
        count: 8200,
        keySignals: ['vibration trending up > 2 days', 'temperature > 95°C', 'Bearing wear signal', 'Cycle count near limit'],
      },
      {
        id: 2,
        label: 'Post-Maintenance Warm-Up',
        description: 'Sensor readings immediately after maintenance — temporarily elevated vibration and temperature that settle within 4 hours.',
        count: 5100,
        keySignals: ['Post-maintenance flag', 'vibration spike < 4h', 'temperature spike < 4h', 'Returns to normal'],
      },
    ],
    insufficient: [
      {
        id: 3,
        label: 'Catastrophic Sudden Failures',
        description: 'Failures occurring with no prior sensor warning — rare mode with insufficient examples for reliable early detection.',
        count: 380,
        keySignals: ['Failure within 1h of normal readings', 'No trend detected', 'Catastrophic mode', 'Component fracture'],
      },
      {
        id: 4,
        label: 'Extreme Environmental Events',
        description: 'Sensor anomalies caused by external conditions (dust storm, flooding) rather than equipment degradation — rare and hard to model.',
        count: 290,
        keySignals: ['External cause confirmed', 'All sensors spike simultaneously', 'Environmental flag', 'Not degradation-driven'],
      },
    ],
    helpMe: [
      {
        id: 5,
        label: 'Intermittent Fault Oscillators',
        description: 'Machines that cycle in and out of warning states without failing — sensors repeatedly breach thresholds then recover. Unclear whether failure is imminent or chronic.',
        count: 1420,
        keySignals: ['Vibration oscillates above/below limit', 'temperature borderline', 'No consistent trend', 'Recurring but non-progressive'],
      },
    ],
    insights: [
      { id: 'pat-1', text: '"Pre-Failure Degradation Cluster" (8,200 records) shows consistent 48-hour warning window — enabling proactive maintenance scheduling before failure occurs.', type: 'warning' },
      { id: 'pat-2', text: '"Normal Operating State" (34,500 records) provides a strong healthy baseline — machines can be cleared for continued operation with high confidence.', type: 'success' },
      { id: 'pat-3', text: 'Catastrophic failures and environmental events flagged for augmentation. Intermittent fault oscillators need additional time-series labelling to determine true failure risk.', type: 'info' },
    ],
  },
}

export function getPrecomputedPatterns(datasetId: string): PatternResults {
  return patternsMap[datasetId] ?? patternsMap['telco-churn']
}
