import React, { useState } from 'react';
import { demandForecastService } from '../services/demandForecastService';
import { COOPERATIVE_AREAS, SERVICE_CATEGORIES } from '../data/demandHistory';
import { DemandRecord } from '../types';
import {
  X,
  Plus,
  Upload,
  Download,
  Trash2,
  RotateCcw,
  Database,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Calendar,
  Layers
} from 'lucide-react';

interface ManageDemandDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated: () => void;
}

export const ManageDemandDataModal: React.FC<ManageDemandDataModalProps> = ({
  isOpen,
  onClose,
  onDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'import'>('view');
  const [records, setRecords] = useState<DemandRecord[]>(() => demandForecastService.getDemandHistory());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Record Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formService, setFormService] = useState(SERVICE_CATEGORIES[0]);
  const [formLocation, setFormLocation] = useState(COOPERATIVE_AREAS[0].name);
  const [formRequests, setFormRequests] = useState<number>(15);
  const [formCompleted, setFormCompleted] = useState<number>(13);
  const [formResponseTime, setFormResponseTime] = useState<number>(25);
  const [formWeather, setFormWeather] = useState('Clear');

  // CSV Import State
  const [csvText, setCsvText] = useState('');

  if (!isOpen) return null;

  const refreshData = () => {
    const updated = demandForecastService.getDemandHistory();
    setRecords(updated);
    onDataUpdated();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRequests <= 0) {
      showNotification('error', 'Request count must be greater than 0.');
      return;
    }

    const d = new Date(formDate);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = dayNames[isNaN(d.getDay()) ? 1 : d.getDay()];
    const isHolidayOrWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';

    demandForecastService.addDemandRecord({
      date: formDate,
      dayOfWeek,
      service: formService,
      location: formLocation,
      requests: formRequests,
      completed: Math.min(formRequests, formCompleted),
      cancelled: Math.max(0, formRequests - formCompleted),
      avgResponseTimeMinutes: formResponseTime,
      isHolidayOrWeekend,
      weatherCondition: formWeather
    });

    refreshData();
    showNotification('success', `Recorded ${formRequests} ${formService} requests in ${formLocation}.`);
    setActiveTab('view');
  };

  const handleDeleteRecord = (id: string) => {
    demandForecastService.deleteDemandRecord(id);
    refreshData();
    showNotification('success', 'Record removed from live database.');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all demand history records? The forecasting engine will run on a completely clean slate.')) {
      demandForecastService.clearAllDemandRecords();
      refreshData();
      showNotification('success', 'All demand history records cleared. Ready for live data input.');
    }
  };

  const handleResetToBaseline = () => {
    demandForecastService.resetToBaseline();
    refreshData();
    showNotification('success', 'Restored cooperative baseline records.');
  };

  const handleExportCSV = () => {
    const csvContent = demandForecastService.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sahakargig_demand_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleCSV = () => {
    const sample = `date,dayOfWeek,service,location,requests,completed,cancelled,avgResponseTimeMinutes,weatherCondition
2026-09-01,Tue,Plumbing,Area A - Indiranagar,24,22,2,20,Clear
2026-09-02,Wed,Electrical,Area B - Koramangala,18,17,1,25,Cloudy
2026-09-03,Thu,Cleaning,Area C - Whitefield,15,14,1,28,Rainy`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_demand_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessCSV = () => {
    if (!csvText.trim()) {
      showNotification('error', 'Please paste CSV content or upload a file first.');
      return;
    }

    const res = demandForecastService.importFromCSV(csvText);
    if (res.imported > 0) {
      refreshData();
      showNotification('success', `Successfully imported ${res.imported} live demand records!`);
      setCsvText('');
      setActiveTab('view');
    } else {
      showNotification('error', res.errors.join(' '));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Live Demand Data Management</h3>
              <p className="text-xs text-slate-500">
                Log real-world customer service requests, import CSV logs, or maintain operational datasets
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

        {/* Action Tabs & Top Bar */}
        <div className="px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'view' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Records ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                activeTab === 'add' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Log Single Record</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                activeTab === 'import' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import CSV / File</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
              title="Download entire dataset as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleResetToBaseline}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center space-x-1 cursor-pointer"
              title="Reload baseline starter records"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Seed Baseline</span>
            </button>
            <button
              onClick={handleClearAll}
              disabled={records.length === 0}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
              title="Clear all records to start completely blank"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'view' && (
            <div className="space-y-4">
              {records.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Database is Empty</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    There are currently no logged demand records. You can log real service requests, upload your cooperative CSV, or load baseline starter data.
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Log First Service Record
                    </button>
                    <button
                      onClick={handleResetToBaseline}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Seed Baseline Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-[420px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Service</th>
                          <th className="py-2.5 px-3">Location</th>
                          <th className="py-2.5 px-3 text-right">Requests</th>
                          <th className="py-2.5 px-3 text-right">Completed</th>
                          <th className="py-2.5 px-3 text-right">Avg Response</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                        {records.slice(0, 100).map(rec => (
                          <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 whitespace-nowrap text-slate-500">
                              {rec.date} ({rec.dayOfWeek})
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{rec.service}</td>
                            <td className="py-2 px-3 text-slate-600">{rec.location}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">{rec.requests}</td>
                            <td className="py-2 px-3 text-right text-emerald-700 font-medium">{rec.completed}</td>
                            <td className="py-2 px-3 text-right text-slate-500">{rec.avgResponseTimeMinutes}m</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => handleDeleteRecord(rec.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {records.length > 100 && (
                    <div className="p-2 text-center text-2xs text-slate-500 bg-slate-50 border-t border-slate-200">
                      Showing first 100 of {records.length} records.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <form onSubmit={handleAddRecord} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Service Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Service Category</label>
                  <select
                    value={formService}
                    onChange={e => setFormService(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {SERVICE_CATEGORIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Cooperative Hub / Location</label>
                  <select
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {COOPERATIVE_AREAS.map(a => (
                      <option key={a.id} value={a.name}>{a.name} ({a.zone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Customer Requests Count</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={formRequests}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setFormRequests(val);
                      if (formCompleted > val) setFormCompleted(val);
                    }}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Completed Jobs Count</label>
                  <input
                    type="number"
                    min={0}
                    max={formRequests}
                    value={formCompleted}
                    onChange={e => setFormCompleted(parseInt(e.target.value, 10) || 0)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Avg Response Time (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formResponseTime}
                    onChange={e => setFormResponseTime(parseInt(e.target.value, 10) || 25)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Weather Condition</label>
                  <select
                    value={formWeather}
                    onChange={e => setFormWeather(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Clear">Clear / Normal</option>
                    <option value="Rainy">Rainy (Increases Plumbing Demand)</option>
                    <option value="Thunderstorm">Thunderstorm (Increases Electrical Demand)</option>
                    <option value="Hot/Summer">Hot/Summer (Increases AC Servicing)</option>
                    <option value="Festival/Holiday">Festival/Holiday</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save Record to Database
                </button>
              </div>
            </form>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">CSV Header Specification</span>
                  <button
                    onClick={handleDownloadSampleCSV}
                    className="text-2xs font-bold text-emerald-700 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Sample Template</span>
                  </button>
                </div>
                <code className="block bg-white p-2 rounded border border-slate-200 font-mono text-2xs text-slate-800 overflow-x-auto">
                  date,dayOfWeek,service,location,requests,completed,cancelled,avgResponseTimeMinutes,weatherCondition
                </code>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Upload CSV File or Paste Raw CSV
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer mb-3"
                />
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="Paste CSV rows here..."
                  className="w-full text-xs px-3 py-2 font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessCSV}
                  disabled={!csvText.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-40 cursor-pointer"
                >
                  Process & Import Records
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
