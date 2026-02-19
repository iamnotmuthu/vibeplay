export interface DomainScenario {
    id: string
    datasetId: string
    defaultObjectiveId: string
    label: string
    industry: string
    tagline: string
    heroHeadline: string
    heroSubtitle: string
    color: string
    gradient: string
    icon: string // lucide icon name
    badge: string
    stageSubtitles: {
        eda: string
        patterns: string
        features: string
        arena: string
        evaluation: string
        drift: string
    }
}

export const DOMAIN_SCENARIOS: DomainScenario[] = [
    {
        id: 'telco-churn',
        datasetId: 'telco-churn',
        defaultObjectiveId: 'churn-predict',
        label: 'Telco Customer Churn',
        industry: 'Telecommunications',
        tagline: 'Stop churn before it happens',
        heroHeadline: 'Predict which customers will leave — before they do.',
        heroSubtitle:
            'Watch VibeModel autonomously analyze 7,000+ customer records, discover churn risk cohorts, and build a production-ready retention model in minutes.',
        color: '#3b82f6',
        gradient: 'from-blue-500 to-cyan-500',
        icon: 'phone',
        badge: 'Telecom',
        stageSubtitles: {
            eda: 'Injecting your business context — profiling usage patterns, billing behavior, and service tenure across 7,043 customers',
            patterns: 'Auto-discovering natural churn-risk cohorts and high-value customer segments hidden in your data',
            features: 'Engineering tenure ratios, usage velocity, and contract risk signals — no manual feature work required',
            arena: '6 algorithms competing to identify the most accurate churn predictor for your specific customer base',
            evaluation: 'Running the 360° Quality Gate — bias checks, threshold calibration, and white-box explainability for every prediction',
            drift: 'Continuous Monitoring for silent model drift — detecting seasonal churn spikes and plan-change distribution shifts',
        },
    },
    {
        id: 'credit-fraud',
        datasetId: 'credit-fraud',
        defaultObjectiveId: 'fraud-detect',
        label: 'Credit Card Fraud Detection',
        industry: 'Financial Services',
        tagline: 'Catch fraud. Protect customers.',
        heroHeadline: 'Detect fraudulent transactions in real-time, at scale.',
        heroSubtitle:
            'See how VibeModel handles extreme class imbalance, auto-discovers novel fraud cohorts, and delivers a precision-first model that protects revenue without blocking legitimate customers.',
        color: '#ef4444',
        gradient: 'from-red-500 to-orange-500',
        icon: 'shield',
        badge: 'Finance',
        stageSubtitles: {
            eda: 'Injecting business context — analyzing 50,000 transactions across 30 anonymized features for imbalance, anomalies, and data quality',
            patterns: 'Auto-discovering novel fraud cohorts and evolving attack vectors — no manual hypothesis required',
            features: 'Constructing velocity features, time-of-day signals, and behavioral fingerprints automatically',
            arena: 'Benchmarking 6 models on Precision-Recall AUC — the right metric for your imbalanced fraud data',
            evaluation: '360° Quality Gate — bias checks, threshold calibration, and white-box visibility into every fraud signal',
            drift: 'Continuous Monitoring for silent model drift — detecting new fraud patterns and triggering automatic retraining',
        },
    },
    {
        id: 'retail-demand',
        datasetId: 'store-demand',
        defaultObjectiveId: 'demand-forecast',
        label: 'Retail Demand Forecasting',
        industry: 'Retail & E-commerce',
        tagline: 'Right product, right place, right time',
        heroHeadline: 'Forecast demand across every store, every SKU.',
        heroSubtitle:
            'Watch VibeModel decompose seasonal trends, auto-discover demand cohorts, and build a forecast that cuts stockouts and reduces overstock — automatically.',
        color: '#10b981',
        gradient: 'from-emerald-500 to-teal-500',
        icon: 'trending-up',
        badge: 'Retail',
        stageSubtitles: {
            eda: 'Injecting business context — profiling 45,000 sales records across stores, SKUs, and promotional calendars',
            patterns: 'Auto-discovering seasonal cohorts, holiday demand clusters, and store-level patterns in your data',
            features: 'Engineering lag features, rolling averages, and promotion interaction terms — zero manual effort',
            arena: '6 models competing on RMSE — from linear baselines to gradient boosting ensembles',
            evaluation: '360° Quality Gate — validating forecast accuracy across peak and off-peak periods with full white-box visibility',
            drift: 'Continuous Monitoring for silent model drift — detecting demand shifts from new competitors or supply disruptions',
        },
    },
    {
        id: 'patient-readmission',
        datasetId: 'patient-readmission',
        defaultObjectiveId: 'readmit-predict',
        label: 'Patient Readmission Risk',
        industry: 'Healthcare',
        tagline: 'Intervene early. Improve outcomes.',
        heroHeadline: 'Identify high-risk patients before they leave the hospital.',
        heroSubtitle:
            'See VibeModel analyze clinical records, auto-discover risk factor cohorts, and build an explainable readmission model that care teams can trust and act on.',
        color: '#f59e0b',
        gradient: 'from-amber-500 to-yellow-500',
        icon: 'heart-pulse',
        badge: 'Healthcare',
        stageSubtitles: {
            eda: 'Injecting clinical business context — auditing 25,000 patient records across 35 clinical and demographic features',
            patterns: 'Auto-discovering high-risk patient cohorts and comorbidity clusters hidden in your clinical data',
            features: 'Extracting diagnosis interaction terms, length-of-stay signals, and care gap indicators automatically',
            arena: '6 algorithms competing on AUC-ROC — prioritizing recall for high-risk patient identification',
            evaluation: '360° Quality Gate — validating model fairness across age, diagnosis, and demographic cohorts with white-box explainability',
            drift: 'Continuous Monitoring for silent model drift — detecting seasonal admission shifts and protocol change drift',
        },
    },
    {
        id: 'employee-attrition',
        datasetId: 'employee-attrition',
        defaultObjectiveId: 'attrition-predict',
        label: 'Employee Attrition',
        industry: 'Human Resources',
        tagline: 'Retain your best people',
        heroHeadline: 'Know who\'s at risk of leaving — months before they do.',
        heroSubtitle:
            'Watch VibeModel analyze workforce data, auto-discover attrition cohorts, and build a retention model that helps HR teams intervene at exactly the right moment.',
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-500',
        icon: 'users',
        badge: 'HR & People',
        stageSubtitles: {
            eda: 'Injecting business context — profiling 14,999 employee records across compensation, tenure, satisfaction, and performance features',
            patterns: 'Auto-discovering flight-risk cohorts and high-performing retention segments hidden in your workforce data',
            features: 'Engineering satisfaction trajectories, promotion lag signals, and workload stress indicators automatically',
            arena: '6 models competing to identify the most accurate attrition predictor for your organization',
            evaluation: '360° Quality Gate — validating model fairness and white-box explainability for HR decision-making',
            drift: 'Continuous Monitoring for silent model drift — detecting attrition spikes from org changes or market salary shifts',
        },
    },
    {
        id: 'energy-consumption',
        datasetId: 'energy-consumption',
        defaultObjectiveId: 'energy-forecast',
        label: 'Energy Consumption Forecast',
        industry: 'Energy & Utilities',
        tagline: 'Optimize the grid. Reduce waste.',
        heroHeadline: 'Forecast energy demand to the hour — across every zone.',
        heroSubtitle:
            'See VibeModel decompose weather-driven demand patterns, auto-discover consumption cohorts, and deliver a forecast that helps grid operators balance load and cut costs.',
        color: '#06b6d4',
        gradient: 'from-cyan-500 to-sky-500',
        icon: 'zap',
        badge: 'Energy',
        stageSubtitles: {
            eda: 'Injecting business context — analyzing 35,000 hourly consumption readings across temperature, time, and zone features',
            patterns: 'Auto-discovering peak demand cohorts, off-peak efficiency zones, and anomalous consumption spikes',
            features: 'Engineering weather interaction terms, time-of-use signals, and rolling demand windows automatically',
            arena: '6 models competing on MAPE — from ARIMA baselines to neural ensembles',
            evaluation: '360° Quality Gate — validating forecast accuracy across peak, shoulder, and off-peak periods with white-box visibility',
            drift: 'Continuous Monitoring for silent model drift — detecting demand shifts from new industrial loads or extreme weather events',
        },
    },
    {
        id: 'insurance-claims',
        datasetId: 'insurance-claims',
        defaultObjectiveId: 'claims-fraud',
        label: 'Insurance Claims Fraud',
        industry: 'Insurance',
        tagline: 'Spot fraudulent claims instantly',
        heroHeadline: 'Flag suspicious insurance claims before they\'re paid out.',
        heroSubtitle:
            'Watch VibeModel analyze claim patterns, auto-discover fraud cohorts, and build a model that catches inflated and fabricated claims — while keeping legitimate claimants happy.',
        color: '#ec4899',
        gradient: 'from-pink-500 to-rose-500',
        icon: 'file-search',
        badge: 'Insurance',
        stageSubtitles: {
            eda: 'Injecting business context — profiling 40,000 insurance claims across policy, claimant, and incident features',
            patterns: 'Auto-discovering fraud cohorts, staged accident clusters, and inflated repair networks in your claims data',
            features: 'Engineering claim velocity, provider network signals, and policy anomaly scores automatically',
            arena: '6 algorithms competing on Precision-Recall AUC for imbalanced fraud detection',
            evaluation: '360° Quality Gate — validating model performance against SLA thresholds with white-box visibility into every fraud signal',
            drift: 'Continuous Monitoring for silent model drift — detecting emerging fraud schemes and seasonal claim pattern shifts',
        },
    },
    {
        id: 'predictive-maintenance',
        datasetId: 'predictive-maintenance',
        defaultObjectiveId: 'maint-predict',
        label: 'Predictive Maintenance',
        industry: 'Manufacturing & IoT',
        tagline: 'Fix it before it breaks',
        heroHeadline: 'Predict equipment failures before they shut down your line.',
        heroSubtitle:
            'Watch VibeModel analyse 50,000 sensor readings, discover failure-precursor cohorts, and build a maintenance model that eliminates unplanned downtime and reduces repair costs.',
        color: '#f97316',
        gradient: 'from-orange-500 to-amber-500',
        icon: 'settings',
        badge: 'Manufacturing',
        stageSubtitles: {
            eda: 'Injecting business context — profiling 50,000 sensor readings across vibration, temperature, pressure, and cycle-count features',
            patterns: 'Auto-discovering failure-precursor cohorts, wear-state clusters, and anomalous operating regimes in your sensor data',
            features: 'Engineering rolling degradation signals, inter-sensor ratios, and time-to-failure proxies automatically',
            arena: '6 models competing on Recall@95%Precision — prioritising early failure detection over false-alarm rate',
            evaluation: '360° Quality Gate — validating model fairness across machine types and operating conditions with white-box explainability',
            drift: 'Continuous Monitoring for silent model drift — detecting sensor calibration drift and new failure modes from updated equipment',
        },
    },
]

export function getDomainById(id: string): DomainScenario | undefined {
    return DOMAIN_SCENARIOS.find((d) => d.id === id)
}
