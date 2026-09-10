import React, { useState } from 'react';
import { Worker } from '../types';
import { workAllocationService } from '../services/workAllocationService';
import { COOPERATIVE_AREAS, SERVICE_CATEGORIES } from '../data/demandHistory';
import { X, UserPlus, ShieldCheck, Check, AlertCircle, Phone, MapPin, Award } from 'lucide-react';

interface RegisterWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerAdded: () => void;
}

export const RegisterWorkerModal: React.FC<RegisterWorkerModalProps> = ({
  isOpen,
  onClose,
  onWorkerAdded
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [serviceArea, setServiceArea] = useState(COOPERATIVE_AREAS[0].name);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([SERVICE_CATEGORIES[0]]);
  const [customSkill, setCustomSkill] = useState('');
  const [certification, setCertification] = useState('National Skill Development Corp (NSDC) Certified');
  const [rating, setRating] = useState<number>(4.6);
  const [availableHours, setAvailableHours] = useState<number>(8);
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(0);
  const [weeklyJobs, setWeeklyJobs] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Worker name is required.' });
      return;
    }
    if (selectedSkills.length === 0) {
      setFeedback({ type: 'error', message: 'Select at least one trade skill.' });
      return;
    }

    const areaMatch = COOPERATIVE_AREAS.find(a => a.name === serviceArea) || COOPERATIVE_AREAS[0];
    // Deterministic hub offset based on worker name character codes
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const latitude = areaMatch.lat + (((charSum % 100) - 50) / 100) * 0.012;
    const longitude = areaMatch.lng + ((((charSum * 7) % 100) - 50) / 100) * 0.012;

    await workAllocationService.addWorker({
      name: name.trim(),
      avatar: avatar.trim() || undefined,
      phone: phone.trim() || '+91 98000 00000',
      serviceArea,
      skills: selectedSkills,
      certifications: [certification, 'Cooperative Safety Verified'],
      rating: Math.min(5.0, Math.max(1.0, rating)),
      reviewCount: 12,
      latitude,
      longitude,
      availability: 'available',
      availableHours,
      activeJobs: 0,
      weeklyJobs,
      weeklyEarnings,
      totalJobs: weeklyJobs,
      verified: true
    });

    onWorkerAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Register Cooperative Trade Worker</h3>
              <p className="text-xs text-slate-500">
                Onboard a certified local service professional into SahakarGig
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-b border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Profile Photo / Avatar Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or leave blank for auto initials"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Contact Phone</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 pl-8 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cooperative Hub / District</label>
              <select
                value={serviceArea}
                onChange={e => setServiceArea(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {COOPERATIVE_AREAS.map(a => (
                  <option key={a.id} value={a.name}>{a.name} ({a.zone})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Trade Skills & Qualifications *</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SERVICE_CATEGORIES.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-md text-2xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{skill}
                  </button>
                );
              })}
            </div>
            <div className="flex space-x-1.5">
              <input
                type="text"
                placeholder="Or type custom specialization..."
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Add Skill
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Certification / Accreditation</label>
            <div className="relative">
              <input
                type="text"
                value={certification}
                onChange={e => setCertification(e.target.value)}
                className="w-full text-xs px-3 py-2 pl-8 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <Award className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="text-2xs font-semibold text-slate-600 block mb-1">Initial Rating</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={rating}
                onChange={e => setRating(parseFloat(e.target.value) || 4.5)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-slate-600 block mb-1">Weekly Jobs Done</label>
              <input
                type="number"
                min="0"
                max="50"
                value={weeklyJobs}
                onChange={e => setWeeklyJobs(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-slate-600 block mb-1">Weekly Earnings (₹)</label>
              <input
                type="number"
                min="0"
                max="50000"
                step="100"
                value={weeklyEarnings}
                onChange={e => setWeeklyEarnings(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-2xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cooperative Verified Status Enabled</span>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
              >
                Register Worker
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
