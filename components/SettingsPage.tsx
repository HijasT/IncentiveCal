'use client';

import { useState } from 'react';
import { Card, Button, Input, Alert, Modal } from '@/components/common';
import { configManager, formatPercentage } from '@/lib';
import { Tier } from '@/lib/configManager';

export default function SettingsPage() {
  const [config, setConfig] = useState(configManager.getConfig());
  const [splitEqual, setSplitEqual] = useState(config.defaultSplit.equal);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [jsonInput, setJsonInput] = useState('');

  const handleAddTier = () => {
    const newTier: Tier = {
      id: `tier_${Date.now()}`,
      name: `Tier ${config.tiers.length + 1}`,
      min: 0,
      max: 100,
      rate: 2.5,
    };
    setEditingTier(newTier);
    setShowModal(true);
  };

  const handleEditTier = (tier: Tier) => {
    setEditingTier(tier);
    setShowModal(true);
  };

  const handleSaveTier = () => {
    if (!editingTier) return;

    let updatedTiers: Tier[];
    if (config.tiers.find((t) => t.id === editingTier.id)) {
      updatedTiers = config.tiers.map((t) => (t.id === editingTier.id ? editingTier : t));
    } else {
      updatedTiers = [...config.tiers, editingTier];
    }

    const validation = configManager.validateTiers(updatedTiers);
    if (!validation.length) {
      const newConfig = {
        ...config,
        tiers: updatedTiers,
        defaultSplit: { equal: splitEqual, personal: 100 - splitEqual },
      };
      configManager.updateConfig(newConfig);
      setConfig(newConfig);
      setShowModal(false);
      setEditingTier(null);
      setMessage('Tier saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`Validation error: ${validation.join(', ')}`);
    }
  };

  const handleDeleteTier = (tierId: string) => {
    if (config.tiers.length <= 1) {
      setMessage('Must keep at least one tier');
      return;
    }

    const updatedTiers = config.tiers.filter((t) => t.id !== tierId);
    const newConfig = {
      ...config,
      tiers: updatedTiers,
    };
    configManager.updateConfig(newConfig);
    setConfig(newConfig);
    setMessage('Tier deleted');
  };

  const handleReset = () => {
    if (confirm('Are you sure? This will reset to default tiers.')) {
      configManager.resetToDefaults();
      setConfig(configManager.getConfig());
      setSplitEqual(configManager.getConfig().defaultSplit.equal);
      setMessage('Reset to defaults');
    }
  };

  const handleExport = () => {
    const json = configManager.exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sic-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setMessage('Configuration exported!');
  };

  const handleImport = () => {
    try {
      const result = configManager.importFromJSON(jsonInput);
      if (result.success) {
        setConfig(configManager.getConfig());
        setJsonInput('');
        setImportError('');
        setMessage('Configuration imported successfully!');
      } else {
        setImportError(result.error || 'Import failed');
      }
    } catch (err) {
      setImportError(`Error: ${err}`);
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

      {/* Tier Configuration */}
      <Card title="⚙️ Tier Configuration" icon="🎯">
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={handleAddTier} variant="success" icon="➕">
              Add Tier
            </Button>
            <Button onClick={handleExport} variant="secondary" icon="📥">
              Export
            </Button>
            <Button onClick={handleReset} variant="danger" icon="🔄">
              Reset
            </Button>
          </div>

          {/* Tiers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-3">Name</th>
                  <th className="text-center py-3 px-3">Min %</th>
                  <th className="text-center py-3 px-3">Max %</th>
                  <th className="text-center py-3 px-3">Rate %</th>
                  <th className="text-center py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {config.tiers.map((tier) => (
                  <tr key={tier.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-3 font-semibold">{tier.name}</td>
                    <td className="py-3 px-3 text-center">{tier.min}%</td>
                    <td className="py-3 px-3 text-center">{tier.max ?? '∞'}%</td>
                    <td className="py-3 px-3 text-center font-bold text-teal-600 dark:text-teal-400">
                      {tier.rate}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditTier(tier)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 font-semibold"
                          disabled={config.tiers.length === 1}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Default Settings */}
      <Card title="🔧 Default Settings" icon="⚙️">
        <div>
          <label className="label-text">
            Default P1 Split: {splitEqual}% / P2: {100 - splitEqual}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={splitEqual}
            onChange={(e) => setSplitEqual(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Updated default split for new calculations.
          </p>
          <Button
            onClick={() => {
              configManager.updateConfig({
                ...config,
                defaultSplit: { equal: splitEqual, personal: 100 - splitEqual },
              });
              setMessage('Default split updated!');
            }}
            variant="primary"
            size="sm"
            className="mt-3"
          >
            Save Split
          </Button>
        </div>
      </Card>

      {/* Import/Export */}
      <Card title="📦 Import/Export Configuration" icon="🔄">
        <div className="space-y-4">
          <div>
            <label className="label-text">Export Configuration</label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Download your tier configuration as JSON for backup or sharing.
            </p>
            <Button onClick={handleExport} variant="secondary" icon="📥" className="w-full">
              Download as JSON
            </Button>
          </div>

          <div className="border-t border-slate-200 dark:border-gray-700 pt-4">
            <label className="label-text">Import Configuration</label>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Paste a previously exported JSON configuration to restore settings.
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON configuration here..."
              className="input-field mb-2 font-mono text-xs"
              rows={5}
            />
            {importError && (
              <Alert type="error" title="Import Error" onClose={() => setImportError('')}>
                {importError}
              </Alert>
            )}
            <Button onClick={handleImport} variant="primary" icon="📤" className="w-full">
              Import Configuration
            </Button>
          </div>
        </div>
      </Card>

      {/* Tier Editor Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTier(null);
        }}
        title={editingTier?.id.startsWith('tier_') && !config.tiers.find((t) => t.id === editingTier.id) ? 'Add New Tier' : 'Edit Tier'}
        size="md"
      >
        {editingTier && (
          <div className="space-y-4">
            <Input
              label="Tier Name"
              value={editingTier.name}
              onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value })}
              placeholder="e.g., Tier 1"
            />
            <Input
              label="Minimum Achievement %"
              type="number"
              value={editingTier.min}
              onChange={(e) => setEditingTier({ ...editingTier, min: parseInt(e.target.value) })}
              min="0"
              max="100"
            />
            <Input
              label="Maximum Achievement % (leave empty for no limit)"
              type="number"
              value={editingTier.max ?? ''}
              onChange={(e) => setEditingTier({ ...editingTier, max: e.target.value ? parseInt(e.target.value) : null })}
              min="0"
              max="100"
            />
            <Input
              label="Incentive Rate %"
              type="number"
              value={editingTier.rate}
              onChange={(e) => setEditingTier({ ...editingTier, rate: parseFloat(e.target.value) })}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        )}
        footer={
          <>
            <Button
              onClick={() => {
                setShowModal(false);
                setEditingTier(null);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTier} variant="primary">
              Save Tier
            </Button>
          </>
        }
      />
    </div>
  );
}
