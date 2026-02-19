import type { ModelSelectionResults } from '@/store/types'

const modelDataMap: Record<string, ModelSelectionResults> = {
  'telco-churn': {
    champion: 'Logistic Regression',
    modelFunction:
      'Predicts the probability that a customer will churn within the next billing cycle, producing a score between 0 and 1.',
    modelType: 'Binary Classification — Supervised Learning',
    components: [
      {
        name: 'Feature Preprocessor',
        role: 'Normalises continuous inputs and one-hot encodes categoricals before training.',
        factors: [
          { name: 'Scaling', value: 'StandardScaler (μ=0, σ=1)' },
          { name: 'Encoding', value: 'OneHotEncoder (sparse=False)' },
          { name: 'Imputation', value: 'Median for numerical, mode for categorical' },
        ],
      },
      {
        name: 'Regulariser',
        role: 'Shrinks feature coefficients to reduce overfitting on correlated service-usage attributes.',
        factors: [
          { name: 'Penalty', value: 'L2 (Ridge)' },
          { name: 'Inverse strength (C)', value: '0.8' },
          { name: 'Solver', value: 'lbfgs' },
        ],
      },
      {
        name: 'Linear Scorer',
        role: 'Computes a weighted dot product of preprocessed features to produce a raw churn score.',
        factors: [
          { name: 'Weights', value: 'Learned via LBFGS optimisation' },
          { name: 'Intercept', value: 'Bias term (fitted)' },
          { name: 'Top driver', value: 'Contract_Month-to-month (+2.31)' },
        ],
      },
      {
        name: 'Sigmoid Activator',
        role: 'Maps raw score to a calibrated churn probability in [0, 1].',
        factors: [
          { name: 'Output range', value: '0 – 1' },
          { name: 'Decision threshold', value: '0.42 (recall-optimised)' },
          { name: 'Calibration', value: 'Platt scaling' },
        ],
      },
    ],
    whyThisModel:
      'Logistic Regression delivers strong baseline performance on tabular churn data, produces interpretable coefficients for each feature, and generalises well without extensive hyperparameter tuning. Its probability output integrates directly with intervention scoring systems, making it the operationally preferred choice over more complex ensemble methods that offer marginal accuracy gains at significant explainability cost.',
    performance: [
      { category: 'sufficient', label: 'Sufficient Data', recall: 91, precision: 88 },
      { category: 'insufficient', label: 'Insufficient Data', recall: 74, precision: 68 },
      { category: 'helpMe', label: 'Help Me', recall: 62, precision: 55 },
    ],
  },

  'credit-fraud': {
    champion: 'XGBoost',
    modelFunction:
      'Assigns a fraud-risk score to each transaction, flagging those above a calibrated threshold for review.',
    modelType: 'Binary Classification — Supervised Learning (Imbalanced)',
    components: [
      {
        name: 'Feature Preprocessor',
        role: 'Encodes card, merchant, and time-window features into a dense numerical matrix.',
        factors: [
          { name: 'Time encoding', value: 'Cyclical sin/cos for hour-of-day' },
          { name: 'Amount scaling', value: 'Log1p transform' },
          { name: 'Cardinality cap', value: 'Top-50 merchants, rest → "Other"' },
        ],
      },
      {
        name: 'Gradient Boosted Trees',
        role: 'Iteratively adds shallow decision trees that correct residuals from prior rounds.',
        factors: [
          { name: 'Estimators', value: '400' },
          { name: 'Max depth', value: '5' },
          { name: 'Learning rate (η)', value: '0.07' },
        ],
      },
      {
        name: 'Imbalance Handler',
        role: 'Compensates for the rare-fraud class to prevent the model from predicting "legit" for everything.',
        factors: [
          { name: 'Strategy', value: 'scale_pos_weight = 200' },
          { name: 'Subsample', value: '0.85' },
          { name: 'Colsample_bytree', value: '0.80' },
        ],
      },
      {
        name: 'Threshold Calibrator',
        role: 'Sets the classification cutoff to balance fraud recall against false-positive rate for review queues.',
        factors: [
          { name: 'Decision threshold', value: '0.31 (precision-recall balanced)' },
          { name: 'Calibration', value: 'Isotonic regression' },
          { name: 'Optimisation metric', value: 'F-beta (β=2, recall-weighted)' },
        ],
      },
    ],
    whyThisModel:
      'XGBoost captures non-linear interactions between transaction amount, time patterns, and merchant categories that logistic regression misses. Its native support for imbalanced class weighting and built-in regularisation (L1+L2) prevents overfitting on the rare fraud class, while SHAP-based feature importance preserves model explainability for compliance reporting.',
    performance: [
      { category: 'sufficient', label: 'Sufficient Data', recall: 94, precision: 91 },
      { category: 'insufficient', label: 'Insufficient Data', recall: 81, precision: 73 },
      { category: 'helpMe', label: 'Help Me', recall: 68, precision: 60 },
    ],
  },

  'store-demand': {
    champion: 'LightGBM Regressor',
    modelFunction:
      'Forecasts weekly unit demand per store-SKU combination, enabling inventory replenishment planning up to 4 weeks ahead.',
    modelType: 'Regression — Supervised Learning (Time-Series Features)',
    components: [
      {
        name: 'Lag Feature Builder',
        role: 'Constructs rolling statistics and historical demand lags to encode temporal structure.',
        factors: [
          { name: 'Lag windows', value: '1, 4, 8, 12 weeks' },
          { name: 'Rolling features', value: 'Mean, std, min, max (4w)' },
          { name: 'Seasonality', value: 'Week-of-year cyclical encoding' },
        ],
      },
      {
        name: 'Gradient Boosted Trees',
        role: 'Learns complex interactions between store attributes, promotions, and lagged demand signals.',
        factors: [
          { name: 'Estimators', value: '600' },
          { name: 'Num leaves', value: '63' },
          { name: 'Learning rate', value: '0.05' },
        ],
      },
      {
        name: 'Promotion Adjuster',
        role: 'Applies a learned multiplicative uplift for promotion weeks to correct systematic under-forecasting.',
        factors: [
          { name: 'Promo flag encoding', value: 'Binary + interaction terms' },
          { name: 'Uplift range', value: '1.15× – 2.4×' },
          { name: 'Training strategy', value: 'Trained on promo-week subset' },
        ],
      },
      {
        name: 'Output Clipper',
        role: 'Enforces non-negative demand predictions and caps extreme outliers.',
        factors: [
          { name: 'Floor', value: '0 units' },
          { name: 'Ceiling', value: '99th-percentile demand' },
          { name: 'Post-processing', value: 'Store-capacity constraint' },
        ],
      },
    ],
    whyThisModel:
      'LightGBM provides the best trade-off between forecast accuracy and training speed on wide panel data with hundreds of store-SKU pairs. Its leaf-wise growth strategy captures sparse promotion effects more efficiently than symmetric tree methods, and gradient-based feature selection naturally downweights noisy store attributes that vary randomly across weeks.',
    performance: [
      { category: 'sufficient', label: 'Sufficient Data', recall: 89, precision: 86 },
      { category: 'insufficient', label: 'Insufficient Data', recall: 72, precision: 65 },
      { category: 'helpMe', label: 'Help Me', recall: 58, precision: 51 },
    ],
  },

  'patient-readmission': {
    champion: 'Random Forest',
    modelFunction:
      'Predicts the probability of a patient being readmitted to hospital within 30 days of discharge.',
    modelType: 'Binary Classification — Supervised Learning',
    components: [
      {
        name: 'Clinical Feature Encoder',
        role: 'Translates ICD-10 diagnosis codes, medication lists, and lab results into structured numeric features.',
        factors: [
          { name: 'Diagnosis encoding', value: 'CCS grouper (283 categories)' },
          { name: 'Medication', value: 'ATC level-2 frequency counts' },
          { name: 'Lab flags', value: 'Out-of-range binary indicators' },
        ],
      },
      {
        name: 'Decision Forest',
        role: 'Aggregates 500 independently trained decision trees to produce a robust readmission probability.',
        factors: [
          { name: 'Estimators', value: '500' },
          { name: 'Max features', value: 'sqrt(n_features)' },
          { name: 'Max depth', value: '18' },
        ],
      },
      {
        name: 'Class Balancer',
        role: 'Accounts for the lower base rate of readmission via balanced class weights.',
        factors: [
          { name: 'Class weight', value: 'balanced (sklearn)' },
          { name: 'Minority oversampling', value: 'SMOTE (k=5)' },
          { name: 'Resampling ratio', value: '1:3 (readmit:no-readmit)' },
        ],
      },
      {
        name: 'Risk Stratifier',
        role: 'Bins predicted probabilities into Low / Medium / High risk tiers for clinical workflow routing.',
        factors: [
          { name: 'Low risk', value: '< 0.20 probability' },
          { name: 'Medium risk', value: '0.20 – 0.55' },
          { name: 'High risk', value: '> 0.55 → Care Management' },
        ],
      },
    ],
    whyThisModel:
      'Random Forest is robust to the heterogeneous mix of sparse categorical (diagnosis codes) and dense numerical (lab values) features typical of clinical data. Unlike linear models, it captures non-linear interactions between comorbidities and social determinants without requiring extensive feature engineering. Its ensemble nature also provides natural variance estimates that clinicians can use to assess prediction confidence.',
    performance: [
      { category: 'sufficient', label: 'Sufficient Data', recall: 88, precision: 84 },
      { category: 'insufficient', label: 'Insufficient Data', recall: 71, precision: 64 },
      { category: 'helpMe', label: 'Help Me', recall: 60, precision: 53 },
    ],
  },

  'employee-attrition': {
    champion: 'Logistic Regression',
    modelFunction:
      'Estimates the probability that an employee will voluntarily leave the organisation within the next quarter.',
    modelType: 'Binary Classification — Supervised Learning',
    components: [
      {
        name: 'HR Feature Preprocessor',
        role: 'Scales tenure and compensation, encodes job level, and derives derived engagement signals.',
        factors: [
          { name: 'Scaling', value: 'MinMaxScaler for salary bands' },
          { name: 'Encoding', value: 'Ordinal for JobLevel, OHE for Department' },
          { name: 'Derived features', value: 'SatisfactionIndex, OverTimeBurden' },
        ],
      },
      {
        name: 'Regulariser',
        role: 'L1 penalty for automatic feature selection across the wide HR attribute set.',
        factors: [
          { name: 'Penalty', value: 'L1 (Lasso)' },
          { name: 'Inverse strength (C)', value: '0.5' },
          { name: 'Solver', value: 'liblinear' },
        ],
      },
      {
        name: 'Linear Scorer',
        role: 'Produces a weighted sum that highlights the most predictive retention risk signals.',
        factors: [
          { name: 'Weights', value: 'Sparse (L1 zeroes irrelevant features)' },
          { name: 'Top driver', value: 'OverTime_Yes (+1.87)' },
          { name: 'Protective factor', value: 'JobSatisfaction (-1.42)' },
        ],
      },
      {
        name: 'Sigmoid Activator',
        role: 'Converts the attrition score to a retention-risk probability for HR dashboard display.',
        factors: [
          { name: 'Output range', value: '0 – 1' },
          { name: 'Decision threshold', value: '0.38 (sensitivity-tuned)' },
          { name: 'Alert tier', value: '>0.6 → HR Manager flag' },
        ],
      },
    ],
    whyThisModel:
      'Logistic Regression with L1 regularisation performs feature selection automatically, reducing the 34-attribute HR dataset to a compact set of high-signal predictors. The resulting coefficients are directly interpretable as odds ratios, making it straightforward for HR business partners to explain predictions to managers without a data science background.',
    performance: [
      { category: 'sufficient', label: 'Sufficient Data', recall: 85, precision: 82 },
      { category: 'insufficient', label: 'Insufficient Data', recall: 69, precision: 62 },
      { category: 'helpMe', label: 'Help Me', recall: 57, precision: 50 },
    ],
  },

  'energy-consumption': {
    champion: 'LightGBM Regressor',
    modelFunction:
      'Forecasts hourly building energy consumption (kWh) up to 24 hours ahead, given weather conditions and occupancy schedules.',
    modelType: 'Regression — Supervised Learning (Time-Series Features)',
    components: [
      {
        name: 'Weather Feature Builder',
        role: 'Encodes temperature, humidity, and solar irradiance into lag and rolling-window features.',
        factors: [
          { name: 'Temperature lags', value: '1h, 3h, 6h, 24h' },
          { name: 'Humidity rolling', value: 'Mean over 6h window' },
          { name: 'Solar proxy', value: 'sin(hour × π/12) × season_factor' },
        ],
      },
      {
        name: 'Occupancy Encoder',
        role: 'Integrates scheduled occupancy and calendar flags to model behavioural load patterns.',
        factors: [
          { name: 'Occupancy', value: 'Continuous fraction (0–1)' },
          { name: 'Calendar', value: 'Holiday, weekend binary flags' },
          { name: 'HVAC schedule', value: 'Peak / Off-peak mode indicator' },
        ],
      },
      {
        name: 'Gradient Boosted Trees',
        role: 'Captures non-linear interactions between weather, occupancy, and time-of-day demand patterns.',
        factors: [
          { name: 'Estimators', value: '500' },
          { name: 'Num leaves', value: '31' },
          { name: 'Learning rate', value: '0.05' },
        ],
      },
      {
        name: 'Residual Corrector',
        role: 'Applies a post-hoc correction layer trained on systematic over/under-forecast patterns.',
        factors: [
          { name: 'Method', value: 'Quantile linear regression on residuals' },
          { name: 'Target', value: 'P10, P50, P90 intervals' },
          { name: 'Update frequency', value: 'Weekly refit on 30-day rolling window' },
        ],
      },
    ],
    whyThisModel:
      'LightGBM excels at modelling the multivariate interactions between weather variables and occupancy schedules that drive energy demand, while training fast enough to support daily model refreshes on streaming sensor data. Its quantile-regression extension provides prediction intervals that facility managers rely on for demand-response bidding decisions.',
    performance: [
      { category: 'sufficient', label: 'Sufficient Data', recall: 92, precision: 89 },
      { category: 'insufficient', label: 'Insufficient Data', recall: 77, precision: 70 },
      { category: 'helpMe', label: 'Help Me', recall: 63, precision: 57 },
    ],
  },

  'insurance-claims': {
    champion: 'XGBoost',
    modelFunction:
      'Predicts the likelihood and estimated severity of an insurance claim for a given policyholder, supporting underwriting and fraud triage.',
    modelType: 'Binary Classification + Severity Regression — Supervised Learning',
    components: [
      {
        name: 'Policy Feature Encoder',
        role: 'Transforms policy terms, vehicle/property attributes, and coverage details into model-ready features.',
        factors: [
          { name: 'Vehicle age', value: 'Log-transformed' },
          { name: 'Coverage type', value: 'Ordinal encoding by risk tier' },
          { name: 'Policyholder tenure', value: 'Log1p (years with insurer)' },
        ],
      },
      {
        name: 'Gradient Boosted Trees',
        role: 'Primary claim-propensity estimator combining policyholder risk factors with historical claim patterns.',
        factors: [
          { name: 'Estimators', value: '350' },
          { name: 'Max depth', value: '6' },
          { name: 'Learning rate', value: '0.06' },
        ],
      },
      {
        name: 'Fraud Signal Detector',
        role: 'Secondary sub-tree ensemble that flags patterns associated with inflated or fabricated claims.',
        factors: [
          { name: 'Anomaly signals', value: 'Claim-to-premium ratio, repair network' },
          { name: 'Sub-model weight', value: '0.25 blend into final score' },
          { name: 'Alert threshold', value: '>0.70 → SIU referral' },
        ],
      },
      {
        name: 'Severity Estimator',
        role: 'Separate regression head predicting expected claim cost (£) conditioned on claim occurring.',
        factors: [
          { name: 'Architecture', value: 'XGBoost Regressor (log-target)' },
          { name: 'Loss function', value: 'Tweedie (p=1.5)' },
          { name: 'Output', value: 'Back-transformed £ estimate' },
        ],
      },
    ],
    whyThisModel:
      'XGBoost captures complex non-linear risk interactions that actuarial GLMs miss, particularly in niche policy segments with sparse historical data. Its two-stage architecture (propensity → severity) aligns naturally with insurance pricing workflows, and the built-in fraud-signal sub-model reduces the operational overhead of running separate fraud and propensity pipelines.',
    performance: [
      { category: 'sufficient', label: 'Sufficient Data', recall: 90, precision: 87 },
      { category: 'insufficient', label: 'Insufficient Data', recall: 75, precision: 68 },
      { category: 'helpMe', label: 'Help Me', recall: 61, precision: 54 },
    ],
  },
  'predictive-maintenance': {
    champion: 'Random Forest',
    modelFunction:
      'Classifies whether a machine will fail within the next 24 hours based on rolling sensor readings, cycle counts, and degradation trend features.',
    modelType: 'Binary Classification — Supervised Learning (Imbalanced, Time-Series Features)',
    components: [
      {
        name: 'Sensor Feature Builder',
        role: 'Constructs rolling statistics and trend indicators from raw vibration, temperature, and pressure time series.',
        factors: [
          { name: 'Rolling windows', value: '1h, 6h, 12h, 24h, 48h' },
          { name: 'Trend features', value: 'Linear slope over 6h and 24h windows' },
          { name: 'Rate-of-change', value: 'Delta between consecutive readings' },
        ],
      },
      {
        name: 'Decision Forest',
        role: 'Aggregates 500 independently trained trees to robustly classify pre-failure sensor patterns.',
        factors: [
          { name: 'Estimators', value: '500' },
          { name: 'Max features', value: 'sqrt(n_features)' },
          { name: 'Max depth', value: '20' },
        ],
      },
      {
        name: 'Class Balancer',
        role: 'Addresses the rare-failure class imbalance to prevent the model from predicting "healthy" for everything.',
        factors: [
          { name: 'Strategy', value: 'Balanced class weights + SMOTE' },
          { name: 'Resampling ratio', value: '1:5 (failure:healthy)' },
          { name: 'Minority class', value: 'Pre-failure degradation cohort' },
        ],
      },
      {
        name: 'Threshold Calibrator',
        role: 'Sets the failure alert threshold to maximise recall while keeping false alarm rate below operational tolerance.',
        factors: [
          { name: 'Decision threshold', value: '0.35 (recall-optimised)' },
          { name: 'Calibration', value: 'Platt scaling on hold-out set' },
          { name: 'Optimisation metric', value: 'Recall @ 95% Precision' },
        ],
      },
    ],
    whyThisModel:
      'Random Forest handles the heterogeneous mix of rolling sensor statistics and categorical machine-type features better than linear models, without requiring extensive hyperparameter tuning. Its ensemble nature reduces sensitivity to individual noisy sensor readings, and the natural feature importance scores directly support maintenance team interpretability — enabling engineers to understand which sensor trends triggered each alert.',
    performance: [
      { category: 'sufficient', label: 'Sufficient Data', recall: 91, precision: 88 },
      { category: 'insufficient', label: 'Insufficient Data', recall: 70, precision: 63 },
      { category: 'helpMe', label: 'Help Me', recall: 58, precision: 51 },
    ],
  },
}

export function getPrecomputedModelSelection(datasetId: string): ModelSelectionResults {
  return modelDataMap[datasetId] ?? modelDataMap['telco-churn']
}
