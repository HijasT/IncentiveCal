'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Alert, Modal } from '@/components/common';
import { configManager, Tier } from '@/lib';
import { Plus, Trash2, Download, Upload, RotateCcw } from 'lucide-react';

interface TierForm {
  name: string;
  min: string;
  max: string;
  rate: string;
}

export default function SettingsPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [defaultSplit, setDefaultSplit] = useState(60);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TierForm>({
    name: '',
    min: '',
    max: '',
    rate: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const config = configManager.getConfig();
      setTiers(config.tiers);
      setDefaultSplit(config.defaultSplit.equal);
    } catch (err) {
      setError('Failed to load configuration');
    }
  };

  const handleAddTier = () => {
    setFormData({ name: '', min: '', max: '', rate: '' });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleEditTier = (tier: Tier) => {
    setFormData({
      name: tier.name,
      min: tier.min.toString(),
      max: tier.max === null ? '' : tier.max.toString(),
      rate: tier.rate.toString(),
    });
    setEditingId(tier.id);
    setIsEditing(true);
  };

  const handleSaveTier = () => {
    if (!formData.name || !formData.min || !formData.rate) {
      setError('Name, min, and rate are required');
      return;
    }

    const min = parseFloat(formData.min);
    const max = formData.max ? parseFloat(formData.max) : null;
    const rate = parseFloat(formData.rate);

    if (isNaN(min) || (max !== null && isNaN(max)) || isNaN(rate)) {
      setError('Please enter valid numbers');
      return;
    }

    if (max !== null && min >= max) {
      setError('Min must be less than max');
      return;
    }

    let newTiers = [...tiers];

    if (editingId) {
      newTiers = newTiers.map((t) =>
        t.id === editingId
          ? { ...t, name: formData.name, min, max, rate }
          : t
      );
    } else {
      const newTier: Tier = {
        id: `tier-${Date.now()}`,
        name: formData.name,
        min,
        max,
        rate,
      };
      newTiers.push(newTier);
    }

    const validation = configManager.validateTiers(newTiers);
    if (validation.length > 0) {
      setError(validation.join(', '));
      return;
    }

    setTiers(newTiers);
    configManager.updateTiers(newTiers);
    setMessage(editingId ? 'Tier updated successfully' : 'Tier added successfully');
    setIsEditing(false);
    setError('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteTier = (id: string) => {
    const newTiers = tiers.filter((t) => t.id !== id);
    setTiers(newTiers);
    configManager.updateTiers(newTiers);
    setMessage('Tier deleted successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSplitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setDefaultSplit(value);
    configManager.updateConfig({ defaultSplit: { equal: value, personal: 100 - value } });
    setMessage('Default split updated');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExport = () => {
    try {
      const json = configManager.exportAsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sic-config-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Configuration exported');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to export configuration');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const result = configManager.importFromJSON(json);
        if (result.success) {
          loadConfig();
          setMessage('Configuration imported successfully');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setError(result.error || 'Failed to import configuration');
        }
      } catch (err) {
        setError('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default configuration?')) {
      configManager.resetToDefaults();
      loadConfig();
      setMessage('Reset to default configuration');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {message && (
        <Alert type="success" onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Current Split */}
      <Card title="⚖️ Default P1/P2 Split" icon="📊">
        <div className="space-y-4">
          <div>
            <label className="label-text">
              Equal Share (P1): {defaultSplit}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={defaultSplit}
              onChange={handleSplitChange}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Personal Share (P2): {100 - defaultSplit}%
            </p>
          </div>
        </div>
      </Card>

      {/* Tier Management */}
      <Card title="🎯 Tier Configuration" icon="⚙️">
        <div className="space-y-4">
          <Button
            onClick={handleAddTier}
            variant="primary"
            icon="➕"
            className="w-full"
          >
            Add New Tier
          </Button>

          {tiers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Min %</th>
                    <th className="text-left py-2 px-2">Max %</th>
                    <th className="text-left py-2 px-2">Rate %</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => (
                    <tr
                      key={tier.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-3 px-2">{tier.name}</td>
                      <td className="py-3 px-2">{tier.min}%</td>
                      <td className="py-3 px-2">
                        {tier.max === null ? '∞' : `${tier.max}%`}
                      </td>
                      <td className="py-3 px-2 font-semibold text-green-600 dark:text-green-400">
                        {tier.rate}%
                      </td>
                      <td className="py-3 px-2 flex gap-2">
                        <button
                          onClick={() => handleEditTier(tier)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Tier Editor Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={editingId ? 'Edit Tier' : 'Add New Tier'}
      >
        <div className="space-y-4">
          <Input
            label="Tier Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Tier 1, Bronze"
          />

          <Input
            label="Minimum Achievement %"
            type="number"
            value={formData.min}
            onChange={(e) =>
              setFormData({ ...formData, min: e.target.value })
            }
            placeholder="e.g., 75"
          />

          <Input
            label="Maximum Achievement % (leave blank for no limit)"
            type="number"
            value={formData.max}
            onChange={(e) =>
              setFormData({ ...formData, max: e.target.value })
            }
            placeholder="e.g., 100"
          />

          <Input
            label="Incentive Rate %"
            type="number"
            value={formData.rate}
            onChange={(e) =>
              setFormData({ ...formData, rate: e.target.value })
            }
            placeholder="e.g., 2.5"
            step="0.1"
          />

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSaveTier}
              variant="primary"
              className="flex-1"
            >
              Save Tier
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import/Export & Reset */}
      <Card title="💾 Backup & Recovery" icon="🔄">
        <div className="space-y-3">
          <Button
            onClick={handleExport}
            variant="primary"
            icon="⬇️"
            className="w-full"
          >
            Export Configuration as JSON
          </Button>

          <div>
            <label className="block text-sm font-medium mb-2">
              Import Configuration
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
            />
          </div>

          <Button
            onClick={handleReset}
            variant="secondary"
            icon="🔄"
            className="w-full"
          >
            Reset to Default Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
}
