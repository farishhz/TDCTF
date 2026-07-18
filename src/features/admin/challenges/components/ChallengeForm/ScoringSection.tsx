import React from 'react'
import { Label, Input } from '@/shared/ui'
import { Gauge } from 'lucide-react'
import { ChallengeFormData } from '../../types'
import {
  ADMIN_FORM_ERROR_CLASS,
  ADMIN_FORM_FIELD_CLASS,
  ADMIN_INPUT_CLASS,
} from '@/features/admin/ui/form-field-styles'
import { ChallengeFormToggle } from './ChallengeFormToggle'

interface ScoringSectionProps {
  formData: ChallengeFormData
  onChange: (data: ChallengeFormData) => void
}

export const ScoringSection: React.FC<ScoringSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className={ADMIN_FORM_FIELD_CLASS}>
          <Label>{formData.is_dynamic ? 'Max Points' : 'Points'}</Label>
          <Input
            type="number"
            required
            min={0}
            value={formData.is_dynamic ? (formData.max_points ?? '') : (formData.points ?? '')}
            onChange={e => {
              let val = e.target.value.replace(/^0+(?=\d)/, '');
              if (val === '') {
                onChange({ ...formData, points: '', max_points: '' });
              } else {
                const n = Number(val);
                onChange({ ...formData, points: n, max_points: n });
              }
            }}
            placeholder={formData.is_dynamic ? 'Nilai awal' : 'Points'}
            className={ADMIN_INPUT_CLASS}
          />
        </div>
        <div className="flex items-center">
          <ChallengeFormToggle
            checked={!!formData.is_dynamic}
            label="Dynamic Score"
            icon={Gauge}
            activeClassName="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-300"
            onChange={v => {
              if (v) {
                onChange({ ...formData, is_dynamic: true, max_points: formData.points ?? '' });
              } else {
                onChange({ ...formData, is_dynamic: false, points: formData.max_points ?? '' });
              }
            }}
          />
        </div>
      </div>

      {formData.is_dynamic && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className={ADMIN_FORM_FIELD_CLASS}>
            <Label htmlFor="min_points" className="text-xs">Min Points</Label>
            <Input
              id="min_points"
              type="number"
              min={0}
              value={formData.min_points === undefined || formData.min_points === null ? '' : formData.min_points}
              onChange={e => {
                let val = e.target.value.replace(/^0+(?=\d)/, '');
                let maxVal = (formData.max_points === undefined || formData.max_points === null || formData.max_points === '') ? 0 : Number(formData.max_points);
                if (val === '') {
                  onChange({ ...formData, min_points: '' });
                } else {
                  let minVal = Number(val);
                  if (minVal > maxVal) minVal = maxVal;
                  onChange({ ...formData, min_points: minVal });
                }
              }}
              className={ADMIN_INPUT_CLASS}
              placeholder="Batas minimum"
            />
            {formData.max_points !== '' && Number(formData.min_points) > Number(formData.max_points) && (
              <p className={ADMIN_FORM_ERROR_CLASS}>Min Points tidak boleh lebih dari Max Points</p>
            )}
          </div>
          <div className={ADMIN_FORM_FIELD_CLASS}>
            <Label htmlFor="decay_per_solve" className="text-xs">Decay/Solve</Label>
            <Input
              id="decay_per_solve"
              type="number"
              min={0}
              value={formData.decay_per_solve === undefined || formData.decay_per_solve === null ? '' : formData.decay_per_solve}
              onChange={e => {
                let val = e.target.value.replace(/^0+(?=\d)/, '');
                if (val === '') {
                  onChange({ ...formData, decay_per_solve: '' });
                } else {
                  onChange({ ...formData, decay_per_solve: Number(val) });
                }
              }}
              className={ADMIN_INPUT_CLASS}
              placeholder="Turun tiap solve"
            />
          </div>
        </div>
      )}
    </div>
  )
}
