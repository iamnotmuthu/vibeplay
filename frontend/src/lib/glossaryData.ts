// ── Glossary Data ────────────────────────────────────────────────────────────
// Used by MLTooltip (Phase 1) and the Glossary Panel (Phase 2).

export interface GlossaryEntry {
  term: string
  displayName: string
  shortDefinition: string
  fullDefinition: string
  whyItMatters?: string
  category: 'algorithm' | 'metric' | 'data-concept' | 'model-component' | 'deployment' | 'pattern'
  relatedTerms?: string[]
  stages: number[]
}

export interface StageExplainer {
  stageId: number
  headline: string
  businessExplanation: string
  analogy: string
}

// ── Glossary Entries ─────────────────────────────────────────────────────────

export const glossaryEntries: GlossaryEntry[] = [
  // ── Data Concepts (Stage 3) ────────────────────────────────────────────────
  {
    term: 'dimensions',
    displayName: 'Dimensions',
    shortDefinition: 'Meaningful categories discovered within each data feature — for example, splitting raw tenure numbers into groups like "New Customer" and "Loyal Customer".',
    fullDefinition: 'Dimensions are the distinct, interpretable segments found within a single data column. A raw number like customer tenure becomes more useful when divided into categories the model can reason about, such as "0–12 months" and "24+ months". VibeModel discovers these automatically from your data\'s statistical shape.',
    whyItMatters: 'More dimensions means the model captures finer distinctions between customer behaviours, which directly improves prediction accuracy for edge cases.',
    category: 'data-concept',
    relatedTerms: ['continuous', 'define-bands', 'categorical'],
    stages: [3],
  },
  {
    term: 'continuous',
    displayName: 'Continuous Feature',
    shortDefinition: 'A data column containing numbers that can take any value along a range, like age, price, or monthly charges.',
    fullDefinition: 'Continuous features hold numeric values that flow along a spectrum — things you can add, average, or rank. Examples include tenure in months, monthly bill amount, or number of support calls. The model can learn thresholds and gradients from these values.',
    whyItMatters: 'Continuous features often carry the strongest signals in structured datasets. VibeModel analyses their distribution to decide whether to split them into bands or use them as-is.',
    category: 'data-concept',
    relatedTerms: ['categorical', 'define-bands', 'outliers'],
    stages: [3],
  },
  {
    term: 'categorical',
    displayName: 'Categorical Feature',
    shortDefinition: 'A data column containing labels or categories, like contract type or payment method.',
    fullDefinition: 'Categorical features hold named groups rather than numbers — for example, "Month-to-Month", "One Year", or "Two Year" for contract type. Each unique value becomes its own signal for the model. Before training, these categories are converted into numeric form so the algorithm can process them.',
    whyItMatters: 'Categorical features often define the clearest boundaries between customer segments. A feature like "Contract Type" can be the single strongest predictor of churn in a telecom dataset.',
    category: 'data-concept',
    relatedTerms: ['continuous', 'one-hot-encoding'],
    stages: [3],
  },
  {
    term: 'define-bands',
    displayName: 'Define Bands',
    shortDefinition: 'Splitting a continuous number range into defined bands — for example, product prices into $0–100, $101–300, $301–500 — so the model treats similar values as one group.',
    fullDefinition: 'Banding (also called binning or discretisation) converts a continuous numeric feature into labelled ranges. Instead of the model learning that "$87.43 ≈ $87.91 ≈ high charge", you explicitly define "High Charges = $70+". This makes patterns more stable and easier to interpret. VibeModel starts with a two-band split at the median and lets you refine further.',
    whyItMatters: 'Bands reduce noise and make feature interactions clearer. A well-defined band can convert a noisy numeric column into a powerful categorical signal that dramatically improves cohort quality.',
    category: 'data-concept',
    relatedTerms: ['continuous', 'dimensions'],
    stages: [3],
  },
  {
    term: 'missing-values',
    displayName: 'Missing Values',
    shortDefinition: 'Data points where a value was not recorded. Too many missing values can reduce model accuracy.',
    fullDefinition: 'Missing values occur when a field was left blank, not collected, or lost during data pipeline processing. They can bias the model if the missingness itself is informative (e.g., customers who never called support may have a different churn profile than those with missing call logs). The model must handle them through imputation or exclusion.',
    whyItMatters: 'High missing rates in a key feature degrade prediction quality for that segment. VibeModel flags features with >5% missing so you can decide whether to impute, remove, or collect more data.',
    category: 'data-concept',
    relatedTerms: ['outliers'],
    stages: [3],
  },
  {
    term: 'outliers',
    displayName: 'Outliers',
    shortDefinition: 'Data points far from the normal range — for example, a customer tenure of 500 months when most are under 72.',
    fullDefinition: 'Outliers sit outside the expected distribution of a feature — sometimes they represent genuine rare cases (a very old account), and sometimes they signal data entry errors or system bugs. Left unaddressed, extreme outliers can distort the model\'s learned thresholds, making it less accurate for the vast majority of normal cases.',
    whyItMatters: 'A single extreme outlier can pull a regression line or decision boundary significantly off-centre. VibeModel identifies them so you can decide whether they represent real data or noise to be capped.',
    category: 'data-concept',
    relatedTerms: ['numerical', 'missing-values'],
    stages: [3],
  },

  // ── Pattern Concepts (Stage 4) ──────────────────────────────────────────────
  {
    term: 'dominant-patterns',
    displayName: 'Dominant Patterns',
    shortDefinition: 'Segments with a strong, consistent signal AND enough data to learn from confidently — large, reliable patterns the model can predict with high accuracy.',
    fullDefinition: 'Dominant patterns are the backbone of the model. They combine two qualities: a clear, consistent outcome signal (most customers in this segment behave the same way) and enough records for the model to learn that signal reliably. These are the patterns the model will predict most accurately in production.',
    whyItMatters: 'Dominant patterns drive the majority of production predictions. A model with large, well-defined dominant patterns will be accurate and trustworthy for the most common customer situations.',
    category: 'pattern',
    relatedTerms: ['non-dominant-patterns', 'fuzzy-patterns', 'sufficient-data', 'cohort'],
    stages: [4, 5],
  },
  {
    term: 'non-dominant-patterns',
    displayName: 'Non-Dominant Patterns',
    shortDefinition: 'Segments where the signal is crystal clear but the sample size is too small to trust for production — for example, 20 out of 20 customers always churn, but 20 records is not enough.',
    fullDefinition: 'Non-dominant patterns have a perfectly clear signal — every record in the segment points in the same direction — but too few examples to be statistically reliable. The model cannot learn a robust rule from just a handful of examples, even if those examples are perfectly consistent. These patterns need more data or synthetic augmentation before they can be used in production.',
    whyItMatters: 'Ignoring non-dominant patterns means missing high-confidence niche segments. With more data, these become the model\'s most powerful cohorts. Without it, they remain a blind spot.',
    category: 'pattern',
    relatedTerms: ['dominant-patterns', 'fuzzy-patterns', 'sufficient-data'],
    stages: [4, 5],
  },
  {
    term: 'fuzzy-patterns',
    displayName: 'Fuzzy Patterns',
    shortDefinition: 'Patterns where the model detects a real segment but cannot reliably predict the outcome — the available features produce similar signals across different outcomes, suggesting a key differentiating parameter may be missing from the dataset.',
    fullDefinition: 'Fuzzy patterns occur when VibeModel identifies a distinct group of records but finds that their feature values look nearly identical across different outcome buckets. The model can see who these records are, but cannot confidently separate what will happen to them. This is not a model failure — it is a signal that the current dataset may be missing a real-world parameter that differentiates these records in ways the model cannot yet see.',
    whyItMatters: 'These segments are the highest-value opportunity for a domain expert. Adding one well-chosen parameter — a behavioral signal, an external data source, or a derived feature — can often convert Fuzzy Patterns into Dominant or Non-Dominant ones, directly improving prediction accuracy.',
    category: 'pattern',
    relatedTerms: ['dominant-patterns', 'non-dominant-patterns', 'confidence'],
    stages: [4, 5],
  },
  {
    term: 'cohort',
    displayName: 'Cohort',
    shortDefinition: 'A group of records sharing the same combination of characteristics — for example, "Month-to-month contract + Electronic check + tenure under 12 months".',
    fullDefinition: 'A cohort is a slice of your dataset defined by a specific combination of feature values. VibeModel discovers cohorts automatically by finding combinations that produce consistently different outcomes. Each cohort becomes a pattern the model learns to recognise and predict independently.',
    whyItMatters: 'Cohort-level analysis makes models interpretable. Instead of "the model predicts 73% churn risk", you can say "customers in this cohort churn at 73% — here\'s exactly who they are".',
    category: 'pattern',
    relatedTerms: ['dominant-patterns', 'sufficient-data'],
    stages: [4, 5],
  },
  {
    term: 'confidence',
    displayName: 'Confidence',
    shortDefinition: 'How certain the model is about its prediction for a segment — high confidence means the pattern is clear and consistent across the data.',
    fullDefinition: 'Confidence reflects how consistently the records in a cohort point toward the same outcome. A cohort where 95% of customers churn has high confidence; one where 55% churn and 45% don\'t has low confidence. High-confidence patterns produce predictions you can act on immediately; low-confidence ones warrant additional investigation.',
    whyItMatters: 'Confidence scores help you prioritise which patterns to act on and which to treat with caution. They also determine whether a pattern should be flagged for manual review in production.',
    category: 'pattern',
    relatedTerms: ['dominant-patterns', 'fuzzy-patterns', 'sufficient-data'],
    stages: [4],
  },
  {
    term: 'sufficient-data',
    displayName: 'Sufficient Data',
    shortDefinition: 'Enough records in a pattern for the model to learn reliably — patterns with more data produce more trustworthy predictions.',
    fullDefinition: 'Statistical learning requires a minimum number of examples to distinguish real patterns from random noise. A rule learned from 10 examples is unreliable even if those examples are perfectly consistent; a rule learned from 500+ examples is much more trustworthy. VibeModel\'s sufficiency threshold is calibrated to your dataset size and the complexity of the pattern.',
    whyItMatters: 'Insufficient data is the most common reason a model fails in production. Understanding which patterns are data-constrained tells you exactly where to focus your data collection efforts.',
    category: 'pattern',
    relatedTerms: ['dominant-patterns', 'non-dominant-patterns', 'cohort'],
    stages: [4, 5],
  },

  // ── Validation Concepts (Stage 5) ──────────────────────────────────────────
  {
    term: 'validation',
    displayName: 'Validation',
    shortDefinition: 'Testing the model on data it has never seen before — if it performs well on unseen data, it will likely perform well in production.',
    fullDefinition: 'Validation is the process of evaluating a model\'s performance on a held-out dataset that was not used during training. If the model was simply memorising its training data, it would perform poorly on new data. Strong validation results indicate the model learned genuine patterns that generalise to the real world.',
    whyItMatters: 'Without validation, there is no way to know if the model will work in production. VibeModel validates each pattern separately so you can see which cohorts are production-ready and which need more work.',
    category: 'metric',
    relatedTerms: ['recall', 'precision'],
    stages: [5],
  },
  {
    term: 'recall',
    displayName: 'Recall',
    shortDefinition: 'Of all actual positive cases (e.g., customers who churned), the percentage the model correctly identified — high recall means fewer missed cases.',
    fullDefinition: 'Recall (also called sensitivity or true positive rate) answers: "Of all the customers who actually churned, what fraction did our model catch?" A recall of 88% means the model correctly flagged 88 out of every 100 actual churners. The remaining 12% were false negatives — real churners the model missed. High recall is critical when the cost of missing a case is high.',
    whyItMatters: 'In churn prevention, missing a churner means losing a customer with no chance to intervene. High recall ensures your retention campaigns reach most at-risk customers.',
    category: 'metric',
    relatedTerms: ['precision', 'validation'],
    stages: [5, 6],
  },
  {
    term: 'precision',
    displayName: 'Precision',
    shortDefinition: 'Of all cases the model flagged as positive, the percentage that were actually positive — high precision means fewer false alarms.',
    fullDefinition: 'Precision answers: "Of all the customers our model said would churn, how many actually did?" A precision of 85% means 85 out of every 100 flagged customers were genuine churners. The other 15 were false positives — customers the model incorrectly flagged. High precision reduces wasted retention budget on customers who were never going to churn.',
    whyItMatters: 'Low precision means your retention team wastes effort on false alarms. There is always a trade-off between recall and precision — VibeModel shows both so you can tune the decision threshold for your business context.',
    category: 'metric',
    relatedTerms: ['recall', 'validation', 'decision-threshold'],
    stages: [5, 6],
  },

  // ── Model Components (Stage 6) ─────────────────────────────────────────────
  {
    term: 'logistic-regression',
    displayName: 'Logistic Regression',
    shortDefinition: 'A foundational algorithm that predicts the probability of a yes/no outcome by learning which features matter most, producing a score between 0 and 1.',
    fullDefinition: 'Logistic Regression fits a mathematical curve to the relationship between input features and the probability of an outcome. Despite its "regression" name, it is used for classification — it outputs a probability (e.g., 0.83 = 83% churn risk) rather than a continuous value. Each feature gets a coefficient that tells you exactly how much it contributes to the score.',
    whyItMatters: 'Logistic Regression produces interpretable coefficients — you can tell stakeholders exactly which features drive the prediction and by how much. It is also very fast to train and deploy.',
    category: 'algorithm',
    relatedTerms: ['xgboost', 'random-forest', 'regularization', 'logistic-regression'],
    stages: [6],
  },
  {
    term: 'xgboost',
    displayName: 'XGBoost',
    shortDefinition: 'Extreme Gradient Boosting — builds hundreds of small decision trees sequentially, where each new tree corrects the previous ones\' mistakes.',
    fullDefinition: 'XGBoost is an ensemble algorithm that builds a sequence of decision trees, each one focusing on the errors made by the previous ones. This "boosting" process produces a highly accurate final model. It handles missing values natively, scales well to large datasets, and is robust to outliers — making it a top choice for structured/tabular data competitions.',
    whyItMatters: 'XGBoost is chosen when the data contains complex, non-linear interactions between features that simpler models cannot capture. It typically outperforms Logistic Regression when there are many interacting features.',
    category: 'algorithm',
    relatedTerms: ['random-forest', 'logistic-regression', 'loss-function'],
    stages: [6],
  },
  {
    term: 'random-forest',
    displayName: 'Random Forest',
    shortDefinition: 'Builds many independent decision trees on random data subsets, then combines their votes for a more stable prediction than any single tree.',
    fullDefinition: 'Random Forest trains hundreds of decision trees, each on a random sample of the data and a random subset of features. At prediction time, each tree votes and the majority wins. This "bagging" approach reduces variance — the forest is much more stable than any individual tree and less prone to overfitting.',
    whyItMatters: 'Random Forest is chosen when stability and robustness matter more than marginal accuracy gains. It handles mixed feature types well and provides feature importance scores that explain which inputs matter most.',
    category: 'algorithm',
    relatedTerms: ['xgboost', 'logistic-regression'],
    stages: [6],
  },
  {
    term: 'preprocessor',
    displayName: 'Preprocessor',
    shortDefinition: 'Steps that prepare raw data before the model sees it — converting categories to numbers, scaling values, and filling in missing data.',
    fullDefinition: 'The preprocessor is a pipeline of data transformation steps that happen before the core algorithm runs. Typical steps include encoding categorical columns (e.g., converting "Monthly" to a numeric representation), scaling numeric features to a common range, and imputing missing values. The preprocessor must be consistent between training and production — the same transformations applied to training data must be applied identically to live predictions.',
    whyItMatters: 'A mismatch between training-time and production-time preprocessing is one of the most common causes of model failure in production. VibeModel records the exact preprocessing pipeline so it can be reproduced reliably at inference time.',
    category: 'model-component',
    relatedTerms: ['one-hot-encoding', 'inference'],
    stages: [6],
  },
  {
    term: 'loss-function',
    displayName: 'Loss Function',
    shortDefinition: 'The formula measuring how wrong the model\'s predictions are — the model tries to minimise this number during training.',
    fullDefinition: 'The loss function is the objective the model is optimised against. It measures the gap between the model\'s predicted probabilities and the actual labels in the training data. Different loss functions encode different assumptions about what "wrong" means — Binary Cross-Entropy penalises confident mistakes more heavily than uncertain ones. The choice of loss function directly shapes what the model learns to optimise.',
    whyItMatters: 'The loss function determines what the model is fundamentally trying to achieve. Choosing the wrong one can result in a model that maximises the wrong objective — for example, optimising for overall accuracy when you actually need high recall.',
    category: 'model-component',
    relatedTerms: ['binary-crossentropy', 'optimization-algorithm'],
    stages: [6],
  },
  {
    term: 'regularization',
    displayName: 'Regularization',
    shortDefinition: 'A technique preventing the model from memorising training data too closely, forcing it to keep learned patterns simple and generalisable.',
    fullDefinition: 'Regularization adds a penalty to the loss function that increases with model complexity. This discourages the model from assigning very large weights to any single feature, which would indicate it is fitting noise rather than a genuine pattern. The two most common forms are L1 (which can zero out irrelevant features entirely) and L2 (which shrinks all weights proportionally).',
    whyItMatters: 'Without regularization, a model can memorise the training data perfectly but fail completely on new data — a problem called overfitting. Regularization is the primary tool for building models that generalise well to production data.',
    category: 'model-component',
    relatedTerms: ['elastic-net', 'loss-function'],
    stages: [6],
  },
  {
    term: 'optimization-algorithm',
    displayName: 'Optimization Algorithm',
    shortDefinition: 'The method used to adjust model weights during training — the strategy for finding the best answer efficiently.',
    fullDefinition: 'During training, the model\'s parameters are iteratively adjusted to reduce the loss function. The optimization algorithm determines how those adjustments are made — how large each step is, whether to use gradient information, and how to handle flat or curved regions of the loss surface. The choice of optimizer affects both training speed and the quality of the final solution.',
    whyItMatters: 'A poor optimizer can either fail to find a good solution (getting stuck in a local minimum) or take far too long to converge. The right optimizer for your data size and model complexity makes training fast and reliable.',
    category: 'model-component',
    relatedTerms: ['lbfgs', 'loss-function'],
    stages: [6],
  },
  {
    term: 'lbfgs',
    displayName: 'LBFGS',
    shortDefinition: 'Limited-memory BFGS — an efficient optimization method that finds the best weights without storing a huge matrix in memory.',
    fullDefinition: 'LBFGS (Limited-memory Broyden–Fletcher–Goldfarb–Shanno) is a quasi-Newton optimization algorithm. Unlike basic gradient descent which only uses the current gradient, LBFGS approximates the curvature of the loss surface using recent gradient history. This lets it take smarter steps toward the minimum. The "limited-memory" variant avoids storing the full curvature matrix, making it practical for large feature sets.',
    whyItMatters: 'LBFGS converges faster than standard gradient descent for medium-sized datasets with many features, making it the standard choice for Logistic Regression in production ML frameworks.',
    category: 'model-component',
    relatedTerms: ['optimization-algorithm'],
    stages: [6],
  },
  {
    term: 'platt-scaling',
    displayName: 'Platt Scaling',
    shortDefinition: 'A calibration technique adjusting model outputs so predicted probabilities match real-world rates accurately.',
    fullDefinition: 'Some models produce probability scores that are systematically overconfident or underconfident. Platt Scaling fits a logistic regression on top of the raw model scores to recalibrate them so that, for example, a predicted 70% probability really does correspond to 70% of cases being positive. This is especially important for risk scoring and decision thresholding.',
    whyItMatters: 'Calibrated probabilities let you set meaningful business thresholds — for example, "flag all customers with >60% churn risk for retention outreach". Without calibration, the raw scores may be systematically off.',
    category: 'model-component',
    relatedTerms: ['decision-threshold', 'inference'],
    stages: [6],
  },
  {
    term: 'binary-crossentropy',
    displayName: 'Binary Cross-Entropy',
    shortDefinition: 'The standard loss function for yes/no predictions — penalises the model more heavily when it is confidently wrong.',
    fullDefinition: 'Binary Cross-Entropy (also called log loss) measures the distance between the model\'s predicted probability and the actual binary label (0 or 1). If the model predicts 95% probability of churn for a customer who does NOT churn, the penalty is very high. If it predicts 55% for a churner, the penalty is moderate. This asymmetric penalisation encourages the model to be well-calibrated rather than just directionally correct.',
    whyItMatters: 'Binary Cross-Entropy is the standard loss for classification because it naturally produces probability outputs and discourages overconfident wrong predictions, which are the most damaging in production.',
    category: 'model-component',
    relatedTerms: ['loss-function', 'logistic-regression'],
    stages: [6],
  },
  {
    term: 'decision-threshold',
    displayName: 'Decision Threshold',
    shortDefinition: 'The probability cutoff above which the model predicts "yes" — a lower threshold catches more true positives but may increase false alarms.',
    fullDefinition: 'A classification model outputs a probability score for each record. The decision threshold converts that score into a binary decision: above the threshold = positive prediction, below = negative. The default is often 0.5, but the optimal threshold depends on business priorities — if missing a churner is very costly, you might lower it to 0.35 to catch more churners at the cost of more false alarms.',
    whyItMatters: 'Threshold selection is where the model meets the business. It is the primary lever for balancing recall and precision according to your operational constraints and cost structure.',
    category: 'model-component',
    relatedTerms: ['precision', 'recall', 'platt-scaling'],
    stages: [6],
  },
  {
    term: 'one-hot-encoding',
    displayName: 'One-Hot Encoding',
    shortDefinition: 'Converting categories (like "Monthly", "Yearly") into separate yes/no columns so the model can process them numerically.',
    fullDefinition: 'Most ML algorithms require numeric inputs. One-hot encoding converts a categorical column with N unique values into N binary columns, one per category. For each record, exactly one column is 1 (the category that applies) and all others are 0. For example, "Contract Type: Monthly" becomes three columns: Monthly=1, OneYear=0, TwoYear=0.',
    whyItMatters: 'One-hot encoding is the most common and safest way to handle categorical variables. It avoids imposing an artificial numeric ordering (which would happen if you encoded Monthly=1, OneYear=2, TwoYear=3) and is directly interpretable.',
    category: 'model-component',
    relatedTerms: ['preprocessor', 'categorical'],
    stages: [6],
  },
  {
    term: 'elastic-net',
    displayName: 'Elastic Net',
    shortDefinition: 'A regularization combining L1 and L2 penalties to keep the model simple and prevent overfitting.',
    fullDefinition: 'Elastic Net regularization is a linear combination of L1 and L2 penalties. L1 (Lasso) encourages sparsity by zeroing out irrelevant features entirely. L2 (Ridge) shrinks all feature weights proportionally without forcing them to zero. Elastic Net combines both — zeroing irrelevant features while smoothly shrinking the rest — giving the best properties of each approach.',
    whyItMatters: 'When you have many features and want automatic feature selection alongside smooth regularization, Elastic Net outperforms pure L1 or L2. It is particularly useful when features are correlated.',
    category: 'model-component',
    relatedTerms: ['regularization', 'loss-function'],
    stages: [6],
  },
  {
    term: 'inference',
    displayName: 'Inference',
    shortDefinition: 'Using a trained model to make predictions on new, unseen data.',
    fullDefinition: 'Inference is the production phase of the ML lifecycle — applying the trained model to real data to generate predictions. It requires the same preprocessing steps used during training, the trained model weights, and any calibration layers (like Platt Scaling). Inference speed (latency) is critical for real-time applications where predictions are needed within milliseconds.',
    whyItMatters: 'A model that trains well but is too slow to serve predictions in real-time is not production-usable. VibeModel selects components partly based on inference latency requirements alongside accuracy goals.',
    category: 'model-component',
    relatedTerms: ['preprocessor', 'platt-scaling'],
    stages: [6],
  },

  // ── AI Solution Concepts ───────────────────────────────────────────────────
  {
    term: 'solution-type',
    displayName: 'Solution Type',
    shortDefinition: 'A category of AI capability — predictive, agentic, prescriptive, or generative — each addressing different classes of business problem.',
    fullDefinition: 'VibeModel supports four solution types, each designed for a different class of business problem. Predictive AI forecasts outcomes from historical data. Agentic AI creates autonomous workflows that observe, decide, and act. Prescriptive AI recommends specific actions to achieve desired outcomes. Generative AI creates content and synthesises data.',
    whyItMatters: 'Understanding which solution type fits your problem ensures VibeModel composes the right architecture from the start — rather than forcing every problem into a prediction framework.',
    category: 'data-concept',
    relatedTerms: ['pattern-router', 'architecture-composition'],
    stages: [0],
  },
  {
    term: 'architecture-composition',
    displayName: 'Architecture Composition',
    shortDefinition: 'The process of assembling a custom AI architecture — selecting specific components, strategies, and parameters — based on patterns discovered in your data.',
    fullDefinition: 'Unlike tools that pick a pre-built model from a catalog, VibeModel composes a custom architecture by analysing meta-patterns in your data and matching them to specific components. For predictive models, this means selecting loss functions, regularisation techniques, and hyperparameters. For LLM solutions, this means composing prompt strategies, embedder models, retrieval approaches, and routing logic — all tailored to the patterns in your specific data.',
    whyItMatters: 'Composition means your AI architecture is unique to your data — not a generic template applied to everyone.',
    category: 'model-component',
    relatedTerms: ['meta-patterns', 'pattern-router'],
    stages: [0, 6],
  },
  {
    term: 'meta-patterns',
    displayName: 'Meta-Patterns',
    shortDefinition: 'Statistical signatures extracted from discovered patterns — not from raw data — that determine which AI components will work for your specific situation.',
    fullDefinition: 'After VibeModel discovers patterns (dominant, non-dominant, and fuzzy), it extracts meta-patterns: higher-level statistical properties that describe the nature of those patterns. These meta-patterns drive architecture composition. For example, a meta-pattern might indicate that your data has high-confidence clusters with clear boundaries (suggesting a direct classification approach) versus overlapping fuzzy regions (suggesting a retrieval-augmented approach with confidence scoring).',
    whyItMatters: "Meta-patterns are VibeModel's core differentiator. They represent the intelligence layer that turns raw pattern analysis into actionable architecture decisions.",
    category: 'pattern',
    relatedTerms: ['dominant-patterns', 'non-dominant-patterns', 'fuzzy-patterns', 'architecture-composition'],
    stages: [0, 4, 5, 6],
  },
  {
    term: 'pattern-router',
    displayName: 'Pattern Router',
    shortDefinition: 'A composed component that analyses incoming data (like support tickets) and routes each item to the appropriate processing pipeline based on its pattern type.',
    fullDefinition: 'In LLM-based solutions, not all inputs should be processed the same way. A pattern router examines each incoming item, identifies which pattern cluster it belongs to (dominant, non-dominant, or fuzzy), and sends it to the pipeline component optimised for that pattern. For customer support, this means billing disputes (dominant pattern) get direct classification while compound multi-issue tickets (fuzzy pattern) get retrieval-augmented processing with human oversight.',
    whyItMatters: 'Generic LLM approaches use the same prompt and pipeline for every input. Pattern routing means each input gets the treatment it actually needs — improving accuracy and reducing wasted computation.',
    category: 'model-component',
    relatedTerms: ['architecture-composition', 'dominant-patterns', 'fuzzy-patterns'],
    stages: [0],
  },
  {
    term: 'retrieval-augmented-generation',
    displayName: 'Retrieval-Augmented Generation (RAG)',
    shortDefinition: 'A technique where an LLM retrieves relevant documents before generating a response — grounding its output in real information rather than relying solely on training data.',
    fullDefinition: 'RAG combines a retrieval system (which searches through your documents, knowledge base, or data) with a language model (which generates responses). When a query comes in, the system first finds relevant context from your data, then provides that context to the LLM alongside the query. This produces more accurate, grounded responses than pure LLM generation. VibeModel composes the RAG pipeline — choosing the right embedder, chunk size, retrieval strategy, and generation parameters — based on patterns in your data.',
    whyItMatters: 'Without retrieval, LLMs can only use their training data and may produce incorrect or outdated responses. RAG grounds every response in your actual data.',
    category: 'model-component',
    relatedTerms: ['embedder', 'chunk-strategy', 'pattern-router'],
    stages: [0],
  },
  {
    term: 'embedder',
    displayName: 'Embedder',
    shortDefinition: 'A model that converts text into numerical vectors, enabling similarity search and classification across documents and queries.',
    fullDefinition: 'An embedder transforms text — sentences, paragraphs, or documents — into dense numerical vectors that capture meaning. Similar texts produce similar vectors, enabling the system to find relevant documents for retrieval, cluster similar support tickets, and measure semantic similarity. Different embedders have different strengths: some excel at short queries, others at long documents. VibeModel selects the right embedder based on the text patterns in your data.',
    whyItMatters: 'The choice of embedder directly affects retrieval quality. A wrong embedder means the system retrieves irrelevant context, leading to poor LLM responses.',
    category: 'model-component',
    relatedTerms: ['retrieval-augmented-generation', 'chunk-strategy'],
    stages: [0],
  },
  {
    term: 'chunk-strategy',
    displayName: 'Chunk Strategy',
    shortDefinition: 'How documents are split into smaller pieces for retrieval — chunk size and overlap affect whether the system finds the right context.',
    fullDefinition: 'Before documents can be searched, they must be split into chunks (smaller text segments). The chunk strategy determines how this splitting happens: chunk size (how many tokens per piece), overlap (how much adjacent chunks share), and splitting logic (by paragraph, sentence, or semantic boundary). Smaller chunks give more precise retrieval but may miss surrounding context. Larger chunks preserve context but may dilute relevance. VibeModel composes the optimal chunk strategy by analysing the text patterns in your document corpus.',
    whyItMatters: 'A poor chunk strategy is the most common reason RAG systems return irrelevant results. Getting this right is the difference between a helpful AI assistant and one that misses the point.',
    category: 'model-component',
    relatedTerms: ['retrieval-augmented-generation', 'embedder'],
    stages: [0],
  },
  {
    term: 'confidence-threshold',
    displayName: 'Confidence Threshold',
    shortDefinition: 'The minimum confidence score required for the system to act automatically — below this threshold, the item is flagged for human review.',
    fullDefinition: 'When the composed architecture processes an item (like a support ticket), it produces a confidence score indicating how certain it is about the classification or response. The confidence threshold is the cutoff: items above it are processed automatically, items below are routed to human review. VibeModel sets different thresholds for different pattern types — dominant patterns can have higher automation rates, while fuzzy patterns require lower thresholds and more human oversight.',
    whyItMatters: 'The right confidence threshold balances automation speed with accuracy. Too high and humans review everything (defeating the purpose). Too low and errors slip through.',
    category: 'metric',
    relatedTerms: ['pattern-router', 'dominant-patterns', 'fuzzy-patterns'],
    stages: [0],
  },
  {
    term: 'sentiment-gate',
    displayName: 'Sentiment Gate',
    shortDefinition: 'A component that detects emotional intensity in text and routes high-emotion items to specialised handling — typically human review or de-escalation paths.',
    fullDefinition: "A sentiment gate analyses the emotional tone of incoming text (anger, frustration, urgency) and uses that signal to influence routing decisions. In customer support, a ticket expressing extreme anger triggers the sentiment gate, which routes it to a human-reviewed escalation path rather than an automated response — even if the underlying issue (shipping delay) is a dominant pattern that could otherwise be auto-classified. VibeModel composes sentiment gates when fuzzy or emotionally-charged patterns are detected in your ticket data.",
    whyItMatters: 'Sending an automated response to a furious customer makes things worse. Sentiment gating ensures emotional context influences how tickets are handled, not just their topic.',
    category: 'model-component',
    relatedTerms: ['pattern-router', 'confidence-threshold', 'fuzzy-patterns'],
    stages: [0],
  },
  {
    term: 'ticket-pattern-cluster',
    displayName: 'Ticket Pattern Cluster',
    shortDefinition: "A group of support tickets that share similar characteristics — topic, complexity, emotional tone, and resolution path — identified by VibeModel's pattern discovery.",
    fullDefinition: 'Instead of treating every support ticket the same way, VibeModel discovers natural clusters in your ticket data based on relationships between features: topic, word patterns, customer history, resolution time, escalation frequency, and emotional tone. Each cluster represents a pattern type: dominant clusters (clear, predictable tickets like password resets), non-dominant clusters (less common but structured tickets like multi-product returns), and fuzzy clusters (ambiguous or emotionally charged tickets). Each cluster gets a different processing pipeline in the composed architecture.',
    whyItMatters: 'Understanding that your support tickets fall into distinct pattern clusters is the foundation for composing an architecture that handles each type optimally — rather than forcing one pipeline on all tickets.',
    category: 'pattern',
    relatedTerms: ['dominant-patterns', 'non-dominant-patterns', 'fuzzy-patterns', 'pattern-router'],
    stages: [0],
  },
]

// ── Stage Explainers ─────────────────────────────────────────────────────────

export const stageExplainers: StageExplainer[] = [
  {
    stageId: 3,
    headline: 'Understanding Your Data',
    businessExplanation: 'We\'re scanning your dataset to understand what kind of information each column contains — numbers, categories, or text. This determines which algorithms can work with your data and what preparation is needed.',
    analogy: 'Think of it like sorting ingredients before cooking — you need to know what you have before choosing a recipe.',
  },
  {
    stageId: 4,
    headline: 'Finding Customer Segments',
    businessExplanation: 'We\'ve grouped your data into segments that behave similarly. Some have strong, reliable signals (Dominant), some have clear signals but too few examples to trust yet (Non-Dominant), and some are ambiguous — the model sees similar signals across different outcomes, likely because a differentiating real-world parameter isn\'t captured in the dataset yet (Fuzzy).',
    analogy: 'Like sorting mail: some clearly go to one address, some are clear but the writing is tiny (need more samples), and some look identical on the outside — you\'d need to open them to know where they belong.',
  },
  {
    stageId: 5,
    headline: 'Testing on Unseen Data',
    businessExplanation: 'Before trusting the patterns we discovered, we test them on data the model has never seen. This confirms the patterns are real and not just quirks of the training data.',
    analogy: 'Like a practice exam — if a student scores well on questions they have never seen, they have truly learned the material.',
  },
  {
    stageId: 6,
    headline: 'Why This Model Architecture',
    businessExplanation: 'VibeModel doesn\'t pick a model off the shelf — it assembles one from components, each chosen based on your data\'s characteristics and business goal.',
    analogy: 'Like a custom-built engine — each part is selected for the specific vehicle and terrain, not from a one-size-fits-all kit.',
  },
]

// ── Lookup Helpers ───────────────────────────────────────────────────────────

export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  return glossaryEntries.find((e) => e.term === term)
}

export function getStageExplainer(stageId: number): StageExplainer | undefined {
  return stageExplainers.find((e) => e.stageId === stageId)
}

export function getGlossaryEntriesForStage(stageId: number): GlossaryEntry[] {
  return glossaryEntries.filter((e) => e.stages.includes(stageId))
}

export function getCategoriesForStage(stageId: number): GlossaryEntry['category'][] {
  const entries = getGlossaryEntriesForStage(stageId)
  return [...new Set(entries.map((e) => e.category))]
}
