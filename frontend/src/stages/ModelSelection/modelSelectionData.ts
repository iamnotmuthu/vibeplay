import type { ModelSelectionResults } from '@/store/types'

const modelDataMap: Record<string, ModelSelectionResults> = {
  // ── Logistic Regression ────────────────────────────────────────────────────
  'telco-churn': {
    champion: 'Logistic Regression',
    modelFunction: 'Predicts the probability that a customer will churn within the next billing cycle, producing a score between 0 and 1.',
    modelType: 'Binary Classification — Supervised Learning',
    overallRecall: 88,
    overallPrecision: 85,
    primaryMetric: 'Recall',
    secondaryMetric: 'Precision',
    metricStatement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'one_hot_encoding',
        factors: [
          { name: 'Unordered category count', level: 'Median' },
          { name: 'Ranked category count', level: 'Low' },
          { name: 'Sparse feature space', level: 'Low' },
        ],
        params: [
          { name: 'Encoding', value: 'OneHotEncoder (sparse=False)' },
          { name: 'Scaling', value: 'StandardScaler (μ=0, σ=1)' },
          { name: 'Imputation', value: 'Median numerical, mode categorical' },
        ],
      },
      {
        subtype: 'explicit_regularization',
        subtypeLabel: 'Explicit Regularization',
        name: 'elastic_net',
        factors: [
          { name: 'Rows to columns ratio', level: 'Median' },
          { name: 'Feature collinearity', level: 'Median' },
          { name: 'Overfitting risk', level: 'Low' },
        ],
        params: [
          { name: 'Penalty', value: 'L2 (Ridge)' },
          { name: 'Inverse strength (C)', value: '0.8' },
          { name: 'Solver', value: 'lbfgs' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'linear_predictor',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'Low' },
          { name: 'Curve patterns in data', level: 'Low' },
          { name: 'Sudden data shifts', level: 'Low' },
          { name: 'Feature interaction strength', level: 'Low' },
          { name: 'Data diversity measure', level: 'Low' },
          { name: 'Multiple target impactful cluster presence', level: 'Low' },
          { name: 'Data noise level', level: 'Low' },
          { name: 'Outlier percentage', level: 'Median' },
          { name: 'Ranked category count', level: 'Median' },
          { name: 'Unordered category count', level: 'Median' },
          { name: 'Number fields count', level: 'Median' },
          { name: 'Explainability requirement', level: 'Yes' },
        ],
        params: [
          { name: 'Weights', value: 'Learned via LBFGS optimisation' },
          { name: 'Top driver', value: 'Contract_Month-to-month (+2.31)' },
          { name: 'Decision threshold', value: '0.42 (recall-optimised)' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'binary_crossentropy',
        factors: [
          { name: 'Target type', level: 'Binary' },
          { name: 'Class imbalance', level: 'Low' },
          { name: 'Probability calibration need', level: 'Median' },
        ],
        params: [
          { name: 'Function', value: 'Log loss (binary cross-entropy)' },
          { name: 'Calibration', value: 'Platt scaling' },
          { name: 'Output range', value: '0 – 1' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'lbfgs',
        factors: [
          { name: 'Dataset size', level: 'Median' },
          { name: 'Feature dimensionality', level: 'Median' },
          { name: 'Convergence speed requirement', level: 'Median' },
        ],
        params: [
          { name: 'Algorithm', value: 'Limited-memory BFGS' },
          { name: 'Max iterations', value: '200' },
          { name: 'Tolerance', value: '1e-4' },
        ],
      },
    ],
    whyThisModel: 'Logistic Regression delivers strong baseline performance on tabular churn data, produces interpretable coefficients for each feature, and generalises well without extensive hyperparameter tuning. Its probability output integrates directly with intervention scoring systems, making it the operationally preferred choice over more complex ensemble methods that offer marginal accuracy gains at significant explainability cost.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 91, precision: 88 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 74, precision: 68 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 62, precision: 55 },
    ],
  },

  // ── XGBoost ───────────────────────────────────────────────────────────────
  'credit-fraud': {
    champion: 'XGBoost',
    modelFunction: 'Assigns a fraud-risk score to each transaction, flagging those above a calibrated threshold for review.',
    modelType: 'Binary Classification — Supervised Learning (Imbalanced)',
    overallRecall: 91,
    overallPrecision: 88,
    primaryMetric: 'Recall',
    secondaryMetric: 'Precision',
    metricStatement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'label_encoder',
        factors: [
          { name: 'High-cardinality categorical features', level: 'Median' },
          { name: 'Cyclical time features', level: 'High' },
          { name: 'Skewed numerical distributions', level: 'High' },
        ],
        params: [
          { name: 'Time encoding', value: 'Cyclical sin/cos for hour-of-day' },
          { name: 'Amount scaling', value: 'Log1p transform' },
          { name: 'Cardinality cap', value: 'Top-50 merchants → "Other"' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'gradient_boosted_trees',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Feature interaction strength', level: 'High' },
          { name: 'Data diversity measure', level: 'High' },
          { name: 'Curve patterns in data', level: 'High' },
          { name: 'Multiple target impactful cluster presence', level: 'High' },
          { name: 'Outlier percentage', level: 'Median' },
          { name: 'Data noise level', level: 'Median' },
          { name: 'Explainability requirement', level: 'Median' },
        ],
        params: [
          { name: 'Estimators', value: '400' },
          { name: 'Max depth', value: '5' },
          { name: 'Learning rate (η)', value: '0.07' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'depth_and_estimators',
        factors: [
          { name: 'Dataset volume', level: 'High' },
          { name: 'Signal-to-noise ratio', level: 'Median' },
          { name: 'Training time budget', level: 'Median' },
        ],
        params: [
          { name: 'Max depth', value: '5' },
          { name: 'N estimators', value: '400' },
          { name: 'Subsample', value: '0.85' },
        ],
      },
      {
        subtype: 'explicit_regularization',
        subtypeLabel: 'Explicit Regularization',
        name: 'l1_l2_regularization',
        factors: [
          { name: 'Overfitting risk (rare class)', level: 'High' },
          { name: 'Feature collinearity', level: 'Median' },
          { name: 'Irrelevant feature count', level: 'Median' },
        ],
        params: [
          { name: 'L1 (alpha)', value: '0.1' },
          { name: 'L2 (lambda)', value: '1.0' },
          { name: 'Colsample_bytree', value: '0.80' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'binary_crossentropy',
        factors: [
          { name: 'Target type', level: 'Binary' },
          { name: 'Class imbalance', level: 'High' },
          { name: 'Cost of false negatives', level: 'High' },
        ],
        params: [
          { name: 'Objective', value: 'binary:logistic' },
          { name: 'scale_pos_weight', value: '200 (fraud:legit ratio)' },
          { name: 'Optimisation metric', value: 'F-beta (β=2, recall-weighted)' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'second_order_gradient_descent',
        factors: [
          { name: 'Dataset size', level: 'High' },
          { name: 'Convergence speed requirement', level: 'High' },
          { name: 'Sparse gradient structure', level: 'Median' },
        ],
        params: [
          { name: 'Algorithm', value: 'Newton boosting (2nd-order gradient)' },
          { name: 'Tree method', value: 'hist (histogram-based)' },
          { name: 'Early stopping rounds', value: '30' },
        ],
      },
      {
        subtype: 'inference_tuning',
        subtypeLabel: 'Inference Tuning',
        name: 'threshold_calibrator',
        factors: [
          { name: 'Precision-recall trade-off sensitivity', level: 'High' },
          { name: 'Downstream queue capacity', level: 'Median' },
          { name: 'False positive cost', level: 'High' },
        ],
        params: [
          { name: 'Decision threshold', value: '0.31 (precision-recall balanced)' },
          { name: 'Calibration', value: 'Isotonic regression' },
          { name: 'Output', value: 'Calibrated fraud probability [0,1]' },
        ],
      },
    ],
    whyThisModel: 'XGBoost captures non-linear interactions between transaction amount, time patterns, and merchant categories that logistic regression misses. Its native support for imbalanced class weighting and built-in regularisation (L1+L2) prevents overfitting on the rare fraud class, while SHAP-based feature importance preserves model explainability for compliance reporting.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 94, precision: 91 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 81, precision: 73 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 68, precision: 60 },
    ],
  },

  // ── LightGBM ──────────────────────────────────────────────────────────────
  'store-demand': {
    champion: 'LightGBM Regressor',
    modelFunction: 'Forecasts weekly unit demand per store-SKU combination, enabling inventory replenishment planning up to 4 weeks ahead.',
    modelType: 'Regression — Supervised Learning (Time-Series Features)',
    overallRecall: 86,
    overallPrecision: 82,
    primaryMetric: 'MAPE',
    secondaryMetric: 'RMSE',
    metricStatement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'lag_feature_builder',
        factors: [
          { name: 'Temporal autocorrelation', level: 'High' },
          { name: 'Seasonal signal strength', level: 'High' },
          { name: 'Cyclical pattern presence', level: 'High' },
        ],
        params: [
          { name: 'Lag windows', value: '1, 4, 8, 12 weeks' },
          { name: 'Rolling features', value: 'Mean, std, min, max (4w)' },
          { name: 'Seasonality encoding', value: 'Week-of-year cyclical sin/cos' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'leaf_wise_gradient_boosting',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Feature interaction strength', level: 'High' },
          { name: 'Sparse promotional effects', level: 'High' },
          { name: 'Data diversity measure', level: 'Median' },
          { name: 'Outlier percentage', level: 'Median' },
          { name: 'Explainability requirement', level: 'Median' },
        ],
        params: [
          { name: 'Estimators', value: '600' },
          { name: 'Num leaves', value: '63' },
          { name: 'Learning rate', value: '0.05' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'num_leaves_and_estimators',
        factors: [
          { name: 'Dataset volume', level: 'High' },
          { name: 'Feature dimensionality', level: 'Median' },
          { name: 'Training time budget', level: 'Median' },
        ],
        params: [
          { name: 'Num leaves', value: '63' },
          { name: 'N estimators', value: '600' },
          { name: 'Min child samples', value: '20' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'regression_l2',
        factors: [
          { name: 'Target type', level: 'Continuous' },
          { name: 'Outlier sensitivity tolerance', level: 'Median' },
          { name: 'Symmetric error penalty', level: 'Yes' },
        ],
        params: [
          { name: 'Objective', value: 'regression_l2 (MSE)' },
          { name: 'Post-processing', value: 'Promotion uplift multiplier 1.15–2.4×' },
          { name: 'Output floor', value: '0 units (non-negative clip)' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'histogram_gradient_descent',
        factors: [
          { name: 'Dataset size', level: 'High' },
          { name: 'Convergence speed requirement', level: 'High' },
          { name: 'Memory efficiency need', level: 'High' },
        ],
        params: [
          { name: 'Algorithm', value: 'Histogram-based gradient descent' },
          { name: 'Max bin', value: '255' },
          { name: 'Early stopping rounds', value: '50' },
        ],
      },
    ],
    whyThisModel: 'LightGBM provides the best trade-off between forecast accuracy and training speed on wide panel data with hundreds of store-SKU pairs. Its leaf-wise growth strategy captures sparse promotion effects more efficiently than symmetric tree methods, and gradient-based feature selection naturally downweights noisy store attributes that vary randomly across weeks.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 89, precision: 86 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 72, precision: 65 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 58, precision: 51 },
    ],
  },

  // ── Random Forest ─────────────────────────────────────────────────────────
  'patient-readmission': {
    champion: 'Random Forest',
    modelFunction: 'Predicts the probability of a patient being readmitted to hospital within 30 days of discharge.',
    modelType: 'Binary Classification — Supervised Learning',
    overallRecall: 85,
    overallPrecision: 81,
    primaryMetric: 'Recall',
    secondaryMetric: 'Precision',
    metricStatement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'clinical_feature_encoder',
        factors: [
          { name: 'Domain-specific categorical codes', level: 'High' },
          { name: 'Sparse diagnosis code space', level: 'High' },
          { name: 'Mixed feature types', level: 'High' },
        ],
        params: [
          { name: 'Diagnosis encoding', value: 'CCS grouper (283 categories)' },
          { name: 'Medication', value: 'ATC level-2 frequency counts' },
          { name: 'Lab flags', value: 'Out-of-range binary indicators' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'bootstrap_aggregated_trees',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Feature interaction strength', level: 'High' },
          { name: 'Heterogeneous feature types', level: 'High' },
          { name: 'Variance reduction need', level: 'High' },
          { name: 'Explainability requirement', level: 'Median' },
          { name: 'Data noise level', level: 'Median' },
        ],
        params: [
          { name: 'Estimators', value: '500' },
          { name: 'Max features', value: 'sqrt(n_features)' },
          { name: 'Max depth', value: '18' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'max_depth_and_features',
        factors: [
          { name: 'Dataset volume', level: 'Median' },
          { name: 'Feature dimensionality', level: 'High' },
          { name: 'Overfitting risk', level: 'Median' },
        ],
        params: [
          { name: 'Max depth', value: '18' },
          { name: 'Max features', value: 'sqrt(n_features)' },
          { name: 'Bootstrap', value: 'True' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'gini_impurity',
        factors: [
          { name: 'Target type', level: 'Binary' },
          { name: 'Class imbalance', level: 'Median' },
          { name: 'Split purity metric', level: 'Median' },
        ],
        params: [
          { name: 'Split criterion', value: 'Gini impurity' },
          { name: 'Class weight', value: 'balanced (sklearn)' },
          { name: 'Minority oversampling', value: 'SMOTE (k=5), 1:3 ratio' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'bagging',
        factors: [
          { name: 'Variance reduction need', level: 'High' },
          { name: 'Noisy feature tolerance', level: 'High' },
          { name: 'Parallelisation potential', level: 'High' },
        ],
        params: [
          { name: 'Algorithm', value: 'Bootstrap aggregation (bagging)' },
          { name: 'N jobs', value: '-1 (all cores)' },
          { name: 'Random state', value: '42' },
        ],
      },
      {
        subtype: 'inference_tuning',
        subtypeLabel: 'Inference Tuning',
        name: 'risk_stratifier',
        factors: [
          { name: 'Clinical workflow routing need', level: 'High' },
          { name: 'Decision threshold sensitivity', level: 'High' },
          { name: 'False negative clinical cost', level: 'High' },
        ],
        params: [
          { name: 'Low risk', value: '< 0.20 probability' },
          { name: 'Medium risk', value: '0.20 – 0.55' },
          { name: 'High risk', value: '> 0.55 → Care Management' },
        ],
      },
    ],
    whyThisModel: 'Random Forest is robust to the heterogeneous mix of sparse categorical (diagnosis codes) and dense numerical (lab values) features typical of clinical data. Unlike linear models, it captures non-linear interactions between comorbidities and social determinants without requiring extensive feature engineering. Its ensemble nature also provides natural variance estimates that clinicians can use to assess prediction confidence.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 88, precision: 84 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 71, precision: 64 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 60, precision: 53 },
    ],
  },

  // ── Logistic Regression (employee-attrition) ───────────────────────────────
  'employee-attrition': {
    champion: 'Logistic Regression',
    modelFunction: 'Estimates the probability that an employee will voluntarily leave the organisation within the next quarter.',
    modelType: 'Binary Classification — Supervised Learning',
    overallRecall: 82,
    overallPrecision: 79,
    primaryMetric: 'Recall',
    secondaryMetric: 'Precision',
    metricStatement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'one_hot_encoding',
        factors: [
          { name: 'Unordered category count', level: 'Median' },
          { name: 'Ranked category count', level: 'Median' },
          { name: 'Derived engagement signals', level: 'High' },
        ],
        params: [
          { name: 'Scaling', value: 'MinMaxScaler for salary bands' },
          { name: 'Encoding', value: 'Ordinal for JobLevel, OHE for Department' },
          { name: 'Derived features', value: 'SatisfactionIndex, OverTimeBurden' },
        ],
      },
      {
        subtype: 'explicit_regularization',
        subtypeLabel: 'Explicit Regularization',
        name: 'lasso_l1',
        factors: [
          { name: 'High feature dimensionality', level: 'High' },
          { name: 'Irrelevant feature count', level: 'High' },
          { name: 'Sparse coefficient preference', level: 'High' },
        ],
        params: [
          { name: 'Penalty', value: 'L1 (Lasso)' },
          { name: 'Inverse strength (C)', value: '0.5' },
          { name: 'Solver', value: 'liblinear' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'linear_predictor',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'Low' },
          { name: 'Feature interaction strength', level: 'Low' },
          { name: 'Curve patterns in data', level: 'Low' },
          { name: 'Outlier percentage', level: 'Low' },
          { name: 'Explainability requirement', level: 'Yes' },
          { name: 'Ranked category count', level: 'Median' },
          { name: 'Data noise level', level: 'Low' },
        ],
        params: [
          { name: 'Weights', value: 'Sparse (L1 zeroes irrelevant features)' },
          { name: 'Top driver', value: 'OverTime_Yes (+1.87)' },
          { name: 'Protective factor', value: 'JobSatisfaction (-1.42)' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'binary_crossentropy',
        factors: [
          { name: 'Target type', level: 'Binary' },
          { name: 'Class imbalance', level: 'Median' },
          { name: 'Probability calibration need', level: 'High' },
        ],
        params: [
          { name: 'Function', value: 'Log loss (binary cross-entropy)' },
          { name: 'Decision threshold', value: '0.38 (sensitivity-tuned)' },
          { name: 'Alert tier', value: '>0.6 → HR Manager flag' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'lbfgs',
        factors: [
          { name: 'Dataset size', level: 'Low' },
          { name: 'Feature dimensionality', level: 'Median' },
          { name: 'Convergence speed requirement', level: 'Median' },
        ],
        params: [
          { name: 'Algorithm', value: 'Limited-memory BFGS' },
          { name: 'Max iterations', value: '300' },
          { name: 'Tolerance', value: '1e-4' },
        ],
      },
    ],
    whyThisModel: 'Logistic Regression with L1 regularisation performs feature selection automatically, reducing the 34-attribute HR dataset to a compact set of high-signal predictors. The resulting coefficients are directly interpretable as odds ratios, making it straightforward for HR business partners to explain predictions to managers without a data science background.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 85, precision: 82 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 69, precision: 62 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 57, precision: 50 },
    ],
  },

  // ── LightGBM (energy-consumption) ─────────────────────────────────────────
  'energy-consumption': {
    champion: 'LightGBM Regressor',
    modelFunction: 'Forecasts hourly building energy consumption (kWh) up to 24 hours ahead, given weather conditions and occupancy schedules.',
    modelType: 'Regression — Supervised Learning (Time-Series Features)',
    overallRecall: 89,
    overallPrecision: 86,
    primaryMetric: 'MAPE',
    secondaryMetric: 'RMSE',
    metricStatement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'weather_feature_builder',
        factors: [
          { name: 'Temporal autocorrelation', level: 'High' },
          { name: 'Cyclical pattern presence', level: 'High' },
          { name: 'External weather signal strength', level: 'High' },
        ],
        params: [
          { name: 'Temperature lags', value: '1h, 3h, 6h, 24h' },
          { name: 'Humidity rolling', value: 'Mean over 6h window' },
          { name: 'Solar proxy', value: 'sin(hour × π/12) × season_factor' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'leaf_wise_gradient_boosting',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Feature interaction strength', level: 'High' },
          { name: 'Multivariate weather-occupancy interactions', level: 'High' },
          { name: 'Data diversity measure', level: 'High' },
          { name: 'Explainability requirement', level: 'Median' },
          { name: 'Outlier percentage', level: 'Low' },
        ],
        params: [
          { name: 'Estimators', value: '500' },
          { name: 'Num leaves', value: '31' },
          { name: 'Learning rate', value: '0.05' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'num_leaves_and_estimators',
        factors: [
          { name: 'Dataset volume', level: 'High' },
          { name: 'Daily refresh requirement', level: 'High' },
          { name: 'Training time budget', level: 'High' },
        ],
        params: [
          { name: 'Num leaves', value: '31' },
          { name: 'N estimators', value: '500' },
          { name: 'Min child samples', value: '20' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'regression_l2',
        factors: [
          { name: 'Target type', level: 'Continuous' },
          { name: 'Prediction interval need', level: 'High' },
          { name: 'Quantile estimation need', level: 'High' },
        ],
        params: [
          { name: 'Objective', value: 'regression_l2 (MSE)' },
          { name: 'Quantile extension', value: 'P10, P50, P90 intervals' },
          { name: 'Update frequency', value: 'Weekly refit on 30-day window' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'histogram_gradient_descent',
        factors: [
          { name: 'Dataset size', level: 'High' },
          { name: 'Streaming data update need', level: 'High' },
          { name: 'Memory efficiency need', level: 'High' },
        ],
        params: [
          { name: 'Algorithm', value: 'Histogram-based gradient descent' },
          { name: 'Max bin', value: '255' },
          { name: 'Early stopping rounds', value: '30' },
        ],
      },
    ],
    whyThisModel: 'LightGBM excels at modelling the multivariate interactions between weather variables and occupancy schedules that drive energy demand, while training fast enough to support daily model refreshes on streaming sensor data. Its quantile-regression extension provides prediction intervals that facility managers rely on for demand-response bidding decisions.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 92, precision: 89 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 77, precision: 70 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 63, precision: 57 },
    ],
  },

  // ── XGBoost (insurance-claims) ────────────────────────────────────────────
  'insurance-claims': {
    champion: 'XGBoost',
    modelFunction: 'Predicts the likelihood and estimated severity of an insurance claim, supporting underwriting and fraud triage.',
    modelType: 'Binary Classification + Severity Regression — Supervised Learning',
    overallRecall: 87,
    overallPrecision: 84,
    primaryMetric: 'Recall',
    secondaryMetric: 'Precision',
    metricStatement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'policy_feature_encoder',
        factors: [
          { name: 'Skewed numerical distributions', level: 'High' },
          { name: 'Ordinal risk-tier categories', level: 'High' },
          { name: 'Log-normal claim amounts', level: 'High' },
        ],
        params: [
          { name: 'Vehicle age', value: 'Log-transformed' },
          { name: 'Coverage type', value: 'Ordinal encoding by risk tier' },
          { name: 'Policyholder tenure', value: 'Log1p (years with insurer)' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'gradient_boosted_trees',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Feature interaction strength', level: 'High' },
          { name: 'Fraud signal sparsity', level: 'High' },
          { name: 'Multiple target impactful cluster presence', level: 'High' },
          { name: 'Explainability requirement', level: 'Median' },
          { name: 'Data noise level', level: 'Median' },
        ],
        params: [
          { name: 'Estimators', value: '350' },
          { name: 'Max depth', value: '6' },
          { name: 'Learning rate', value: '0.06' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'depth_and_estimators',
        factors: [
          { name: 'Dataset volume', level: 'High' },
          { name: 'Two-stage model complexity', level: 'High' },
          { name: 'Training time budget', level: 'Median' },
        ],
        params: [
          { name: 'Max depth', value: '6' },
          { name: 'N estimators', value: '350' },
          { name: 'Subsample', value: '0.85' },
        ],
      },
      {
        subtype: 'explicit_regularization',
        subtypeLabel: 'Explicit Regularization',
        name: 'l1_l2_regularization',
        factors: [
          { name: 'Overfitting risk (rare fraud)', level: 'High' },
          { name: 'Feature collinearity', level: 'Median' },
          { name: 'Sub-model blend complexity', level: 'High' },
        ],
        params: [
          { name: 'L1 (alpha)', value: '0.05' },
          { name: 'L2 (lambda)', value: '1.0' },
          { name: 'Fraud sub-model weight', value: '0.25 blend into final score' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'tweedie_loss',
        factors: [
          { name: 'Target type', level: 'Binary + Continuous severity' },
          { name: 'Zero-inflated severity distribution', level: 'High' },
          { name: 'Compound risk modelling need', level: 'High' },
        ],
        params: [
          { name: 'Classification', value: 'binary:logistic' },
          { name: 'Severity', value: 'Tweedie (p=1.5, log-target)' },
          { name: 'Alert threshold', value: '>0.70 → SIU referral' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'second_order_gradient_descent',
        factors: [
          { name: 'Dataset size', level: 'High' },
          { name: 'Convergence speed requirement', level: 'High' },
          { name: 'Two-stage objective complexity', level: 'High' },
        ],
        params: [
          { name: 'Algorithm', value: 'Newton boosting (2nd-order gradient)' },
          { name: 'Tree method', value: 'hist' },
          { name: 'Early stopping rounds', value: '25' },
        ],
      },
    ],
    whyThisModel: 'XGBoost captures complex non-linear risk interactions that actuarial GLMs miss, particularly in niche policy segments with sparse historical data. Its two-stage architecture (propensity → severity) aligns naturally with insurance pricing workflows, and the built-in fraud-signal sub-model reduces the operational overhead of running separate fraud and propensity pipelines.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 90, precision: 87 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 75, precision: 68 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 61, precision: 54 },
    ],
  },

  // ── Random Forest (predictive-maintenance) ────────────────────────────────
  'predictive-maintenance': {
    champion: 'Random Forest',
    modelFunction: 'Classifies whether a machine will fail within the next 24 hours based on rolling sensor readings, cycle counts, and degradation trend features.',
    modelType: 'Binary Classification — Supervised Learning (Imbalanced, Time-Series Features)',
    overallRecall: 88,
    overallPrecision: 85,
    primaryMetric: 'Recall',
    secondaryMetric: 'Precision',
    metricStatement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'sensor_feature_builder',
        factors: [
          { name: 'Temporal autocorrelation', level: 'High' },
          { name: 'Rapid degradation trend signals', level: 'High' },
          { name: 'Multi-sensor feature count', level: 'High' },
        ],
        params: [
          { name: 'Rolling windows', value: '1h, 6h, 12h, 24h, 48h' },
          { name: 'Trend features', value: 'Linear slope over 6h and 24h windows' },
          { name: 'Rate-of-change', value: 'Delta between consecutive readings' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'bootstrap_aggregated_trees',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Noisy sensor signal tolerance', level: 'High' },
          { name: 'Heterogeneous feature types', level: 'High' },
          { name: 'Variance reduction need', level: 'High' },
          { name: 'Explainability requirement', level: 'High' },
          { name: 'Data diversity measure', level: 'Median' },
        ],
        params: [
          { name: 'Estimators', value: '500' },
          { name: 'Max features', value: 'sqrt(n_features)' },
          { name: 'Max depth', value: '20' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'max_depth_and_features',
        factors: [
          { name: 'Dataset volume', level: 'High' },
          { name: 'Feature dimensionality', level: 'High' },
          { name: 'Failure class rarity', level: 'High' },
        ],
        params: [
          { name: 'Max depth', value: '20' },
          { name: 'Max features', value: 'sqrt(n_features)' },
          { name: 'Bootstrap', value: 'True' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'gini_impurity',
        factors: [
          { name: 'Target type', level: 'Binary' },
          { name: 'Class imbalance', level: 'High' },
          { name: 'Cost of missed failures', level: 'High' },
        ],
        params: [
          { name: 'Split criterion', value: 'Gini impurity' },
          { name: 'Strategy', value: 'Balanced class weights + SMOTE' },
          { name: 'Resampling ratio', value: '1:5 (failure:healthy)' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'bagging',
        factors: [
          { name: 'Variance reduction need', level: 'High' },
          { name: 'Noisy sensor reading tolerance', level: 'High' },
          { name: 'Parallelisation potential', level: 'High' },
        ],
        params: [
          { name: 'Algorithm', value: 'Bootstrap aggregation (bagging)' },
          { name: 'N jobs', value: '-1 (all cores)' },
          { name: 'Random state', value: '42' },
        ],
      },
      {
        subtype: 'inference_tuning',
        subtypeLabel: 'Inference Tuning',
        name: 'threshold_calibrator',
        factors: [
          { name: 'False alarm operational tolerance', level: 'Median' },
          { name: 'Decision threshold sensitivity', level: 'High' },
          { name: 'False negative downtime cost', level: 'High' },
        ],
        params: [
          { name: 'Decision threshold', value: '0.35 (recall-optimised)' },
          { name: 'Calibration', value: 'Platt scaling on hold-out set' },
          { name: 'Optimisation metric', value: 'Recall @ 95% Precision' },
        ],
      },
    ],
    whyThisModel: 'Random Forest handles the heterogeneous mix of rolling sensor statistics and categorical machine-type features better than linear models, without requiring extensive hyperparameter tuning. Its ensemble nature reduces sensitivity to individual noisy sensor readings, and the natural feature importance scores directly support maintenance team interpretability — enabling engineers to understand which sensor trends triggered each alert.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 91, precision: 88 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 70, precision: 63 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 58, precision: 51 },
    ],
  },

  // ── XGBoost (logistics-delivery-delay) ──────────────────────────────────
  'logistics-delivery-delay': {
    champion: 'XGBoost',
    modelFunction: 'Predicts the probability that a shipment will be delayed, producing a risk score between 0 and 1 for real-time delay alerting.',
    modelType: 'Binary Classification — Supervised Learning',
    overallRecall: 86,
    overallPrecision: 83,
    primaryMetric: 'Recall',
    secondaryMetric: 'Precision',
    metricStatement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'logistics_feature_encoder',
        factors: [
          { name: 'High-cardinality categorical features', level: 'Median' },
          { name: 'Mixed numeric and categorical types', level: 'High' },
          { name: 'Weather condition encoding need', level: 'Median' },
        ],
        params: [
          { name: 'Categorical', value: 'Label encoding for partner, vehicle, region' },
          { name: 'Numerical', value: 'StandardScaler for distance, weight, hours' },
          { name: 'Derived', value: 'delivery_speed = distance_km / actual_delivery_hours' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'gradient_boosted_trees',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Feature interaction strength', level: 'High' },
          { name: 'Weather-route interaction signals', level: 'High' },
          { name: 'Data diversity measure', level: 'Median' },
          { name: 'Explainability requirement', level: 'Median' },
          { name: 'Outlier percentage', level: 'Low' },
        ],
        params: [
          { name: 'Estimators', value: '300' },
          { name: 'Max depth', value: '6' },
          { name: 'Learning rate (η)', value: '0.08' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'depth_and_estimators',
        factors: [
          { name: 'Dataset volume', level: 'Median' },
          { name: 'Signal-to-noise ratio', level: 'Median' },
          { name: 'Training time budget', level: 'Low' },
        ],
        params: [
          { name: 'Max depth', value: '6' },
          { name: 'N estimators', value: '300' },
          { name: 'Subsample', value: '0.85' },
        ],
      },
      {
        subtype: 'explicit_regularization',
        subtypeLabel: 'Explicit Regularization',
        name: 'l1_l2_regularization',
        factors: [
          { name: 'Overfitting risk', level: 'Median' },
          { name: 'Feature collinearity (distance-time)', level: 'High' },
          { name: 'Irrelevant feature count', level: 'Low' },
        ],
        params: [
          { name: 'L1 (alpha)', value: '0.05' },
          { name: 'L2 (lambda)', value: '1.0' },
          { name: 'Colsample_bytree', value: '0.80' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'binary_crossentropy',
        factors: [
          { name: 'Target type', level: 'Binary' },
          { name: 'Class imbalance', level: 'Low' },
          { name: 'Cost of missed delays', level: 'High' },
        ],
        params: [
          { name: 'Objective', value: 'binary:logistic' },
          { name: 'Class weight', value: 'Balanced (auto)' },
          { name: 'Decision threshold', value: '0.40 (recall-optimised)' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'second_order_gradient_descent',
        factors: [
          { name: 'Dataset size', level: 'Median' },
          { name: 'Convergence speed requirement', level: 'Median' },
          { name: 'Sparse gradient structure', level: 'Low' },
        ],
        params: [
          { name: 'Algorithm', value: 'Newton boosting (2nd-order gradient)' },
          { name: 'Tree method', value: 'hist (histogram-based)' },
          { name: 'Early stopping rounds', value: '25' },
        ],
      },
    ],
    whyThisModel: 'XGBoost captures the complex non-linear interactions between route distance, weather conditions, and vehicle type that drive delivery delays. Its gradient boosting framework handles the mixed feature types (categorical partners, numeric distances) natively, while built-in regularisation prevents overfitting on weather-route interaction terms.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 89, precision: 86 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 72, precision: 65 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 60, precision: 53 },
    ],
  },

  // ── LightGBM (logistics-freight-cost) ───────────────────────────────────
  'logistics-freight-cost': {
    champion: 'LightGBM Regressor',
    modelFunction: 'Predicts the freight shipping cost in USD for each shipment, enabling instant quote generation and cost anomaly detection.',
    modelType: 'Regression — Supervised Learning',
    overallRecall: 84,
    overallPrecision: 80,
    primaryMetric: 'MAPE',
    secondaryMetric: 'RMSE',
    metricStatement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'freight_feature_builder',
        factors: [
          { name: 'Log-normal target distribution', level: 'High' },
          { name: 'High-cardinality country feature', level: 'High' },
          { name: 'Vendor term encoding need', level: 'Median' },
        ],
        params: [
          { name: 'Target transform', value: 'Log1p(freight_cost_usd)' },
          { name: 'Country encoding', value: 'Target encoding (smoothed)' },
          { name: 'Weight feature', value: 'Log-scaled weight_kg' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'leaf_wise_gradient_boosting',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Feature interaction strength', level: 'High' },
          { name: 'Sparse vendor-term effects', level: 'High' },
          { name: 'Data diversity measure', level: 'Median' },
          { name: 'Explainability requirement', level: 'Median' },
        ],
        params: [
          { name: 'Estimators', value: '400' },
          { name: 'Num leaves', value: '31' },
          { name: 'Learning rate', value: '0.05' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'num_leaves_and_estimators',
        factors: [
          { name: 'Dataset volume', level: 'Low' },
          { name: 'Feature dimensionality', level: 'Median' },
          { name: 'Training time budget', level: 'Low' },
        ],
        params: [
          { name: 'Num leaves', value: '31' },
          { name: 'N estimators', value: '400' },
          { name: 'Min child samples', value: '15' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'regression_l2',
        factors: [
          { name: 'Target type', level: 'Continuous (log-scale)' },
          { name: 'Outlier sensitivity tolerance', level: 'Median' },
          { name: 'Prediction interval need', level: 'High' },
        ],
        params: [
          { name: 'Objective', value: 'regression_l2 (MSE on log-target)' },
          { name: 'Post-processing', value: 'Expm1 inverse transform' },
          { name: 'Output floor', value: '$0 (non-negative clip)' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'histogram_gradient_descent',
        factors: [
          { name: 'Dataset size', level: 'Low' },
          { name: 'Convergence speed requirement', level: 'Median' },
          { name: 'Memory efficiency need', level: 'Low' },
        ],
        params: [
          { name: 'Algorithm', value: 'Histogram-based gradient descent' },
          { name: 'Max bin', value: '255' },
          { name: 'Early stopping rounds', value: '30' },
        ],
      },
    ],
    whyThisModel: 'LightGBM handles the heavily right-skewed freight cost distribution through log-space training, while its leaf-wise growth captures the sparse vendor-term and country-specific pricing interactions that linear models miss. Its fast training time on this smaller dataset (5,964 rows) enables rapid model iteration during pricing rule changes.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 87, precision: 84 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 70, precision: 63 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 56, precision: 49 },
    ],
  },

  // ── Random Forest (logistics-delivery-outcome) ──────────────────────────
  'logistics-delivery-outcome': {
    champion: 'Random Forest',
    modelFunction: 'Classifies each order into one of four delivery outcomes — Late, On Time, Advance, or Canceled — enabling outcome-specific automation.',
    modelType: 'Multi-class Classification — Supervised Learning (4 classes)',
    overallRecall: 84,
    overallPrecision: 81,
    primaryMetric: 'Recall',
    secondaryMetric: 'Precision',
    metricStatement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'outcome_feature_encoder',
        factors: [
          { name: 'High-cardinality geographic features', level: 'High' },
          { name: 'Multi-class target encoding', level: 'High' },
          { name: 'Mixed feature types (31 features)', level: 'High' },
        ],
        params: [
          { name: 'Geographic', value: 'Region grouping + lat/lon binning' },
          { name: 'Derived', value: 'shipping_gap = real_days - scheduled_days' },
          { name: 'Product encoding', value: 'Frequency encoding for product names' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'bootstrap_aggregated_trees',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Feature interaction strength', level: 'High' },
          { name: 'Heterogeneous feature types', level: 'High' },
          { name: 'Variance reduction need', level: 'High' },
          { name: 'Multi-class output requirement', level: 'High' },
          { name: 'Explainability requirement', level: 'Median' },
        ],
        params: [
          { name: 'Estimators', value: '500' },
          { name: 'Max features', value: 'sqrt(n_features)' },
          { name: 'Max depth', value: '20' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'max_depth_and_features',
        factors: [
          { name: 'Dataset volume', level: 'High' },
          { name: 'Feature dimensionality', level: 'High' },
          { name: 'Class imbalance severity', level: 'Median' },
        ],
        params: [
          { name: 'Max depth', value: '20' },
          { name: 'Max features', value: 'sqrt(31) ≈ 6' },
          { name: 'Bootstrap', value: 'True' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'gini_impurity',
        factors: [
          { name: 'Target type', level: 'Multi-class (4)' },
          { name: 'Class imbalance', level: 'High' },
          { name: 'Per-class precision need', level: 'High' },
        ],
        params: [
          { name: 'Split criterion', value: 'Gini impurity' },
          { name: 'Class weight', value: 'balanced (sklearn)' },
          { name: 'Minority oversampling', value: 'SMOTE for canceled class (4%)' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'bagging',
        factors: [
          { name: 'Variance reduction need', level: 'High' },
          { name: 'Noisy feature tolerance', level: 'High' },
          { name: 'Parallelisation potential', level: 'High' },
        ],
        params: [
          { name: 'Algorithm', value: 'Bootstrap aggregation (bagging)' },
          { name: 'N jobs', value: '-1 (all cores)' },
          { name: 'Random state', value: '42' },
        ],
      },
    ],
    whyThisModel: 'Random Forest handles the 4-class delivery outcome problem effectively by reducing variance through bootstrap aggregation across 31 heterogeneous features. Its natural multi-class support avoids one-vs-rest decomposition, and balanced class weighting with SMOTE for the rare canceled class (4%) ensures all outcomes receive adequate learning signal.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 87, precision: 84 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 69, precision: 62 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 57, precision: 50 },
    ],
  },

  // ── LightGBM (logistics-demand-forecast) ────────────────────────────────
  'logistics-demand-forecast': {
    champion: 'LightGBM Regressor',
    modelFunction: 'Forecasts daily logistics demand volumes up to 14 days ahead, incorporating weather, traffic, and supply chain health signals.',
    modelType: 'Regression — Supervised Learning (Time-Series Features)',
    overallRecall: 87,
    overallPrecision: 84,
    primaryMetric: 'MAPE',
    secondaryMetric: 'RMSE',
    metricStatement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    components: [
      {
        subtype: 'preprocessor',
        subtypeLabel: 'Preprocessor',
        name: 'demand_lag_builder',
        factors: [
          { name: 'Temporal autocorrelation', level: 'High' },
          { name: 'Seasonal signal strength', level: 'High' },
          { name: 'Exogenous variable count', level: 'High' },
        ],
        params: [
          { name: 'Lag windows', value: '1, 7, 14, 30 days' },
          { name: 'Rolling features', value: 'Mean, std (7d, 14d, 30d)' },
          { name: 'Seasonality', value: 'Day-of-week + month cyclical sin/cos' },
        ],
      },
      {
        subtype: 'model_function',
        subtypeLabel: 'Model Component',
        name: 'leaf_wise_gradient_boosting',
        factors: [
          { name: 'Non-linear relationship complexity', level: 'High' },
          { name: 'Exogenous variable interactions', level: 'High' },
          { name: 'Weather-demand interaction signals', level: 'High' },
          { name: 'Data diversity measure', level: 'Median' },
          { name: 'Explainability requirement', level: 'Median' },
        ],
        params: [
          { name: 'Estimators', value: '350' },
          { name: 'Num leaves', value: '31' },
          { name: 'Learning rate', value: '0.05' },
        ],
      },
      {
        subtype: 'capacity_controls',
        subtypeLabel: 'Capacity Controls',
        name: 'num_leaves_and_estimators',
        factors: [
          { name: 'Dataset volume', level: 'Low' },
          { name: 'Temporal feature count', level: 'High' },
          { name: 'Training time budget', level: 'Low' },
        ],
        params: [
          { name: 'Num leaves', value: '31' },
          { name: 'N estimators', value: '350' },
          { name: 'Min child samples', value: '10' },
        ],
      },
      {
        subtype: 'loss_function',
        subtypeLabel: 'Loss Function',
        name: 'regression_l2',
        factors: [
          { name: 'Target type', level: 'Continuous' },
          { name: 'Forecast horizon', level: 'Multi-step (1-14 days)' },
          { name: 'Quantile estimation need', level: 'High' },
        ],
        params: [
          { name: 'Objective', value: 'regression_l2 (MSE)' },
          { name: 'Quantile extension', value: 'P10, P50, P90 forecast intervals' },
          { name: 'Output floor', value: '0 units (non-negative clip)' },
        ],
      },
      {
        subtype: 'optimization_algo',
        subtypeLabel: 'Optimization Algorithm',
        name: 'histogram_gradient_descent',
        factors: [
          { name: 'Dataset size', level: 'Low' },
          { name: 'Daily refresh requirement', level: 'High' },
          { name: 'Memory efficiency need', level: 'Low' },
        ],
        params: [
          { name: 'Algorithm', value: 'Histogram-based gradient descent' },
          { name: 'Max bin', value: '127' },
          { name: 'Early stopping rounds', value: '20' },
        ],
      },
    ],
    whyThisModel: 'LightGBM with lag and rolling features captures both the autocorrelation in daily demand and the impact of exogenous disruptions (weather, port congestion, traffic). Its fast training enables daily model refreshes as new data arrives, and the quantile regression extension provides forecast intervals that operations teams rely on for capacity planning decisions.',
    performance: [
      { category: 'sufficient', label: 'Dominant Patterns', recall: 90, precision: 87 },
      { category: 'insufficient', label: 'Non-Dominant Patterns', recall: 74, precision: 67 },
      { category: 'helpMe', label: 'Fuzzy Patterns', recall: 61, precision: 54 },
    ],
  },
}

export function getPrecomputedModelSelection(datasetId: string): ModelSelectionResults {
  return modelDataMap[datasetId] ?? modelDataMap['telco-churn']
}
