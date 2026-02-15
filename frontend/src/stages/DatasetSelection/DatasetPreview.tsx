import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Table2 } from 'lucide-react'
import type { DatasetConfig } from '@/store/types'

interface DatasetPreviewProps {
  dataset: DatasetConfig | null
  onClose: () => void
  onStart: () => void
  loading?: boolean
}

// Synthetic preview data for each dataset
const previewData: Record<string, { columns: string[]; rows: (string | number)[][] }> = {
  'telco-churn': {
    columns: ['customerID', 'gender', 'tenure', 'MonthlyCharges', 'TotalCharges', 'Churn'],
    rows: [
      ['7590-VHVEG', 'Female', 1, 29.85, 29.85, 'No'],
      ['5575-GNVDE', 'Male', 34, 56.95, 1889.5, 'No'],
      ['3668-QPYBK', 'Male', 2, 53.85, 108.15, 'Yes'],
      ['7795-CFOCW', 'Male', 45, 42.30, 1840.75, 'No'],
      ['9237-HQITU', 'Female', 2, 70.70, 151.65, 'Yes'],
    ],
  },
  'credit-fraud': {
    columns: ['Time', 'V1', 'V2', 'V3', 'Amount', 'Class'],
    rows: [
      [0, -1.36, -0.07, 2.54, 149.62, 0],
      [0, 1.19, 0.27, 0.17, 2.69, 0],
      [1, -1.36, -1.34, 1.77, 378.66, 0],
      [1, -0.97, -0.19, 1.79, 123.50, 0],
      [2, -1.16, 0.88, 1.55, 69.99, 1],
    ],
  },
  'store-demand': {
    columns: ['date', 'store_id', 'item_id', 'sales', 'promo', 'day_of_week'],
    rows: [
      ['2023-01-01', 1, 101, 245, 0, 'Sunday'],
      ['2023-01-01', 1, 102, 132, 1, 'Sunday'],
      ['2023-01-02', 2, 101, 198, 0, 'Monday'],
      ['2023-01-02', 2, 103, 87, 1, 'Monday'],
      ['2023-01-03', 3, 101, 312, 0, 'Tuesday'],
    ],
  },
  'patient-readmission': {
    columns: ['patient_id', 'age', 'diagnosis', 'num_procedures', 'days_in_hospital', 'readmitted'],
    rows: [
      ['P001', 67, 'Circulatory', 3, 5, 'Yes'],
      ['P002', 45, 'Respiratory', 1, 3, 'No'],
      ['P003', 72, 'Diabetes', 4, 7, 'Yes'],
      ['P004', 58, 'Circulatory', 2, 4, 'No'],
      ['P005', 81, 'Musculoskeletal', 1, 2, 'No'],
    ],
  },
}

export function DatasetPreview({ dataset, onClose, onStart, loading }: DatasetPreviewProps) {
  if (!dataset) return null

  const preview = previewData[dataset.id]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Table2 className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-gray-900">{dataset.name}</h3>
                <p className="text-xs text-gray-500">
                  {dataset.rows.toLocaleString()} rows x {dataset.features} features
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Table preview */}
          {preview && (
            <div className="overflow-x-auto px-6 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {preview.columns.map((col) => (
                      <th
                        key={col}
                        className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      {row.map((cell, j) => (
                        <td key={j} className="py-2.5 px-3 font-mono text-xs text-gray-700">
                          {typeof cell === 'number' ? cell.toLocaleString() : cell}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Showing first 5 rows of {dataset.rows.toLocaleString()}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Ready to analyze this dataset with autonomous AI?
            </p>
            <motion.button
              onClick={onStart}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-4 h-4" />
              {loading ? 'Initializing...' : 'Start Analysis'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
